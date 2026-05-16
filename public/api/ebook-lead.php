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

$email         = strtolower(trim((string)($payload["email"] ?? "")));
$accepted      = (bool)($payload["accepted"] ?? false);
$locale        = substr(trim((string)($payload["locale"] ?? "es")), 0, 8);
$sourceArticle = substr(trim((string)($payload["source_article"] ?? "resources")), 0, 120);
$website       = trim((string)($payload["website"] ?? ""));
$submittedAt   = (int)($payload["submitted_at"] ?? 0);
$nowMs         = (int)round(microtime(true) * 1000);

// Honeypot check — silently succeed so bots don't retry
if ($website !== "") {
    echo json_encode(["ok" => true]);
    exit;
}

// Timing check — must have spent at least 800ms filling the form
if ($submittedAt <= 0 || ($nowMs - $submittedAt) < 800) {
    http_response_code(400);
    echo json_encode(["message" => "Suspicious submit timing"]);
    exit;
}

if (!$accepted) {
    http_response_code(400);
    echo json_encode(["message" => "Privacy consent required"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email"]);
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
$dbPort     = (int)($config["db_port"]        ?? getenv("NEWSLETTER_DB_PORT")     ?? 3306);
$dbName     = (string)($config["db_name"]     ?? getenv("NEWSLETTER_DB_NAME")     ?? "");
$dbUser     = (string)($config["db_user"]     ?? getenv("NEWSLETTER_DB_USER")     ?? "");
$dbPassword = (string)($config["db_password"] ?? getenv("NEWSLETTER_DB_PASSWORD") ?? "");
$ipSalt     = (string)($config["ip_salt"]     ?? getenv("NEWSLETTER_IP_SALT")     ?? "");

if ($ipSalt === "") {
    http_response_code(500);
    echo json_encode(["message" => "Server misconfiguration"]);
    exit;
}

$notifyTo = (string)($config["notify_to"] ?? getenv("NEWSLETTER_NOTIFY_TO") ?? "jjm@yutopias.com");
$mailFrom = (string)($config["mail_from"] ?? getenv("NEWSLETTER_MAIL_FROM") ?? "no-reply@yutopias.com");

if ($dbHost === "" || $dbName === "" || $dbUser === "" || $dbPassword === "") {
    http_response_code(500);
    echo json_encode(["message" => "Database not configured"]);
    exit;
}

$ip      = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? ($_SERVER["REMOTE_ADDR"] ?? "");
$ipFirst = trim(explode(",", $ip)[0]);
$ipHash  = $ipFirst !== "" ? hash("sha256", $ipFirst . ":" . $ipSalt) : null;

const RATE_LIMIT_MAX    = 5;
const RATE_LIMIT_WINDOW = 60;

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // Rate limit by IP
    if ($ipHash !== null) {
        try {
            $rlStmt = $pdo->prepare("
                SELECT COUNT(*) AS cnt
                FROM ebook_leads
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
        CREATE TABLE IF NOT EXISTS ebook_leads (
            id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            email              VARCHAR(255) NOT NULL,
            consent_accepted   TINYINT(1) NOT NULL DEFAULT 0,
            consent_timestamp  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            source_article     VARCHAR(120) NOT NULL DEFAULT 'resources',
            ip_hash            VARCHAR(64) NULL,
            locale             VARCHAR(8) NULL,
            created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_ebook_email (email),
            INDEX idx_ebook_ip (ip_hash),
            INDEX idx_ebook_source (source_article)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $stmt = $pdo->prepare("
        INSERT INTO ebook_leads (email, consent_accepted, source_article, ip_hash, locale)
        VALUES (:email, 1, :source_article, :ip_hash, :locale)
        ON DUPLICATE KEY UPDATE
            consent_accepted  = VALUES(consent_accepted),
            consent_timestamp = NOW(),
            source_article    = VALUES(source_article),
            locale            = VALUES(locale),
            updated_at        = NOW()
    ");

    $stmt->execute([
        ":email"          => $email,
        ":source_article" => $sourceArticle,
        ":ip_hash"        => $ipHash,
        ":locale"         => $locale,
    ]);

    // Notify internal team
    $subject = "Nueva descarga de ebook";
    $message = "Se ha registrado una nueva descarga del ebook desde la web.\n\n"
        . "Email: "          . $email         . "\n"
        . "Fuente: "         . $sourceArticle . "\n"
        . "Idioma: "         . $locale        . "\n"
        . "Fecha (UTC): "    . gmdate("Y-m-d H:i:s") . "\n";
    $safeEmail = filter_var($email, FILTER_VALIDATE_EMAIL)
        ? preg_replace('/[\r\n]/', '', $email)
        : $mailFrom;
    $headers = "From: " . $mailFrom . "\r\n"
        . "Reply-To: " . $safeEmail . "\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n";

    if (!mail($notifyTo, $subject, $message, $headers)) {
        error_log("[ebook-lead] Failed to send notification to " . $notifyTo);
    }

    echo json_encode(["ok" => true]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
