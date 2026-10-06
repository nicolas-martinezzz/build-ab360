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

$name        = trim((string)($payload["name"]        ?? ""));
$email       = strtolower(trim((string)($payload["email"]   ?? "")));
$role        = trim((string)($payload["role"]        ?? ""));
$company     = trim((string)($payload["company"]     ?? ""));
$website     = trim((string)($payload["website"]     ?? ""));
$accepted    = (bool)($payload["accepted"]    ?? false);
$submittedAt = (int)($payload["submittedAt"]  ?? 0);
$locale      = substr(trim((string)($payload["locale"] ?? "es")), 0, 8);
$nowMs       = (int)round(microtime(true) * 1000);

// Bootcamp Zero × APCE Catalunya (22/10/2026) — two extra required questions.
// Validated exactly as strictly as the pre-existing fields below. See
// odd/tasks/bootcamp-zero-programa.md.
$lunch       = trim((string)($payload["lunch"]       ?? ""));
$companyType = trim((string)($payload["companyType"] ?? ""));
$validLunchValues       = ["yes", "no"];
$validCompanyTypeValues = ["member", "non_member"];

// Honeypot — bots fill hidden fields
if ($website !== "") {
    echo json_encode(["ok" => true]);
    exit;
}

if ($submittedAt <= 0 || ($nowMs - $submittedAt) < 1500) {
    http_response_code(400);
    echo json_encode(["message" => "Suspicious submit timing"]);
    exit;
}

if (!$accepted) {
    http_response_code(400);
    echo json_encode(["message" => "Privacy consent required"]);
    exit;
}

// The lunch/company-type questions only exist in the es-locale form (see
// ProgramaBootcampSection.tsx); en/ca never send them, so they stay optional
// there to avoid breaking their unrelated, unchanged submission flow.
$isEsSubmission = strtolower(substr($locale, 0, 2)) === "es";

if (
    $name === "" || $company === "" || $role === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || ($isEsSubmission && !in_array($lunch, $validLunchValues, true))
    || ($isEsSubmission && !in_array($companyType, $validCompanyTypeValues, true))
) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid form data"]);
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
require_once dirname($configPath) . "/smtp_mailer.php";

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
$notifyTo   = (string)($config["notify_to"]   ?? getenv("NEWSLETTER_NOTIFY_TO")   ?? "jjm@yutopias.com");
$mailFrom   = (string)($config["mail_from"]   ?? getenv("NEWSLETTER_MAIL_FROM")   ?? "no-reply@yutopias.com");

if ($dbHost === "" || $dbName === "" || $dbUser === "" || $dbPassword === "") {
    http_response_code(500);
    echo json_encode(["message" => "Bootcamp database is not configured"]);
    exit;
}

$ip        = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? ($_SERVER["REMOTE_ADDR"] ?? "");
$ipFirst   = trim(explode(",", (string)$ip)[0]);
$ipHash    = $ipFirst !== "" ? hash("sha256", $ipFirst . ":" . $ipSalt) : null;
$userAgent = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);

const RATE_LIMIT_MAX    = 10;
const RATE_LIMIT_WINDOW = 60;

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    if ($ipHash !== null) {
        try {
            $rlStmt = $pdo->prepare("
                SELECT COUNT(*) AS cnt
                FROM bootcamp_leads
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
        } catch (Throwable $ignored) {}
    }

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bootcamp_leads (
            id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name             VARCHAR(120)    NOT NULL,
            email            VARCHAR(255)    NOT NULL,
            role_name        VARCHAR(180)    NOT NULL,
            company          VARCHAR(180)    NOT NULL,
            locale           VARCHAR(8)      NULL,
            lunch            VARCHAR(16)     NULL,
            company_type     VARCHAR(16)     NULL,
            privacy_accepted TINYINT(1)      NOT NULL DEFAULT 0,
            source           VARCHAR(120)    NOT NULL,
            ip_hash          VARCHAR(64)     NULL,
            user_agent       VARCHAR(255)    NULL,
            created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_bootcamp_email (email),
            KEY idx_bootcamp_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->prepare("
        INSERT INTO bootcamp_leads (name, email, role_name, company, locale, lunch, company_type, privacy_accepted, source, ip_hash, user_agent)
        VALUES (:name, :email, :role_name, :company, :locale, :lunch, :company_type, 1, 'programa-bootcamp-form', :ip_hash, :user_agent)
        ON DUPLICATE KEY UPDATE
            name             = VALUES(name),
            role_name        = VALUES(role_name),
            company          = VALUES(company),
            locale           = VALUES(locale),
            lunch            = VALUES(lunch),
            company_type     = VALUES(company_type),
            privacy_accepted = 1,
            ip_hash          = VALUES(ip_hash),
            user_agent       = VALUES(user_agent)
    ")->execute([
        ":name"         => substr($name, 0, 120),
        ":email"        => substr($email, 0, 255),
        ":role_name"    => substr($role, 0, 180),
        ":company"      => substr($company, 0, 180),
        ":locale"       => $locale,
        ":lunch"        => $lunch !== "" ? $lunch : null,
        ":company_type" => $companyType !== "" ? $companyType : null,
        ":ip_hash"      => $ipHash,
        ":user_agent"   => $userAgent !== "" ? $userAgent : null,
    ]);

    // ─── HubSpot (optional, isolated) ───────────────────────────────────────
    // Gated entirely behind HUBSPOT_PRIVATE_APP_TOKEN. No credentials are
    // hardcoded here: when the env var is unset (the case today), this block
    // is skipped and MySQL + the internal notification email below remain
    // the only effects of a submission, exactly as before. Once the Private
    // App + custom properties exist in the HubSpot portal, set the env var
    // and this starts working without further code changes. The "solicitud
    // recibida" email no longer depends on HubSpot: it is sent below over
    // the server's own SMTP (see the yutopias_mail() block further down).
    $hubspotToken = getenv("HUBSPOT_PRIVATE_APP_TOKEN");
    if ($hubspotToken !== false && $hubspotToken !== "") {
        try {
            $nameParts = preg_split('/\s+/', trim($name), 2);
            $firstName = $nameParts[0] ?? "";
            $lastName  = $nameParts[1] ?? "";

            $hubspotProperties = [
                "email"     => $email,
                "firstname" => $firstName,
                "lastname"  => $lastName,
                "company"   => $company,
                "jobtitle"  => $role,
                // TODO: confirmar nombre interno exacto en el portal de HubSpot antes de ir a producción
                "bootcamp_zero_almuerzo_networking" => $lunch === "yes" ? "si" : "no",
                // TODO: confirmar nombre interno exacto en el portal de HubSpot antes de ir a producción
                "bootcamp_zero_tipo_empresa" => $companyType === "member" ? "asociada" : "no_asociada",
            ];

            $ch = curl_init("https://api.hubapi.com/crm/v3/objects/contacts");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_TIMEOUT        => 8,
                CURLOPT_HTTPHEADER     => [
                    "Authorization: Bearer " . $hubspotToken,
                    "Content-Type: application/json",
                ],
                CURLOPT_POSTFIELDS => json_encode(["properties" => $hubspotProperties]),
            ]);
            curl_exec($ch);
            $hubspotStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($hubspotStatus < 200 || $hubspotStatus >= 300) {
                error_log("[bootcamp-lead] HubSpot contact upsert returned HTTP " . $hubspotStatus);
            }
        } catch (Throwable $hubspotError) {
            // A HubSpot failure must never break the submission for the user.
            error_log("[bootcamp-lead] HubSpot sync failed: " . $hubspotError->getMessage());
        }
    }

    $subject = "Nueva solicitud Bootcamp Zero";
    $message = "Se ha recibido una nueva solicitud de plaza para Bootcamp Zero.\n\n"
        . "Nombre: "  . $name    . "\n"
        . "Email: "   . $email   . "\n"
        . "Cargo: "   . $role    . "\n"
        . "Empresa: " . $company . "\n"
        . "Idioma: "  . $locale  . "\n";
    // Bootcamp Zero × APCE: the two extra questions only arrive on the
    // es-locale campaign form; include them only when present.
    if ($lunch !== "") {
        $message .= "Almuerzo de networking: " . ($lunch === "yes" ? "Sí" : "No") . "\n";
    }
    if ($companyType !== "") {
        $message .= "Tipo de empresa: " . ($companyType === "member" ? "Asociada a APCE" : "No asociada") . "\n";
    }
    $message .= "Fecha: " . gmdate("Y-m-d H:i:s") . " UTC\n";
    $safeEmail = filter_var($email, FILTER_VALIDATE_EMAIL) ? preg_replace('/[\r\n]/', '', $email) : $mailFrom;
    $headers = "From: "     . $mailFrom  . "\r\n"
             . "Reply-To: " . $safeEmail . "\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n";
    if (!yutopias_mail($notifyTo, $subject, $message, $headers)) {
        error_log("[bootcamp-lead] Failed to send notification to " . $notifyTo);
    }

    // ─── "Solicitud recibida" email to the applicant ─────────────────────────
    // Sent over the server's own SMTP (same yutopias_mail() pattern as
    // public/api/diagnostic.php), only for the es-locale campaign form — the
    // legacy en/ca form must not trigger it. The copy mirrors the "Aprobación
    // requerida" card on the form: the request was RECEIVED and is subject to
    // approval; it is NOT a seat confirmation. yutopias_mail() returns false
    // on any failure (it never throws), so a mail failure can never break
    // this response — the lead is already saved; we only log, exactly like
    // the internal notification above.
    if ($isEsSubmission) {
        $safeName    = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
        $subjectUser = "=?UTF-8?B?" . base64_encode("Hemos recibido tu solicitud · Bootcamp Zero") . "?=";
        $bodyUser    = '<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:24px;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;background-color:#ffffff;padding:32px;border-radius:8px;">
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;">Hemos recibido tu solicitud</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hola ' . $safeName . ',</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Tu solicitud de plaza para el <strong>Bootcamp Zero</strong> (22 de octubre de 2026, Hub BStartup Barcelona) se ha recibido correctamente.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Tu solicitud est&aacute; sujeta a la aprobaci&oacute;n de la organizaci&oacute;n. Te contactaremos para confirmar tu plaza.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;">Un saludo,<br />El equipo de y&#363;topias systems</p>
    </div>
  </body>
</html>';
        $headersUser = implode("\r\n", [
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "From: =?UTF-8?B?" . base64_encode("yūtopias systems") . "?= <{$mailFrom}>",
            "Reply-To: {$mailFrom}",
        ]);
        if (!yutopias_mail($email, $subjectUser, $bodyUser, $headersUser)) {
            error_log("[bootcamp-lead] Failed to send solicitud-recibida email to " . $email);
        }
    }

    echo json_encode(["ok" => true]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
