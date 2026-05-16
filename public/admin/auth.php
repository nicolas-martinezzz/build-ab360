<?php
declare(strict_types=1);

// ─── Config ───────────────────────────────────────────────────────────────────
// Try env override first, then walk up from FTP root conventions:
//   /admin.yutopias.com/httpdocs/ -> need /private/ at FTP root (/home/nico/private/)
//   Fallback: same pattern as yutopias.com main site (2 levels up + /private/)
$configPath = getenv("NEWSLETTER_CONFIG_FILE")
    ?: dirname(dirname(__DIR__)) . "/private/newsletter-config.php";
$config = [];
if (is_file($configPath)) {
    $loaded = require $configPath;
    if (is_array($loaded)) $config = $loaded;
}

// ─── Credentials ─────────────────────────────────────────────────────────────
// bcrypt hash of ">[REDACTED]"
define("ADMIN_USERS", [
    "jjm@yutopias.com"            => '$2y$10$Y.4udnEUBtN3N6JJVfB2..gJlPOiooDr1jVVX9uvZD2UtMNSI/rV6',
    "nicolas.martinez23@gmail.com" => '$2y$10$Y.4udnEUBtN3N6JJVfB2..gJlPOiooDr1jVVX9uvZD2UtMNSI/rV6',
]);

// ─── DB helper ────────────────────────────────────────────────────────────────
function getDb(array $config): PDO {
    $host = (string)($config["db_host"] ?? getenv("PROD_DB_HOST") ?? "");
    $port = (int)   ($config["db_port"] ?? getenv("PROD_DB_PORT") ?? 3306);
    $name = (string)($config["db_name"] ?? getenv("PROD_DB_NAME") ?? "");
    $user = (string)($config["db_user"] ?? getenv("PROD_DB_USER") ?? "");
    $pass = (string)($config["db_password"] ?? getenv("PROD_DB_PASSWORD") ?? "");

    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $host, $port, $name);
    return new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
}

// ─── Session helpers ──────────────────────────────────────────────────────────
function startSecureSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            "lifetime" => 0,
            "path"     => "/",
            "secure"   => isset($_SERVER["HTTPS"]),
            "httponly" => true,
            "samesite" => "Lax",
        ]);
        session_name("ADMIN_SID");
        session_start();
    }
}

function requireAuth(): void {
    startSecureSession();
    if (empty($_SESSION["admin_logged_in"])) {
        header("Location: login.php");
        exit;
    }
}

function isLoggedIn(): bool {
    startSecureSession();
    return !empty($_SESSION["admin_logged_in"]);
}

// ─── Rate limiter (file-based, no Redis needed) ───────────────────────────────
function checkRateLimit(string $ip): bool {
    $dir  = sys_get_temp_dir() . "/admin_rl";
    if (!is_dir($dir)) mkdir($dir, 0700, true);
    $file = $dir . "/" . md5($ip) . ".json";

    $data = ["count" => 0, "window_start" => time()];
    if (file_exists($file)) {
        $raw = json_decode(file_get_contents($file), true);
        if (is_array($raw)) $data = $raw;
    }

    // Reset window every 15 minutes
    if (time() - $data["window_start"] > 900) {
        $data = ["count" => 0, "window_start" => time()];
    }

    if ($data["count"] >= 10) return false;  // max 10 attempts per 15 min

    $data["count"]++;
    file_put_contents($file, json_encode($data), LOCK_EX);
    return true;
}

function clearRateLimit(string $ip): void {
    $dir  = sys_get_temp_dir() . "/admin_rl";
    $file = $dir . "/" . md5($ip) . ".json";
    if (file_exists($file)) unlink($file);
}

function csrfToken(): string {
    startSecureSession();
    if (empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }
    return $_SESSION["csrf_token"];
}

function verifyCsrf(string $token): bool {
    startSecureSession();
    return hash_equals($_SESSION["csrf_token"] ?? "", $token);
}
