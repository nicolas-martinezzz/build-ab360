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

$name = trim((string)($payload["name"] ?? ""));
$email = strtolower(trim((string)($payload["email"] ?? "")));
$accepted = (bool)($payload["accepted"] ?? false);
$locale = substr(trim((string)($payload["locale"] ?? "es")), 0, 8);
$website = trim((string)($payload["website"] ?? ""));
$submittedAt = (int)($payload["submittedAt"] ?? 0);
$nowMs = (int)round(microtime(true) * 1000);

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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email"]);
    exit;
}

$dbHost = getenv("NEWSLETTER_DB_HOST") ?: "yutopias.com";
$dbPort = (int)(getenv("NEWSLETTER_DB_PORT") ?: "3306");
$dbName = getenv("NEWSLETTER_DB_NAME") ?: "yutopias_wp_nico";
$dbUser = getenv("NEWSLETTER_DB_USER") ?: "nicolas";
$dbPassword = getenv("NEWSLETTER_DB_PASSWORD") ?: "yutopias";
$ipSalt = getenv("NEWSLETTER_IP_SALT") ?: "newsletter-default-salt";

$ip = $_SERVER["HTTP_X_FORWARDED_FOR"] ?? ($_SERVER["REMOTE_ADDR"] ?? "");
$ipFirst = trim(explode(",", $ip)[0]);
$ipHash = $ipFirst !== "" ? hash("sha256", $ipFirst . ":" . $ipSalt) : null;
$userAgent = substr((string)($_SERVER["HTTP_USER_AGENT"] ?? ""), 0, 255);
$nameValue = $name !== "" ? substr(preg_replace("/\\s+/", " ", $name) ?: "", 0, 255) : null;

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NULL,
            locale VARCHAR(8) NULL,
            privacy_accepted TINYINT(1) NOT NULL DEFAULT 0,
            source VARCHAR(120) NOT NULL,
            ip_hash VARCHAR(64) NULL,
            user_agent VARCHAR(255) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_newsletter_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $stmt = $pdo->prepare("
        INSERT INTO newsletter_subscribers (email, name, locale, privacy_accepted, source, ip_hash, user_agent)
        VALUES (:email, :name, :locale, 1, 'site-footer', :ip_hash, :user_agent)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            locale = VALUES(locale),
            privacy_accepted = VALUES(privacy_accepted),
            source = VALUES(source),
            ip_hash = VALUES(ip_hash),
            user_agent = VALUES(user_agent)
    ");

    $stmt->execute([
        ":email" => $email,
        ":name" => $nameValue,
        ":locale" => $locale,
        ":ip_hash" => $ipHash,
        ":user_agent" => $userAgent !== "" ? $userAgent : null,
    ]);

    echo json_encode(["ok" => true]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
