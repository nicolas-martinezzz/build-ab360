<?php
declare(strict_types=1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = ["https://yutopias.com", "https://staging.yutopias.com"];
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: https://yutopias.com");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

// ─── Origin validation ────────────────────────────────────────────────────────
$requestOrigin = $_SERVER["HTTP_ORIGIN"] ?? $_SERVER["HTTP_REFERER"] ?? "";
$validOrigin = false;
foreach ($allowedOrigins as $o) {
    if (strpos($requestOrigin, $o) === 0) { $validOrigin = true; break; }
}
if (!$validOrigin) {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden"]);
    exit;
}

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
    exit;
}

$rawBody = file_get_contents("php://input");
$payload = json_decode($rawBody ?: "{}", true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid payload"]);
    exit;
}

$action = (string)($payload["action"] ?? "");
if ($action === "") {
    http_response_code(400);
    echo json_encode(["message" => "Missing action"]);
    exit;
}

$configPath = getenv("NEWSLETTER_CONFIG_FILE") ?: dirname(dirname(__DIR__)) . "/private/newsletter-config.php";
$config = [];
if (is_file($configPath)) {
    $loaded = require $configPath;
    if (is_array($loaded)) {
        $config = $loaded;
    }
}

$dbHost     = (string)($config["db_host"]     ?? getenv("NEWSLETTER_DB_HOST")     ?? "");
$dbPort     = (int)   ($config["db_port"]     ?? getenv("NEWSLETTER_DB_PORT")     ?? 3306);
$dbName     = (string)($config["db_name"]     ?? getenv("NEWSLETTER_DB_NAME")     ?? "");
$dbUser     = (string)($config["db_user"]     ?? getenv("NEWSLETTER_DB_USER")     ?? "");
$dbPassword = (string)($config["db_password"] ?? getenv("NEWSLETTER_DB_PASSWORD") ?? "");
$ipSalt     = (string)($config["ip_salt"]     ?? getenv("NEWSLETTER_IP_SALT")     ?? "");
if ($ipSalt === "") {
    http_response_code(500);
    echo json_encode(["message" => "Server misconfiguration"]);
    exit;
}

if ($dbHost === "" || $dbName === "" || $dbUser === "" || $dbPassword === "") {
    http_response_code(500);
    echo json_encode(["message" => "Diagnostic database is not configured"]);
    exit;
}

// Valid profile slugs. "pending" is the initial value when a session is created
// at prelead — before the user picks their actual profile in step 2.
$allowedProfiles = [
    "pending",
    "promotor_inversor",
    "direccion",
    "estudios_constructor",
    "delegado_pm",
    "arquitecto_ingeniero",
    "otro",
];
$allowedDimensions = ["A", "B", "C", "D"];
const TOTAL_QUESTIONS = 12;

// Rate-limit window: max requests per IP hash within the window (seconds).
const RATE_LIMIT_MAX     = 60;
const RATE_LIMIT_WINDOW  = 60; // seconds

$ip      = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? ($_SERVER["REMOTE_ADDR"] ?? "");
$ipFirst = trim(explode(",", (string)$ip)[0]);
$ipHash  = $ipFirst !== "" ? hash("sha256", $ipFirst . ":" . $ipSalt) : null;
$userAgent = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);

// ─── helpers ──────────────────────────────────────────────────────────────────

function validSessionId(string $id): bool {
    return $id !== "" && preg_match('/^[a-zA-Z0-9-]{10,64}$/', $id) === 1;
}

function generateSessionId(): string {
    return "diag-" . bin2hex(random_bytes(12));
}

// ─── DB connect ───────────────────────────────────────────────────────────────

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // ─── rate limiting ────────────────────────────────────────────────────────
    // Uses diagnostic_sessions to count requests per ip_hash in the last window.
    // Relies on the table already existing (created by db-reset-staging.sql).
    // On the very first request ever (table missing) we skip rate limiting
    // gracefully so the bootstrap still works.
    if ($ipHash !== null) {
        try {
            $rlStmt = $pdo->prepare("
                SELECT COUNT(*) AS cnt
                FROM diagnostic_sessions
                WHERE ip_hash = :ip_hash
                  AND created_at >= DATE_SUB(NOW(), INTERVAL :window SECOND)
            ");
            $rlStmt->execute([":ip_hash" => $ipHash, ":window" => RATE_LIMIT_WINDOW]);
            $rlRow = $rlStmt->fetch();
            if ((int)($rlRow["cnt"] ?? 0) >= RATE_LIMIT_MAX) {
                http_response_code(429);
                echo json_encode(["message" => "Too many requests"]);
                exit;
            }
        } catch (Throwable $ignored) {
            // Table not yet created — skip rate limiting on bootstrap.
        }
    }

    // ─── bootstrap: create tables if they don't exist ─────────────────────────
    // This only fires once per environment (IF NOT EXISTS makes subsequent
    // calls a no-op). For production, prefer running db-reset-staging.sql
    // manually and removing this block.

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS diagnostic_sessions (
            id           VARCHAR(64)  NOT NULL,
            locale       VARCHAR(8)   NOT NULL,
            profile      VARCHAR(64)  NOT NULL DEFAULT 'pending',
            source       VARCHAR(64)  NOT NULL DEFAULT 'autodiagnostico',
            ip_hash      VARCHAR(64)  NULL,
            user_agent   VARCHAR(255) NULL,
            status       ENUM('lead_captured','started','completed') NOT NULL DEFAULT 'started',
            created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP    NULL     DEFAULT NULL,
            PRIMARY KEY (id),
            KEY idx_sessions_created (created_at),
            KEY idx_sessions_status  (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS diagnostic_answers (
            id             BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
            session_id     VARCHAR(64)      NOT NULL,
            question_index TINYINT UNSIGNED NOT NULL COMMENT '0-based, max " . (TOTAL_QUESTIONS - 1) . "',
            dimension      CHAR(1)          NOT NULL COMMENT 'A|B|C|D',
            option_index   TINYINT UNSIGNED NOT NULL COMMENT '0-3',
            option_score   TINYINT UNSIGNED NOT NULL COMMENT '0|30|70|100',
            created_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_answer (session_id, question_index),
            KEY idx_answers_session (session_id),
            CONSTRAINT fk_answers_session
                FOREIGN KEY (session_id) REFERENCES diagnostic_sessions (id)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS diagnostic_results (
            session_id      VARCHAR(64)      NOT NULL,
            profile         VARCHAR(64)      NOT NULL DEFAULT 'unknown',
            weighted_score  TINYINT UNSIGNED NOT NULL COMMENT '0-100',
            score_over_10   DECIMAL(3,1)     NOT NULL COMMENT '0.0-10.0',
            score_a         TINYINT UNSIGNED NULL     COMMENT 'performance % dim A (high=good)',
            score_b         TINYINT UNSIGNED NULL     COMMENT 'performance % dim B',
            score_c         TINYINT UNSIGNED NULL     COMMENT 'performance % dim C',
            score_d         TINYINT UNSIGNED NULL     COMMENT 'performance % dim D',
            top_reto_1      VARCHAR(255)     NULL,
            top_reto_2      VARCHAR(255)     NULL,
            top_reto_3      VARCHAR(255)     NULL,
            summary_json    TEXT             NULL,
            updated_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (session_id),
            KEY idx_results_profile (profile),
            CONSTRAINT fk_results_session
                FOREIGN KEY (session_id) REFERENCES diagnostic_sessions (id)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS diagnostic_leads (
            session_id       VARCHAR(64)  NOT NULL,
            first_name       VARCHAR(120) NOT NULL,
            last_name        VARCHAR(120) NULL,
            company          VARCHAR(180) NOT NULL,
            role_name        VARCHAR(180) NULL,
            email            VARCHAR(255) NOT NULL,
            challenge_text   TEXT         NULL,
            privacy_accepted TINYINT(1)   NOT NULL DEFAULT 0,
            updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (session_id),
            KEY idx_leads_email (email),
            CONSTRAINT fk_leads_session
                FOREIGN KEY (session_id) REFERENCES diagnostic_sessions (id)
                ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ─── actions ──────────────────────────────────────────────────────────────

    // init — generates a server-side session ID and returns it to the client.
    // Must be the first call before any other action.
    if ($action === "init") {
        $locale = substr(trim((string)($payload["locale"] ?? "es")), 0, 8);
        $sessionId = generateSessionId();

        $pdo->prepare("
            INSERT INTO diagnostic_sessions (id, locale, profile, source, ip_hash, user_agent, status)
            VALUES (:id, :locale, 'pending', 'autodiagnostico', :ip_hash, :user_agent, 'started')
        ")->execute([
            ":id"         => $sessionId,
            ":locale"     => $locale,
            ":ip_hash"    => $ipHash,
            ":user_agent" => $userAgent !== "" ? $userAgent : null,
        ]);

        echo json_encode(["ok" => true, "sessionId" => $sessionId]);
        exit;
    }

    // prelead — step 1: save contact info and mark session as lead_captured.
    if ($action === "prelead") {
        $sessionId       = trim((string)($payload["sessionId"]      ?? ""));
        $locale          = substr(trim((string)($payload["locale"]   ?? "es")), 0, 8);
        $firstName       = substr(trim((string)($payload["firstName"] ?? "")), 0, 120);
        $company         = substr(trim((string)($payload["company"]  ?? "")), 0, 180);
        $email           = strtolower(substr(trim((string)($payload["email"] ?? "")), 0, 255));
        $privacyAccepted = (bool)($payload["privacyAccepted"] ?? false);

        if (!validSessionId($sessionId)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid session id"]);
            exit;
        }
        if ($firstName === "" || $company === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid lead payload"]);
            exit;
        }
        if (!$privacyAccepted) {
            http_response_code(400);
            echo json_encode(["message" => "Privacy consent required"]);
            exit;
        }

        $pdo->prepare("
            INSERT INTO diagnostic_sessions (id, locale, profile, source, ip_hash, user_agent, status)
            VALUES (:id, :locale, 'pending', 'autodiagnostico', :ip_hash, :user_agent, 'lead_captured')
            ON DUPLICATE KEY UPDATE
                locale     = VALUES(locale),
                status     = 'lead_captured',
                ip_hash    = VALUES(ip_hash),
                user_agent = VALUES(user_agent)
        ")->execute([
            ":id"         => $sessionId,
            ":locale"     => $locale,
            ":ip_hash"    => $ipHash,
            ":user_agent" => $userAgent !== "" ? $userAgent : null,
        ]);

        $pdo->prepare("
            INSERT INTO diagnostic_leads (session_id, first_name, company, email, privacy_accepted)
            VALUES (:session_id, :first_name, :company, :email, 1)
            ON DUPLICATE KEY UPDATE
                first_name       = VALUES(first_name),
                company          = VALUES(company),
                email            = VALUES(email),
                privacy_accepted = 1
        ")->execute([
            ":session_id" => $sessionId,
            ":first_name" => $firstName,
            ":company"    => $company,
            ":email"      => $email,
        ]);

        echo json_encode(["ok" => true, "sessionId" => $sessionId]);
        exit;
    }

    // start — step 2: user picked their profile.
    if ($action === "start") {
        $sessionId = trim((string)($payload["sessionId"] ?? ""));
        $locale    = substr(trim((string)($payload["locale"]  ?? "es")), 0, 8);
        $profile   = trim((string)($payload["profile"] ?? ""));

        if (!validSessionId($sessionId)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid session id"]);
            exit;
        }
        if (!in_array($profile, $allowedProfiles, true) || $profile === "pending") {
            http_response_code(400);
            echo json_encode(["message" => "Invalid profile"]);
            exit;
        }

        $pdo->prepare("
            INSERT INTO diagnostic_sessions (id, locale, profile, source, ip_hash, user_agent, status)
            VALUES (:id, :locale, :profile, 'autodiagnostico', :ip_hash, :user_agent, 'started')
            ON DUPLICATE KEY UPDATE
                locale     = VALUES(locale),
                profile    = VALUES(profile),
                status     = 'started',
                ip_hash    = VALUES(ip_hash),
                user_agent = VALUES(user_agent)
        ")->execute([
            ":id"         => $sessionId,
            ":locale"     => $locale,
            ":profile"    => $profile,
            ":ip_hash"    => $ipHash,
            ":user_agent" => $userAgent !== "" ? $userAgent : null,
        ]);

        echo json_encode(["ok" => true, "sessionId" => $sessionId]);
        exit;
    }

    // answer — fired once per question as the user navigates.
    if ($action === "answer") {
        $sessionId     = trim((string)($payload["sessionId"]     ?? ""));
        $questionIndex = (int)($payload["questionIndex"] ?? -1);
        $dimension     = trim((string)($payload["dimension"]     ?? ""));
        $optionIndex   = (int)($payload["optionIndex"]   ?? -1);
        $optionScore   = (int)($payload["optionScore"]   ?? -1);

        if (!validSessionId($sessionId) || $questionIndex < 0 || $questionIndex >= TOTAL_QUESTIONS) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid answer payload"]);
            exit;
        }
        if (!in_array($dimension, $allowedDimensions, true)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid dimension"]);
            exit;
        }
        if ($optionIndex < 0 || $optionIndex > 3 || !in_array($optionScore, [0, 30, 70, 100], true)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid answer values"]);
            exit;
        }

        $pdo->prepare("
            INSERT INTO diagnostic_answers (session_id, question_index, dimension, option_index, option_score)
            VALUES (:session_id, :question_index, :dimension, :option_index, :option_score)
            ON DUPLICATE KEY UPDATE
                dimension    = VALUES(dimension),
                option_index = VALUES(option_index),
                option_score = VALUES(option_score)
        ")->execute([
            ":session_id"     => $sessionId,
            ":question_index" => $questionIndex,
            ":dimension"      => $dimension,
            ":option_index"   => $optionIndex,
            ":option_score"   => $optionScore,
        ]);

        echo json_encode(["ok" => true]);
        exit;
    }

    // complete — called after last question and optionally again with bridge form lead.
    if ($action === "complete") {
        $sessionId     = trim((string)($payload["sessionId"]     ?? ""));
        $weightedScore = (int)($payload["weightedScore"] ?? -1);
        $scoreOver10   = (float)($payload["scoreOver10"] ?? -1);
        $topRetos      = $payload["topRetos"]  ?? [];
        $lead          = $payload["lead"]      ?? [];
        $summary       = $payload["summary"]   ?? [];

        if (!validSessionId($sessionId) || $weightedScore < 0 || $weightedScore > 100 || $scoreOver10 < 0 || $scoreOver10 > 10) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid completion payload"]);
            exit;
        }

        $reto1 = isset($topRetos[0]) ? substr(trim((string)$topRetos[0]), 0, 255) : null;
        $reto2 = isset($topRetos[1]) ? substr(trim((string)$topRetos[1]), 0, 255) : null;
        $reto3 = isset($topRetos[2]) ? substr(trim((string)$topRetos[2]), 0, 255) : null;

        $dimPerf = is_array($summary["dimensionPerformance"] ?? null) ? $summary["dimensionPerformance"] : [];
        $scoreA  = isset($dimPerf["A"]) ? max(0, min(100, (int)$dimPerf["A"])) : null;
        $scoreB  = isset($dimPerf["B"]) ? max(0, min(100, (int)$dimPerf["B"])) : null;
        $scoreC  = isset($dimPerf["C"]) ? max(0, min(100, (int)$dimPerf["C"])) : null;
        $scoreD  = isset($dimPerf["D"]) ? max(0, min(100, (int)$dimPerf["D"])) : null;
        $profile = substr(trim((string)($summary["profile"] ?? "")), 0, 64);
        if ($profile === "" || !in_array($profile, $allowedProfiles, true) || $profile === "pending") {
            $profile = "unknown";
        }

        $summaryJson = json_encode($summary, JSON_UNESCAPED_UNICODE);

        $pdo->prepare("
            INSERT INTO diagnostic_results
                (session_id, profile, weighted_score, score_over_10,
                 score_a, score_b, score_c, score_d,
                 top_reto_1, top_reto_2, top_reto_3, summary_json)
            VALUES
                (:session_id, :profile, :weighted_score, :score_over_10,
                 :score_a, :score_b, :score_c, :score_d,
                 :top_reto_1, :top_reto_2, :top_reto_3, :summary_json)
            ON DUPLICATE KEY UPDATE
                profile        = VALUES(profile),
                weighted_score = VALUES(weighted_score),
                score_over_10  = VALUES(score_over_10),
                score_a        = VALUES(score_a),
                score_b        = VALUES(score_b),
                score_c        = VALUES(score_c),
                score_d        = VALUES(score_d),
                top_reto_1     = VALUES(top_reto_1),
                top_reto_2     = VALUES(top_reto_2),
                top_reto_3     = VALUES(top_reto_3),
                summary_json   = VALUES(summary_json)
        ")->execute([
            ":session_id"     => $sessionId,
            ":profile"        => $profile,
            ":weighted_score" => $weightedScore,
            ":score_over_10"  => number_format($scoreOver10, 1, ".", ""),
            ":score_a"        => $scoreA,
            ":score_b"        => $scoreB,
            ":score_c"        => $scoreC,
            ":score_d"        => $scoreD,
            ":top_reto_1"     => ($reto1 !== "" && $reto1 !== null) ? $reto1 : null,
            ":top_reto_2"     => ($reto2 !== "" && $reto2 !== null) ? $reto2 : null,
            ":top_reto_3"     => ($reto3 !== "" && $reto3 !== null) ? $reto3 : null,
            ":summary_json"   => $summaryJson !== false ? $summaryJson : null,
        ]);

        // Bridge form lead — optional, submitted from the results screen.
        if (is_array($lead) && count($lead) > 0) {
            $firstName     = substr(trim((string)($lead["firstName"] ?? "")), 0, 120);
            $lastName      = substr(trim((string)($lead["lastName"]  ?? "")), 0, 120);
            $company       = substr(trim((string)($lead["company"]   ?? "")), 0, 180);
            $roleName      = substr(trim((string)($lead["role"]      ?? "")), 0, 180);
            $email         = strtolower(substr(trim((string)($lead["email"] ?? "")), 0, 255));
            $challengeText = trim((string)($lead["challenge"] ?? ""));

            if ($firstName !== "" && $company !== "" && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $pdo->prepare("
                    INSERT INTO diagnostic_leads
                        (session_id, first_name, last_name, company, role_name, email, challenge_text, privacy_accepted)
                    VALUES
                        (:session_id, :first_name, :last_name, :company, :role_name, :email, :challenge_text, 1)
                    ON DUPLICATE KEY UPDATE
                        first_name       = VALUES(first_name),
                        last_name        = VALUES(last_name),
                        company          = VALUES(company),
                        role_name        = VALUES(role_name),
                        email            = VALUES(email),
                        challenge_text   = VALUES(challenge_text),
                        privacy_accepted = 1
                ")->execute([
                    ":session_id"     => $sessionId,
                    ":first_name"     => $firstName,
                    ":last_name"      => $lastName      !== "" ? $lastName      : null,
                    ":company"        => $company,
                    ":role_name"      => $roleName      !== "" ? $roleName      : null,
                    ":email"          => $email,
                    ":challenge_text" => $challengeText !== "" ? $challengeText : null,
                ]);
            }
        }

        $pdo->prepare("
            UPDATE diagnostic_sessions
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ")->execute([":id" => $sessionId]);

        // ── Notification email ────────────────────────────────────────────────
        $appEnv   = strtolower(trim((string)($config["app_env"] ?? getenv("APP_ENV") ?? "staging")));
        $mailFrom = (string)($config["mail_from"] ?? getenv("NEWSLETTER_MAIL_FROM") ?? "no-reply@yutopias.com");

        $notifyRaw = $appEnv === "production"
            ? (string)($config["notify_to_prod"]    ?? getenv("NOTIFY_TO_PROD")    ?? "")
            : (string)($config["notify_to_staging"] ?? getenv("NOTIFY_TO_STAGING") ?? "");

        // Build recipient list — filter empty strings, validate each address.
        $recipients = array_filter(
            array_map("trim", explode(",", $notifyRaw)),
            fn($addr) => filter_var($addr, FILTER_VALIDATE_EMAIL) !== false
        );

        if (!empty($recipients)) {
            // Fetch all available lead data for this session.
            $leadRow = $pdo->prepare("
                SELECT first_name, last_name, company, role_name, email, challenge_text, privacy_accepted
                FROM diagnostic_leads WHERE session_id = :sid
            ");
            $leadRow->execute([":sid" => $sessionId]);
            $leadData = $leadRow->fetch() ?: [];

            // Fetch session metadata (locale, created_at, ip_hash).
            $sessRow = $pdo->prepare("
                SELECT locale, created_at, user_agent
                FROM diagnostic_sessions WHERE id = :sid
            ");
            $sessRow->execute([":sid" => $sessionId]);
            $sessData = $sessRow->fetch() ?: [];

            $leadFirstName    = $leadData["first_name"]  ?? "";
            $leadLastName     = $leadData["last_name"]   ?? "";
            $leadFullName     = trim("$leadFirstName $leadLastName") ?: "—";
            $leadCompany      = $leadData["company"]     ?? "—";
            $leadEmail        = $leadData["email"]       ?? "—";
            $leadRole         = $leadData["role_name"]   ?? "—";
            $leadChallenge    = $leadData["challenge_text"] ?? "";
            $sessLocale       = $sessData["locale"]      ?? "—";
            $sessCreatedAt    = $sessData["created_at"]  ?? "—";
            $sessUserAgent    = $sessData["user_agent"]  ?? "—";

            $dimensionLabels = ["A" => "Estrategia", "B" => "Procesos", "C" => "Personas", "D" => "Tecnología"];
            $dimensionColors = ["A" => "#127334", "B" => "#0e5fa3", "C" => "#7c3aed", "D" => "#b45309"];

            // Build dimension rows HTML
            $dimRowsHtml = "";
            foreach (["A" => $scoreA, "B" => $scoreB, "C" => $scoreC, "D" => $scoreD] as $dim => $val) {
                if ($val === null) continue;
                $label    = $dimensionLabels[$dim];
                $color    = $dimensionColors[$dim];
                $barWidth = (int)$val;
                $dimRowsHtml .= "
                <tr>
                  <td style='padding:8px 0;border-bottom:1px solid #f0f0f0;'>
                    <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                      <tr>
                        <td style='width:130px;vertical-align:middle;'>
                          <span style='display:inline-block;background:{$color}1a;color:{$color};font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:0.05em;'>{$dim} · {$label}</span>
                        </td>
                        <td style='vertical-align:middle;padding:0 12px;'>
                          <div style='background:#e8e8e8;border-radius:4px;height:8px;overflow:hidden;'>
                            <div style='background:{$color};height:8px;width:{$barWidth}%;border-radius:4px;'></div>
                          </div>
                        </td>
                        <td style='width:40px;text-align:right;vertical-align:middle;'>
                          <span style='font-size:13px;font-weight:700;color:{$color};'>{$val}%</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>";
            }

            // Build top retos HTML
            $retosHtml = "";
            foreach (array_filter([$reto1, $reto2, $reto3]) as $i => $reto) {
                $num = $i + 1;
                $retosHtml .= "
                <tr>
                  <td style='padding:8px 0;border-bottom:1px solid #f0f0f0;'>
                    <span style='display:inline-flex;align-items:center;gap:10px;'>
                      <span style='display:inline-block;background:#127334;color:#fff;font-size:11px;font-weight:700;width:20px;height:20px;border-radius:50%;text-align:center;line-height:20px;flex-shrink:0;'>{$num}</span>
                      <span style='font-size:14px;color:#1c1e2e;'>" . htmlspecialchars($reto) . "</span>
                    </span>
                  </td>
                </tr>";
            }

            $e    = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES, "UTF-8");
            $scoreFormatted = number_format($scoreOver10, 1);
            $challengeBlock = $leadChallenge !== ""
                ? "<tr><td style='padding:6px 0;font-size:13px;color:#555;'><strong style='color:#1c1e2e;'>Reto declarado:</strong> " . $e($leadChallenge) . "</td></tr>"
                : "";

            $subject = "[Yutopias] Nuevo diagnóstico — " . $e($leadFullName) . " · " . $e($leadCompany);

            $body = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1c1e2e 0%,#127334 100%);padding:32px 40px;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#7ed99a;">YŪTOPIAS SYSTEMS</p>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Nuevo diagnóstico completado</h1>
          <p style="margin:8px 0 0 0;font-size:13px;color:rgba(255,255,255,0.65);">' . $e($sessCreatedAt) . ' · Sesión ' . $e($sessionId) . '</p>
        </td>
      </tr>

      <!-- Score banner -->
      <tr>
        <td style="background:#f0f7ec;padding:20px 40px;border-bottom:1px solid #d8ecd8;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#127334;">Puntuación global</p>
                <p style="margin:0;font-size:32px;font-weight:700;color:#1c1e2e;line-height:1;">' . $weightedScore . '<span style="font-size:16px;font-weight:400;color:#666;">/100</span> &nbsp;<span style="font-size:20px;color:#127334;">' . $scoreFormatted . '<span style="font-size:13px;font-weight:400;color:#666;">/10</span></span></p>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-block;background:#127334;color:#fff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:0.05em;">' . strtoupper($e($profile)) . '</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr><td style="padding:32px 40px 0;">

        <!-- Contact -->
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#127334;border-bottom:2px solid #127334;padding-bottom:6px;">Datos de contacto</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr><td style="padding:5px 0;font-size:13px;color:#555;width:100px;"><strong style="color:#1c1e2e;">Nombre</strong></td><td style="padding:5px 0;font-size:13px;color:#1c1e2e;">' . $e($leadFullName) . '</td></tr>
          <tr><td style="padding:5px 0;font-size:13px;"><strong style="color:#1c1e2e;">Empresa</strong></td><td style="padding:5px 0;font-size:13px;color:#1c1e2e;">' . $e($leadCompany) . '</td></tr>
          <tr><td style="padding:5px 0;font-size:13px;"><strong style="color:#1c1e2e;">Email</strong></td><td style="padding:5px 0;font-size:13px;"><a href="mailto:' . $e($leadEmail) . '" style="color:#127334;text-decoration:none;">' . $e($leadEmail) . '</a></td></tr>
          <tr><td style="padding:5px 0;font-size:13px;"><strong style="color:#1c1e2e;">Cargo</strong></td><td style="padding:5px 0;font-size:13px;color:#1c1e2e;">' . $e($leadRole) . '</td></tr>
          ' . $challengeBlock . '
        </table>

        <!-- Dimensions -->
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#127334;border-bottom:2px solid #127334;padding-bottom:6px;">Rendimiento por dimensión</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          ' . $dimRowsHtml . '
        </table>

        <!-- Top retos -->
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#127334;border-bottom:2px solid #127334;padding-bottom:6px;">Top 3 prioridades de mejora</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          ' . $retosHtml . '
        </table>

      </td></tr>

      <!-- Footer -->
      <tr>
        <td style="background:#1c1e2e;padding:20px 40px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.45);text-align:center;">
            yūtopias systems · <a href="https://yutopias.com" style="color:#7ed99a;text-decoration:none;">yutopias.com</a> · Sesión: ' . $e($sessionId) . '
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>';

            // Send one mail() call per recipient — some servers reject multi-address To headers.
            // Subject: encode UTF-8 words so special chars don't break the header.
            $subjectEncoded = "=?UTF-8?B?" . base64_encode($subject) . "?=";
            foreach ($recipients as $recipient) {
                $headers = implode("\r\n", [
                    "From: =?UTF-8?B?" . base64_encode("Yutopias") . "?= <" . $mailFrom . ">",
                    "Reply-To: " . $mailFrom,
                    "MIME-Version: 1.0",
                    "Content-Type: text/html; charset=UTF-8",
                    "X-Mailer: Yutopias-Diagnostic/1.0",
                ]);
                mail($recipient, $subjectEncoded, $body, $headers);
            }
        }

        echo json_encode(["ok" => true]);
        exit;
    }

    http_response_code(400);
    echo json_encode(["message" => "Unknown action"]);

} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
