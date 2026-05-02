<?php
declare(strict_types=1);

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

if ($name === "" || $company === "" || $role === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
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

$dbHost     = (string)($config["db_host"]     ?? getenv("NEWSLETTER_DB_HOST")     ?? "");
$dbPort     = (int)   ($config["db_port"]     ?? getenv("NEWSLETTER_DB_PORT")     ?? 3306);
$dbName     = (string)($config["db_name"]     ?? getenv("NEWSLETTER_DB_NAME")     ?? "");
$dbUser     = (string)($config["db_user"]     ?? getenv("NEWSLETTER_DB_USER")     ?? "");
$dbPassword = (string)($config["db_password"] ?? getenv("NEWSLETTER_DB_PASSWORD") ?? "");
$ipSalt     = (string)($config["ip_salt"]     ?? getenv("NEWSLETTER_IP_SALT")     ?? "bootcamp-default-salt");
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

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bootcamp_leads (
            id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name             VARCHAR(120)    NOT NULL,
            email            VARCHAR(255)    NOT NULL,
            role_name        VARCHAR(180)    NOT NULL,
            company          VARCHAR(180)    NOT NULL,
            locale           VARCHAR(8)      NULL,
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
        INSERT INTO bootcamp_leads (name, email, role_name, company, locale, privacy_accepted, source, ip_hash, user_agent)
        VALUES (:name, :email, :role_name, :company, :locale, 1, 'programa-bootcamp-form', :ip_hash, :user_agent)
        ON DUPLICATE KEY UPDATE
            name             = VALUES(name),
            role_name        = VALUES(role_name),
            company          = VALUES(company),
            locale           = VALUES(locale),
            privacy_accepted = 1,
            ip_hash          = VALUES(ip_hash),
            user_agent       = VALUES(user_agent)
    ")->execute([
        ":name"      => substr($name, 0, 120),
        ":email"     => substr($email, 0, 255),
        ":role_name" => substr($role, 0, 180),
        ":company"   => substr($company, 0, 180),
        ":locale"    => $locale,
        ":ip_hash"   => $ipHash,
        ":user_agent"=> $userAgent !== "" ? $userAgent : null,
    ]);

    $subject = "Nueva solicitud Bootcamp Zero";
    $message = "Se ha recibido una nueva solicitud de plaza para Bootcamp Zero.\n\n"
        . "Nombre: "  . $name    . "\n"
        . "Email: "   . $email   . "\n"
        . "Cargo: "   . $role    . "\n"
        . "Empresa: " . $company . "\n"
        . "Idioma: "  . $locale  . "\n"
        . "Fecha: "   . gmdate("Y-m-d H:i:s") . " UTC\n";
    $headers = "From: "         . $mailFrom . "\r\n"
             . "Reply-To: "     . $email    . "\r\n"
             . "Content-Type: text/plain; charset=UTF-8\r\n";
    @mail($notifyTo, $subject, $message, $headers);

    echo json_encode(["ok" => true]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
