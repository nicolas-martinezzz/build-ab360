<?php
declare(strict_types=1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = ["https://yutopias.com", "https://admin.yutopias.com"];
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowedOrigins, true) ? $origin : "https://yutopias.com"));
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

$requestOrigin = $_SERVER["HTTP_ORIGIN"] ?? $_SERVER["HTTP_REFERER"] ?? "";
$validOrigin = false;
foreach ($allowedOrigins as $o) {
    if (strpos($requestOrigin, $o) === 0) { $validOrigin = true; break; }
}
if (!$validOrigin) { http_response_code(403); echo json_encode(["message" => "Forbidden"]); exit; }

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); echo json_encode(["message" => "Method Not Allowed"]); exit;
}

$payload = json_decode(file_get_contents("php://input") ?: "{}", true);
if (!is_array($payload)) { http_response_code(400); echo json_encode(["message" => "Invalid payload"]); exit; }

// ─── Fields ───────────────────────────────────────────────────────────────────
$name        = trim((string)($payload["name"]        ?? ""));
$company     = trim((string)($payload["company"]     ?? ""));
$email       = strtolower(trim((string)($payload["email"]   ?? "")));
$website     = trim((string)($payload["website"]     ?? ""));   // honeypot
$accepted    = (bool)($payload["accepted"]    ?? false);
$submittedAt = (int)($payload["submittedAt"]  ?? 0);
$locale      = substr(trim((string)($payload["locale"] ?? "es")), 0, 8);
$nowMs       = (int)round(microtime(true) * 1000);

if ($website !== "") { echo json_encode(["ok" => true]); exit; }
if ($submittedAt <= 0 || ($nowMs - $submittedAt) < 1500) {
    http_response_code(400); echo json_encode(["message" => "Suspicious submit timing"]); exit;
}
if (!$accepted) { http_response_code(400); echo json_encode(["message" => "Privacy consent required"]); exit; }
if ($name === "" || $company === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); echo json_encode(["message" => "Invalid form data"]); exit;
}

// ─── Config ───────────────────────────────────────────────────────────────────
$configPath = getenv("NEWSLETTER_CONFIG_FILE") ?: dirname(dirname(__DIR__)) . "/private/newsletter-config.php";
$config = [];
if (is_file($configPath)) { $loaded = require $configPath; if (is_array($loaded)) $config = $loaded; }

$dbHost     = (string)($config["db_host"]     ?? getenv("PROD_DB_HOST")     ?? "");
$dbPort     = (int)   ($config["db_port"]     ?? getenv("PROD_DB_PORT")     ?? 3306);
$dbName     = (string)($config["db_name"]     ?? getenv("PROD_DB_NAME")     ?? "");
$dbUser     = (string)($config["db_user"]     ?? getenv("PROD_DB_USER")     ?? "");
$dbPassword = (string)($config["db_password"] ?? getenv("PROD_DB_PASSWORD") ?? "");
$ipSalt     = (string)($config["ip_salt"]     ?? getenv("NEWSLETTER_IP_SALT") ?? "");
$notifyTo   = (string)($config["notify_to_prod"] ?? getenv("NOTIFY_TO_PROD") ?? "jjm@yutopias.com");
$mailFrom   = (string)($config["mail_from"]   ?? getenv("NEWSLETTER_MAIL_FROM") ?? "no-reply@yutopias.com");

if ($dbHost === "" || $dbName === "" || $dbUser === "") {
    http_response_code(500); echo json_encode(["message" => "DB not configured"]); exit;
}

$ip       = trim(explode(",", (string)($_SERVER["HTTP_X_FORWARDED_FOR"] ?? $_SERVER["REMOTE_ADDR"] ?? ""))[0]);
$ipHash   = ($ip !== "" && $ipSalt !== "") ? hash("sha256", $ip . ":" . $ipSalt) : null;
$ua       = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // Rate limit — max 5 submissions per IP per hour
    if ($ipHash !== null) {
        $rl = $pdo->prepare("
            SELECT COUNT(*) AS cnt FROM reserva_plaza_leads
            WHERE ip_hash = :h AND created_at >= DATE_SUB(NOW(), INTERVAL 3600 SECOND)
        ");
        $rl->execute([":h" => $ipHash]);
        if ((int)($rl->fetch()["cnt"] ?? 0) >= 5) {
            http_response_code(429); echo json_encode(["message" => "Too many requests"]); exit;
        }
    }

    // Create table if missing (safety net)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reserva_plaza_leads (
            id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            name             VARCHAR(120)    NOT NULL,
            company          VARCHAR(180)    NOT NULL,
            email            VARCHAR(255)    NOT NULL,
            locale           VARCHAR(8)      NULL,
            privacy_accepted TINYINT(1)      NOT NULL DEFAULT 1,
            ip_hash          VARCHAR(64)     NULL,
            user_agent       VARCHAR(255)    NULL,
            created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_rp_email (email),
            KEY idx_rp_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $pdo->prepare("
        INSERT INTO reserva_plaza_leads (name, company, email, locale, privacy_accepted, ip_hash, user_agent)
        VALUES (:name, :company, :email, :locale, 1, :ip_hash, :ua)
    ")->execute([
        ":name"    => substr($name, 0, 120),
        ":company" => substr($company, 0, 180),
        ":email"   => substr($email, 0, 255),
        ":locale"  => $locale,
        ":ip_hash" => $ipHash,
        ":ua"      => $ua !== "" ? $ua : null,
    ]);

    // Notify
    foreach (array_filter(array_map("trim", explode(",", $notifyTo))) as $recipient) {
        $subj = "=?UTF-8?B?" . base64_encode("Nueva solicitud · Reserva-Plaza Bootcamp Zero") . "?=";
        $body = "Nueva solicitud de plaza en el Bootcamp Zero.\n\n"
            . "Nombre: $name\nEmpresa: $company\nEmail: $email\nIdioma: $locale\n"
            . "Fecha: " . gmdate("Y-m-d H:i:s") . " UTC";
        $headers = implode("\r\n", [
            "From: =?UTF-8?B?" . base64_encode("Yutopias") . "?= <$mailFrom>",
            "Reply-To: $mailFrom",
            "Content-Type: text/plain; charset=UTF-8",
        ]);
        mail($recipient, $subj, $body, $headers);
    }

    echo json_encode(["ok" => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
