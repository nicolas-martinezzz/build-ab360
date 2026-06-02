<?php
declare(strict_types=1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = ["https://yutopias.com", "https://staging.yutopias.com"];

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

// ─── Honeypot check ───────────────────────────────────────────────────────────
$honeypot = trim((string)($payload["website"] ?? ""));
if ($honeypot !== "") {
    // Silently accept to not tip off bots.
    echo json_encode(["ok" => true]);
    exit;
}

// ─── Spam timing check ────────────────────────────────────────────────────────
$submittedAt = (int)($payload["submittedAt"] ?? 0);
$elapsedMs   = $submittedAt > 0 ? (int)(microtime(true) * 1000) - $submittedAt : PHP_INT_MAX;
if ($elapsedMs < 3000) {
    echo json_encode(["ok" => true]);
    exit;
}

// ─── Config / DB ──────────────────────────────────────────────────────────────
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
    echo json_encode(["message" => "Database not configured"]);
    exit;
}

// ─── Field extraction & validation ───────────────────────────────────────────
$name       = substr(trim((string)($payload["name"]       ?? "")), 0, 240);
$email      = strtolower(substr(trim((string)($payload["email"]     ?? "")), 0, 255));
$org        = substr(trim((string)($payload["org"]        ?? "")), 0, 180);
$priority   = substr(trim((string)($payload["priority"]   ?? "")), 0, 64);
$message    = substr(trim((string)($payload["message"]    ?? "")), 0, 2000);
$newsletter = (bool)($payload["newsletter"] ?? false);
$accepted   = (bool)($payload["accepted"]   ?? false);
$locale     = substr(trim((string)($payload["locale"]     ?? "es")), 0, 8);

$allowedPriorities = ["adopt", "partner", "research", "other"];

if ($name === "" || $org === "" || $message === "") {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields"]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email"]);
    exit;
}
if (!in_array($priority, $allowedPriorities, true)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid priority"]);
    exit;
}
if (!$accepted) {
    http_response_code(400);
    echo json_encode(["message" => "Privacy consent required"]);
    exit;
}

$ip      = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? ($_SERVER["REMOTE_ADDR"] ?? "");
$ipFirst = trim(explode(",", (string)$ip)[0]);
$ipHash  = $ipFirst !== "" ? hash("sha256", $ipFirst . ":" . $ipSalt) : null;
$userAgent = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);

const RATE_LIMIT_MAX    = 5;
const RATE_LIMIT_WINDOW = 3600; // 1 hour

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // ─── Bootstrap table ──────────────────────────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS openlab_contacts (
            id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name             VARCHAR(240)    NOT NULL,
            email            VARCHAR(255)    NOT NULL,
            org              VARCHAR(180)    NOT NULL,
            priority         VARCHAR(64)     NOT NULL,
            message          TEXT            NOT NULL,
            newsletter       TINYINT(1)      NOT NULL DEFAULT 0,
            locale           VARCHAR(8)      NOT NULL DEFAULT 'es',
            ip_hash          VARCHAR(64)     NULL,
            user_agent       VARCHAR(255)    NULL,
            created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_email      (email),
            KEY idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ─── Rate limiting ────────────────────────────────────────────────────────
    if ($ipHash !== null) {
        try {
            $rlStmt = $pdo->prepare("
                SELECT COUNT(*) AS cnt
                FROM openlab_contacts
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

    // ─── Insert ───────────────────────────────────────────────────────────────
    $pdo->prepare("
        INSERT INTO openlab_contacts (name, email, org, priority, message, newsletter, locale, ip_hash, user_agent)
        VALUES (:name, :email, :org, :priority, :message, :newsletter, :locale, :ip_hash, :user_agent)
    ")->execute([
        ":name"       => $name,
        ":email"      => $email,
        ":org"        => $org,
        ":priority"   => $priority,
        ":message"    => $message,
        ":newsletter" => $newsletter ? 1 : 0,
        ":locale"     => $locale,
        ":ip_hash"    => $ipHash,
        ":user_agent" => $userAgent !== "" ? $userAgent : null,
    ]);

    echo json_encode(["ok" => true]);

} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
