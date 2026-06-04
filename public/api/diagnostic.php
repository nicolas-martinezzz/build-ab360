<?php
declare(strict_types=1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = ["https://yutopias.com", "https://staging.yutopias.com"];

// Allow localhost origins when APP_ENV is local/development for email testing.
$localAppEnv = strtolower(trim((string)(getenv("APP_ENV") ?? "")));
if ($localAppEnv === "local" || $localAppEnv === "development") {
    $allowedOrigins[] = "http://localhost:3000";
    $allowedOrigins[] = "http://localhost:3001";
    $allowedOrigins[] = "http://127.0.0.1:3000";
}

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
        $rawSource = trim((string)($payload["source"] ?? "autodiagnostico"));
        $source = in_array($rawSource, ["autodiagnostico", "reserva-plaza"], true)
            ? $rawSource : "autodiagnostico";
        $sessionId = generateSessionId();

        $pdo->prepare("
            INSERT INTO diagnostic_sessions (id, locale, profile, source, ip_hash, user_agent, status)
            VALUES (:id, :locale, 'pending', :source, :ip_hash, :user_agent, 'started')
        ")->execute([
            ":id"         => $sessionId,
            ":locale"     => $locale,
            ":source"     => $source,
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

        // ── Send report emails when bridge-form lead is present ────────────────
        if (is_array($lead) && count($lead) > 0
            && isset($firstName) && $firstName !== ""
            && isset($email)     && filter_var($email, FILTER_VALIDATE_EMAIL)
            && $weightedScore >= 0
        ) {
            $notifyTo = (string)($config["notify_to_prod"] ?? getenv("NOTIFY_TO_PROD") ?? "");
            $mailFrom = (string)($config["mail_from"]      ?? getenv("NEWSLETTER_MAIL_FROM") ?? "no-reply@yutopias.com");

            $reportHtml = buildReportHtml([
                "firstName"            => $firstName,
                "lastName"             => $lastName  ?? "",
                "company"              => $company,
                "role"                 => $roleName  ?? "",
                "weightedScore"        => $weightedScore,
                "scoreOver10"          => $scoreOver10,
                "profile"              => $profile,
                "dimensionPerformance" => $dimPerf,
                "topRetoCodes"         => array_filter([$reto1, $reto2, $reto3]),
            ]);

            $sc       = number_format($scoreOver10, 1, ",", "");
            $safeName = htmlspecialchars($firstName, ENT_QUOTES, "UTF-8");
            $subjectUser = "=?UTF-8?B?" . base64_encode("Tu informe de diagnóstico digital · yūtopias systems") . "?=";
            $bodyUser = buildEmailBody($safeName, $sc, $reportHtml, true);

            $headersUser = implode("\r\n", [
                "MIME-Version: 1.0",
                "Content-Type: text/html; charset=UTF-8",
                "From: =?UTF-8?B?" . base64_encode("yūtopias systems") . "?= <{$mailFrom}>",
                "Reply-To: {$mailFrom}",
            ]);
            @mail($email, $subjectUser, $bodyUser, $headersUser);

            if ($notifyTo !== "") {
                $subjectInternal = "=?UTF-8?B?" . base64_encode("Nuevo diagnóstico completado · {$firstName} ({$company})") . "?=";
                $bodyInternal = buildInternalEmailBody($firstName, $lastName ?? "", $company, $roleName ?? "", $email, $sc, $weightedScore, $dimPerf, array_filter([$reto1, $reto2, $reto3]), $challengeText ?? "");
                $headersInternal = implode("\r\n", [
                    "MIME-Version: 1.0",
                    "Content-Type: text/html; charset=UTF-8",
                    "From: =?UTF-8?B?" . base64_encode("yūtopias · Diagnóstico") . "?= <{$mailFrom}>",
                    "Reply-To: {$email}",
                ]);
                foreach (array_filter(array_map("trim", explode(",", $notifyTo))) as $recipient) {
                    @mail($recipient, $subjectInternal, $bodyInternal, $headersInternal);
                }
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

// ─── Report & email builders ──────────────────────────────────────────────────

function he(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

function buildEmailBody(string $firstName, string $sc, string $reportHtml, bool $withReport): string {
    $report = $withReport ? '<tr><td style="padding-top:0;">' . $reportHtml . '</td></tr>' : '';
    return '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4F7F4;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7F4;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;">

  <!-- Eyebrow bar -->
  <tr><td style="background:#1B6B3A;border-radius:6px 6px 0 0;padding:14px 28px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">YŪTOPIAS SYSTEMS</p>
  </td></tr>

  <!-- Intro card -->
  <tr><td style="background:#ffffff;padding:32px 28px 28px;border-left:1px solid #DDE8DD;border-right:1px solid #DDE8DD;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#3AA76D;">Tu diagnóstico de madurez digital</p>
    <p style="margin:0 0 16px;font-size:22px;font-weight:600;line-height:1.3;color:#141B2E;">Hola ' . $firstName . ', aquí tienes tu informe.</p>
    <p style="margin:0 0 12px;font-size:15px;color:#4A5568;line-height:1.7;">Completaste el diagnóstico de madurez digital de yūtopias. Tu puntuación es <strong style="color:#141B2E;">' . $sc . '/10</strong>.</p>
    <p style="margin:0 0 28px;font-size:14px;color:#4A5568;line-height:1.7;">El informe completo está debajo — incluye tu análisis por bloques y las 3 prioridades de mejora. Puedes imprimirlo como PDF desde tu navegador.</p>
    <!-- CTAs -->
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background:#1B6B3A;border-radius:6px;mso-padding-alt:0;">
        <a href="https://yutopias.com/es/contact/" style="display:inline-block;padding:12px 22px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">Hablar con el equipo &rarr;</a>
      </td>
      <td style="padding-left:12px;">
        <a href="https://yutopias.com/es/solution/" style="display:inline-block;padding:11px 22px;font-size:13px;font-weight:600;color:#1B6B3A;text-decoration:none;border:1px solid #1B6B3A;border-radius:6px;">Ver SimuLab</a>
      </td>
    </tr></table>
  </td></tr>

  <!-- Divider -->
  <tr><td style="background:#ffffff;padding:0 28px;border-left:1px solid #DDE8DD;border-right:1px solid #DDE8DD;">
    <div style="height:1px;background:#E8EEE8;"></div>
  </td></tr>

  <!-- Report section label -->
  <tr><td style="background:#ffffff;padding:20px 28px 0;border-left:1px solid #DDE8DD;border-right:1px solid #DDE8DD;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#3AA76D;">Tu informe completo</p>
  </td></tr>

  ' . $report . '

  <!-- Footer -->
  <tr><td style="background:#F0F7F0;border:1px solid #DDE8DD;border-top:0;border-radius:0 0 6px 6px;padding:16px 28px;">
    <p style="margin:0;font-size:11px;color:#7A9A7A;line-height:1.6;">yūtopias systems &middot; <a href="https://yutopias.com" style="color:#1B6B3A;text-decoration:none;">yutopias.com</a><br>Recibiste este email porque completaste el diagnóstico de madurez digital.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>';
}

function buildReportHtml(array $d): string {
    $dims = [
        "A" => ["name" => "Decidir con datos",                  "short" => "Bloque I",   "color" => "#1B6B3A", "bg" => "#E8F3EA", "dark" => "#0D4A24"],
        "B" => ["name" => "Conocimiento del equipo",            "short" => "Bloque II",  "color" => "#2E9D4E", "bg" => "#E8F3EA", "dark" => "#1B6B3A"],
        "C" => ["name" => "Decisiones coordinadas",             "short" => "Bloque III", "color" => "#3AA76D", "bg" => "#EEF6EA", "dark" => "#216B47"],
        "D" => ["name" => "Visión en tiempo real de dirección", "short" => "Bloque IV",  "color" => "#6BC38C", "bg" => "#F0F7EC", "dark" => "#2E7D48"],
    ];

    $retos = [
        "01_1" => ["dim" => "A", "name" => "Análisis predictivo 360",              "sit" => "Los costes y el impacto ambiental se calculan por separado y de forma reactiva.",                                               "obj" => "Sincronizar ratios económicos y de sostenibilidad (CO₂, energía, agua) desde la ideación del activo."],
        "01_2" => ["dim" => "A", "name" => "Aprender de lo que ya has hecho",       "sit" => "Cada proyecto se presupuesta desde cero, ignorando la experiencia previa.",                                                     "obj" => "Validar la viabilidad de la inversión comparando automáticamente con el histórico de proyectos de la compañía."],
        "01_3" => ["dim" => "A", "name" => "Control preventivo de desvíos",         "sit" => "La detección de errores ocurre en el tajo, cuando el impacto económico ya es inevitable.",                                     "obj" => "Implementar alertas tempranas que detecten riesgos técnicos antes de que afecten al margen de ejecución."],
        "01_4" => ["dim" => "A", "name" => "Cumplimiento de Taxonomía EU",           "sit" => "El reporte ESG es un proceso manual, costoso y propenso a errores de auditoría.",                                              "obj" => "Automatizar la generación de indicadores técnicos (DNSH) y financieros (CapEx/OpEx) exigidos por la normativa europea."],
        "02_1" => ["dim" => "B", "name" => "Institucionalización del patrimonio de datos", "sit" => "El conocimiento reside en la memoria de técnicos clave; si ellos se van, la empresa se descapitaliza.",                 "obj" => "Estructurar el histórico de proyectos en un modelo semántico accesible para toda la organización."],
        "02_2" => ["dim" => "B", "name" => "Agilidad decisional con IA",             "sit" => "El análisis de pliegos y normativas consume semanas de trabajo manual de perfiles expertos.",                                  "obj" => "Emplear asistentes de IA para procesar documentación técnica y normativa en segundos, ganando velocidad competitiva."],
        "02_3" => ["dim" => "B", "name" => "Auditoría de desempeño",                 "sit" => "No existe un cierre de ciclo; los errores de presupuesto en la obra A se repiten en la oferta de la obra B.",                 "obj" => "Alimentar automáticamente las bases de precios futuras con los costes reales y lecciones aprendidas de las obras actuales."],
        "03_1" => ["dim" => "C", "name" => "Unidad de información — verdad única",   "sit" => "Propiedad, Arquitectura y Constructora manejan versiones de archivos distintas.",                                              "obj" => "Operar sobre un entorno de datos único donde cualquier cambio sea trazable para todos los agentes."],
        "03_2" => ["dim" => "C", "name" => "Escalabilidad operativa",                "sit" => "La calidad de la gestión varía según el equipo asignado al proyecto.",                                                         "obj" => "Homogeneizar los procesos mediante tarjetas de procedimiento estándar que garanticen la excelencia en toda la cartera."],
        "03_3" => ["dim" => "C", "name" => "Trazabilidad de decisiones técnicas",    "sit" => "Ante un siniestro o cambio, no hay registro claro de quién aprobó qué modificación y por qué.",                               "obj" => "Blindar la seguridad jurídica del activo mediante un historial inalterable de responsabilidades técnicas."],
        "04_1" => ["dim" => "D", "name" => "Visibilidad consolidada de cartera",     "sit" => "El directivo necesita pedir informes parciales para conocer el riesgo financiero global de la empresa.",                       "obj" => "Disponer de un cuadro de mando integral con KPIs de rentabilidad y riesgo de todos los activos en tiempo real."],
        "04_2" => ["dim" => "D", "name" => "Sincronización de OKRs — técnica y negocio", "sit" => "Un cambio de material en obra tarda semanas en reflejarse en el análisis de rentabilidad de la oficina central.",         "obj" => "Vincular el dato técnico del modelo con los objetivos de negocio para ver el impacto financiero de cada decisión al instante."],
    ];

    $pct    = $d["weightedScore"] / 100;
    $sc     = number_format((float)$d["scoreOver10"], 1, ",", "");
    $today  = (new DateTime())->format("d") . " de " . ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][(int)(new DateTime())->format("n") - 1] . " de " . (new DateTime())->format("Y");
    $circ   = round(2 * M_PI * 46, 2);
    $offset = round($circ - $pct * $circ, 2);

    // Band
    if ($pct >= 0.85)      $band = ["color" => "#0D4A24", "bg" => "#E8F3EA", "title" => "Tienes las bases. Falta conectarlas.",            "sub" => "Tu organización ya funciona con prácticas sólidas en casi todas las áreas. Los retos que siguen no son urgencias: son oportunidades de integrar lo que ya hace bien para que el conjunto opere como un sistema."];
    elseif ($pct >= 0.70)  $band = ["color" => "#1B6B3A", "bg" => "#E8F3EA", "title" => "Buena base. Pero pierdes dinero por los huecos.", "sub" => "Hay cosas que funcionan bien. Otras dependen de trabajo manual o de personas concretas. Esos huecos tienen un coste que no se ve hasta que hay un problema."];
    elseif ($pct >= 0.45)  $band = ["color" => "#216B47", "bg" => "#EEF6EA", "title" => "Funciona. Pero la coordinación te cuesta dinero.", "sub" => "La información no fluye bien entre fases, herramientas y equipos. El retrabajo, los desvíos que aparecen tarde y las decisiones tomadas a ciegas tienen aquí su origen habitual."];
    else                   $band = ["color" => "#2E7D48", "bg" => "#F0F7EC", "title" => "Todo depende del equipo. Si alguien se va, se va contigo.", "sub" => "Tu organización funciona por el criterio y la experiencia de las personas — lo cual es valioso. Pero esa dependencia limita tu capacidad de escalar, anticipar problemas y mantener la calidad cuando el equipo cambia."];

    $profDisp = strtoupper(str_replace("_", " ", $d["profile"]));

    // Person block
    $rows = "";
    if ($d["firstName"] !== "") $rows .= '<tr><td style="padding:4px 0;font-size:13px;font-weight:600;color:#141B2E;width:90px;vertical-align:top;">Nombre</td><td style="padding:4px 0;font-size:13px;color:#141B2E;">' . he($d["firstName"] . ($d["lastName"] ? " " . $d["lastName"] : "")) . "</td></tr>";
    if ($d["company"]   !== "") $rows .= '<tr><td style="padding:4px 0;font-size:13px;font-weight:600;color:#141B2E;vertical-align:top;">Empresa</td><td style="padding:4px 0;font-size:13px;color:#141B2E;">' . he($d["company"]) . "</td></tr>";
    if ($d["role"]      !== "") $rows .= '<tr><td style="padding:4px 0;font-size:13px;font-weight:600;color:#141B2E;vertical-align:top;">Cargo</td><td style="padding:4px 0;font-size:13px;color:#141B2E;">'   . he($d["role"])    . "</td></tr>";
    $personBlock = $rows !== "" ? '<div style="background:#FAFAF4;border:1px solid #E3E6DE;border-radius:8px;padding:16px 20px;margin-bottom:24px;"><div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1B6B3A;margin-bottom:12px;border-bottom:2px solid #1B6B3A;padding-bottom:6px;">Datos del diagnóstico</div><table cellpadding="0" cellspacing="0" border="0" width="100%">' . $rows . "</table></div>" : "";

    // Dimension cards
    $dimCards = "";
    foreach ($dims as $key => $dim) {
        $val = isset($d["dimensionPerformance"][$key]) ? (int)$d["dimensionPerformance"][$key] : 0;
        if ($val >= 85)     $mat = ["label" => "Bien asentado",               "copy" => "Este bloque ya opera con buenas prácticas. El foco es mantener la consistencia y conectarlo con los otros bloques.",              "tone" => "rgba(27,107,58,0.10)"];
        elseif ($val >= 70) $mat = ["label" => "Funciona con huecos",         "copy" => "Hay procesos establecidos, pero dependen de trabajo manual o de personas concretas. Eso erosiona fiabilidad y escalabilidad.", "tone" => "rgba(46,157,78,0.10)"];
        elseif ($val >= 45) $mat = ["label" => "Hay base, falta conectar",    "copy" => "Existen herramientas parciales, pero la información no fluye entre ellas. De ahí el retrabajo y los errores de coordinación.", "tone" => "rgba(58,167,109,0.12)"];
        else                $mat = ["label" => "Requiere atención prioritaria","copy" => "Este bloque opera reactivamente y depende de personas. Es el origen más probable de desvíos y pérdida de conocimiento.",        "tone" => "rgba(107,195,140,0.10)"];
        $dimCards .= '<div style="background:#fff;border:1px solid #E3E6DE;border-radius:8px;padding:16px 20px;"><div style="display:grid;grid-template-columns:1fr auto;align-items:start;gap:12px;margin-bottom:12px;"><div><div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#8F97A3;margin-bottom:4px;">' . he($dim["short"]) . '</div><div style="font-size:15px;font-weight:600;line-height:1.3;color:#141B2E;">' . he($dim["name"]) . '</div></div><div style="font-size:28px;font-weight:700;color:' . $dim["color"] . ';line-height:0.95;white-space:nowrap;">' . $val . '%</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;"><span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;background:' . $dim["bg"] . ';color:' . $dim["dark"] . ';">Madurez actual</span><span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid ' . $dim["color"] . ';color:' . $dim["color"] . ';background:' . $mat["tone"] . ';">' . he($mat["label"]) . '</span></div><div style="background:#EEF0E8;border-radius:999px;height:6px;overflow:hidden;margin-bottom:8px;"><div style="height:100%;border-radius:999px;width:' . $val . '%;background:' . $dim["color"] . ';"></div></div><div style="font-size:12px;line-height:1.6;color:#5A6472;">' . he($mat["copy"]) . '</div></div>';
    }

    // Top reto cards
    $retoCards = "";
    $idx = 1;
    foreach ($d["topRetoCodes"] as $code) {
        if (!isset($retos[$code])) continue;
        $r   = $retos[$code];
        $dim = $dims[$r["dim"]];
        $retoCards .= '<div style="border:1px solid #E3E6DE;border-radius:8px;padding:20px 24px;background:#fff;border-left:4px solid ' . $dim["color"] . ';"><div style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;margin-bottom:12px;"><span style="display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;border-radius:50%;background:#141B2E;color:#fff;font-size:13px;font-weight:700;">' . $idx . '</span><div><div style="font-size:17px;font-weight:600;line-height:1.3;color:#141B2E;">' . he($r["name"]) . '</div><div style="margin-top:6px;"><span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:600;background:' . $dim["bg"] . ';color:' . $dim["dark"] . ';">' . he($dim["short"]) . ' · ' . he($dim["name"]) . '</span></div></div></div><div style="font-size:13px;color:#5A6472;line-height:1.55;margin-bottom:8px;"><span style="font-weight:600;color:#141B2E;">Lo que ocurre hoy: </span>' . he($r["sit"]) . '</div><div style="font-size:13px;color:#141B2E;line-height:1.55;"><span style="font-weight:600;color:' . $dim["dark"] . ';">Lo que permite resolver: </span>' . he($r["obj"]) . '</div></div>';
        $idx++;
    }

    // Build full report as email-safe table HTML (no SVG, no grid, no dark backgrounds)
    $out  = '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F7F4;">';

    // ── Header ──
    $out .= '<tr><td style="background:#F4F7F4;padding:20px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#ffffff;border:1px solid #DDE8DD;border-radius:6px;padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1B6B3A;">YŪTOPIAS SYSTEMS</p>
            <p style="margin:0;font-size:22px;font-weight:600;color:#141B2E;line-height:1.3;">Informe de diagnóstico de madurez digital</p>
            <p style="margin:6px 0 0;font-size:12px;color:#7A9A7A;">Generado el ' . he($today) . '</p>
          </td>
        </tr>
      </table>
    </td></tr>';

    // ── Person block ──
    if ($rows !== "") {
        $out .= '<tr><td style="padding:12px 28px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="background:#F0F7F0;border:1px solid #DDE8DD;border-radius:6px;padding:16px 20px;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1B6B3A;border-bottom:1px solid #C8DFC8;padding-bottom:8px;">Datos del diagnóstico</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">' . $rows . '</table>
            </td></tr>
          </table>
        </td></tr>';
    }

    // ── Diagnosis band ──
    $out .= '<tr><td style="padding:12px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:' . $band["bg"] . ';border:1px solid #C8DFC8;border-left:4px solid ' . $band["color"] . ';border-radius:6px;padding:18px 20px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:' . $band["color"] . ';">Tu diagnóstico</p>
          <p style="margin:0 0 8px;font-size:19px;font-weight:600;line-height:1.3;color:' . $band["color"] . ';">' . he($band["title"]) . '</p>
          <p style="margin:0;font-size:14px;line-height:1.65;color:#4A6A4A;">' . he($band["sub"]) . '</p>
        </td></tr>
      </table>
    </td></tr>';

    // ── Score card ──
    $out .= '<tr><td style="padding:12px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:#ffffff;border:1px solid #DDE8DD;border-radius:6px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1B6B3A;border-bottom:1px solid #E8EEE8;padding-bottom:8px;">Puntuación global</p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td style="vertical-align:top;padding-right:20px;width:120px;">
              <p style="margin:0;font-size:48px;font-weight:700;color:' . $band["color"] . ';line-height:1;">' . $sc . '</p>
              <p style="margin:0;font-size:14px;color:#7A9A7A;font-weight:600;">/10</p>
              <p style="margin:8px 0 0;font-size:22px;font-weight:700;color:#141B2E;line-height:1;">' . $d["weightedScore"] . '<span style="font-size:13px;font-weight:400;color:#7A9A7A;">/100</span></p>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 8px;font-size:12px;color:#4A5568;line-height:1.6;">Perfil: <strong style="color:#141B2E;">' . he($profDisp) . '</strong></p>
              <!-- Progress bar via table -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">
                <tr>
                  <td width="' . $d["weightedScore"] . '%" style="background:' . $band["color"] . ';height:8px;border-radius:4px 0 0 4px;font-size:1px;">&nbsp;</td>
                  <td style="background:#E8EEE8;height:8px;border-radius:0 4px 4px 0;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#7A9A7A;">Cada bloque pesa distinto según el perfil declarado.</p>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>';

    // ── Dimension cards ──
    $out .= '<tr><td style="padding:12px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:#ffffff;border:1px solid #DDE8DD;border-radius:6px;padding:20px 24px;">
          <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1B6B3A;border-bottom:1px solid #E8EEE8;padding-bottom:8px;">Rendimiento por bloque</p>';

    foreach ($dims as $key => $dim) {
        $val = isset($d["dimensionPerformance"][$key]) ? (int)$d["dimensionPerformance"][$key] : 0;
        if ($val >= 85)     $matLabel = "Bien asentado";
        elseif ($val >= 70) $matLabel = "Funciona con huecos";
        elseif ($val >= 45) $matLabel = "Hay base, falta conectar";
        else                $matLabel = "Requiere atención";

        if ($val >= 85)     $matCopy = "Este bloque ya opera con buenas prácticas. El foco es mantener la consistencia y conectarlo con los otros bloques.";
        elseif ($val >= 70) $matCopy = "Hay procesos establecidos, pero dependen de trabajo manual o de personas concretas. Eso erosiona fiabilidad y escalabilidad.";
        elseif ($val >= 45) $matCopy = "Existen herramientas parciales, pero la información no fluye entre ellas. De ahí el retrabajo y los errores de coordinación.";
        else                $matCopy = "Este bloque opera reactivamente y depende de personas. Es el origen más probable de desvíos y pérdida de conocimiento.";

        $out .= '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:14px;border:1px solid #E8EEE8;border-left:3px solid ' . $dim["color"] . ';border-radius:0 4px 4px 0;">
          <tr><td style="padding:12px 14px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
              <td style="vertical-align:top;">
                <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#7A9A7A;">' . he($dim["short"]) . '</p>
                <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#141B2E;">' . he($dim["name"]) . '</p>
                <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:' . $dim["color"] . ';background:' . $dim["bg"] . ';display:inline;padding:2px 8px;border-radius:3px;">' . he($matLabel) . '</p>
                <p style="margin:6px 0 0;font-size:12px;color:#4A5568;line-height:1.55;">' . he($matCopy) . '</p>
              </td>
              <td style="vertical-align:top;text-align:right;padding-left:12px;white-space:nowrap;">
                <p style="margin:0;font-size:28px;font-weight:700;color:' . $dim["color"] . ';">' . $val . '%</p>
              </td>
            </tr></table>
            <!-- Bar -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px;">
              <tr>
                <td width="' . $val . '%" style="background:' . $dim["color"] . ';height:5px;border-radius:3px 0 0 3px;font-size:1px;">&nbsp;</td>
                <td style="background:#E8EEE8;height:5px;border-radius:0 3px 3px 0;font-size:1px;">&nbsp;</td>
              </tr>
            </table>
          </td></tr>
        </table>';
    }

    $out .= '<!-- Scale legend -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F0F7F0;border:1px solid #DDE8DD;border-radius:4px;margin-top:4px;">
            <tr>
              <td style="padding:10px 14px;">
                <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#141B2E;letter-spacing:0.08em;text-transform:uppercase;">Escala de madurez:</p>
                <table cellpadding="0" cellspacing="4" border="0"><tr>
                  <td style="font-size:10px;font-weight:600;color:#4A5568;background:#E8EEE8;padding:3px 8px;border-radius:3px;white-space:nowrap;">0–44% Depende de personas</td>
                  <td style="font-size:10px;font-weight:600;color:#4A5568;background:#E8EEE8;padding:3px 8px;border-radius:3px;white-space:nowrap;">45–69% Procesos parciales</td>
                  <td style="font-size:10px;font-weight:600;color:#4A5568;background:#E8EEE8;padding:3px 8px;border-radius:3px;white-space:nowrap;">70–84% Base sólida</td>
                  <td style="font-size:10px;font-weight:600;color:#4A5568;background:#E8EEE8;padding:3px 8px;border-radius:3px;white-space:nowrap;">85–100% Bien integrado</td>
                </tr></table>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>';

    // ── Top 3 retos ──
    $out .= '<tr><td style="padding:12px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:#ffffff;border:1px solid #DDE8DD;border-radius:6px;padding:20px 24px;">
          <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1B6B3A;border-bottom:1px solid #E8EEE8;padding-bottom:8px;">Tus 3 prioridades de mejora</p>';

    $idx = 1;
    foreach ($d["topRetoCodes"] as $code) {
        if (!isset($retos[$code])) continue;
        $r   = $retos[$code];
        $dim = $dims[$r["dim"]];
        $out .= '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;border:1px solid #E8EEE8;border-left:4px solid ' . $dim["color"] . ';border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 16px;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:top;padding-right:10px;">
                <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:#141B2E;color:#ffffff;font-size:13px;font-weight:700;border-radius:50%;">' . $idx . '</span>
              </td>
              <td style="vertical-align:top;">
                <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#141B2E;">' . he($r["name"]) . '</p>
                <p style="margin:0 0 8px;font-size:10px;font-weight:600;color:' . $dim["dark"] . ';background:' . $dim["bg"] . ';display:inline;padding:2px 8px;border-radius:3px;">' . he($dim["short"]) . ' &middot; ' . he($dim["name"]) . '</p>
                <p style="margin:8px 0 6px;font-size:13px;color:#4A5568;line-height:1.55;"><strong style="color:#141B2E;">Lo que ocurre hoy:</strong> ' . he($r["sit"]) . '</p>
                <p style="margin:0;font-size:13px;color:#141B2E;line-height:1.55;"><strong style="color:' . $dim["dark"] . ';">Lo que permite resolver:</strong> ' . he($r["obj"]) . '</p>
              </td>
            </tr></table>
          </td></tr>
        </table>';
        $idx++;
    }

    $out .= '</td></tr></table></td></tr>';

    // ── CTA block ──
    $out .= '<tr><td style="padding:12px 28px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="background:#F0F7F0;border:1px solid #C8DFC8;border-left:4px solid #1B6B3A;border-radius:0 6px 6px 0;padding:20px 24px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#1B6B3A;">Próximo paso</p>
          <p style="margin:0 0 10px;font-size:18px;font-weight:600;color:#141B2E;line-height:1.3;">¿Quieres ver cómo SimuLab resuelve estas prioridades en tu organización?</p>
          <p style="margin:0 0 16px;font-size:13px;color:#4A5568;line-height:1.65;">El equipo de yūtopias puede preparar una sesión de trabajo personalizada basada en tu diagnóstico. Sin presentaciones genéricas — solo lo que aplica a tu caso.</p>
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background:#1B6B3A;border-radius:6px;">
              <a href="https://yutopias.com/es/contact/" style="display:inline-block;padding:11px 20px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;">Hablar con el equipo &rarr;</a>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>';

    // ── Footer ──
    $out .= '<tr><td style="padding:12px 28px 20px;">
      <p style="margin:0;font-size:11px;color:#7A9A7A;text-align:center;">yūtopias systems &middot; <a href="https://yutopias.com" style="color:#1B6B3A;text-decoration:none;">yutopias.com</a> &middot; Informe generado el ' . he($today) . '</p>
    </td></tr>';

    $out .= '</table>';
    return $out;
}

function buildInternalEmailBody(string $firstName, string $lastName, string $company, string $role, string $email, string $sc, int $weightedScore, array $dimPerf, array $retoCodes, string $challenge): string {
    $dims = ["A" => "Decidir con datos", "B" => "Conocimiento del equipo", "C" => "Decisiones coordinadas", "D" => "Visión en tiempo real"];
    $dimRows = "";
    foreach ($dims as $k => $name) {
        $val = isset($dimPerf[$k]) ? (int)$dimPerf[$k] : 0;
        $dimRows .= '<tr><td style="padding:6px 0;font-size:13px;color:#5A6472;width:200px;">' . he($name) . '</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#141B2E;">' . $val . '%</td></tr>';
    }
    $retoNames = ["01_1"=>"Análisis predictivo 360","01_2"=>"Aprender de lo que ya has hecho","01_3"=>"Control preventivo de desvíos","01_4"=>"Cumplimiento de Taxonomía EU","02_1"=>"Institucionalización del patrimonio","02_2"=>"Agilidad decisional con IA","02_3"=>"Auditoría de desempeño","03_1"=>"Unidad de información","03_2"=>"Escalabilidad operativa","03_3"=>"Trazabilidad de decisiones","04_1"=>"Visibilidad consolidada de cartera","04_2"=>"Sincronización de OKRs"];
    $retoList = "";
    $i = 1;
    foreach ($retoCodes as $code) {
        $retoList .= '<li style="margin-bottom:4px;font-size:13px;color:#141B2E;">' . $i . '. ' . he($retoNames[$code] ?? $code) . '</li>';
        $i++;
    }

    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;background:#F0F5E9;margin:0;padding:32px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
  <tr><td style="background:#141B2E;border-radius:8px 8px 0 0;padding:20px 28px;">
    <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">yūtopias · Nuevo diagnóstico completado</p>
  </td></tr>
  <tr><td style="background:#fff;border:1px solid #E3E6DE;border-top:0;padding:28px;border-radius:0 0 8px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:6px 0;font-size:13px;color:#5A6472;width:100px;">Nombre</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#141B2E;">' . he(trim("$firstName $lastName")) . '</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#5A6472;">Empresa</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#141B2E;">' . he($company) . '</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#5A6472;">Cargo</td><td style="padding:6px 0;font-size:13px;color:#141B2E;">' . he($role) . '</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#5A6472;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:' . he($email) . '" style="color:#1B6B3A;">' . he($email) . '</a></td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#5A6472;">Score</td><td style="padding:6px 0;font-size:20px;font-weight:700;color:#141B2E;">' . $sc . '/10 <span style="font-size:13px;font-weight:400;color:#5A6472;">(' . $weightedScore . '/100)</span></td></tr>
    </table>
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#1B6B3A;margin:0 0 8px;">Por bloque</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">' . $dimRows . '</table>
    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#1B6B3A;margin:0 0 8px;">Top 3 prioridades</p>
    <ul style="margin:0 0 24px;padding-left:16px;">' . $retoList . '</ul>'
    . ($challenge !== "" ? '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#1B6B3A;margin:0 0 8px;">Reto declarado</p><p style="font-size:13px;color:#5A6472;line-height:1.6;margin:0 0 24px;background:#FAFAF4;border-left:3px solid #3AA76D;padding:10px 14px;border-radius:0 4px 4px 0;">' . he($challenge) . '</p>' : '')
    . '<table cellpadding="0" cellspacing="0"><tr><td style="background:#141B2E;border-radius:6px;"><a href="mailto:' . he($email) . '" style="display:inline-block;padding:10px 20px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;">Responder al lead &rarr;</a></td></tr></table>
  </td></tr>
</table>
</body></html>';
}
