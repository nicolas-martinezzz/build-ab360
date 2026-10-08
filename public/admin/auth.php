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
// ⚠️  FALLBACK DE EMERGENCIA — NO es la fuente de verdad.
//
// Los hashes reales de las cuentas del panel viven en la tabla `admin_users`
// (ver scripts/db-setup-production.sql) y se leen con adminUserHash(). Esta
// constante SÓLO se consulta si la consulta a `admin_users` falla por completo
// (tabla inexistente porque aún no se corrió la migración, DB caída, etc.),
// para no dejar el panel sin acceso. Ese camino escribe un error_log.
//
// Mientras siga poblada, estas dos contraseñas siguen siendo válidas ante un
// fallo de DB aunque se cambien desde el panel. Vaciarla es una decisión
// aparte, a tomar una vez verificado que `admin_users` está en producción.
//
// bcrypt hash of ">[REDACTED]"
define("ADMIN_USERS", [
    "jjm@yutopias.com"            => '$2y$10$Y.4udnEUBtN3N6JJVfB2..gJlPOiooDr1jVVX9uvZD2UtMNSI/rV6',
    "nicolas.martinez23@gmail.com" => '$2y$10$Y.4udnEUBtN3N6JJVfB2..gJlPOiooDr1jVVX9uvZD2UtMNSI/rV6',
]);

// Hash bcrypt válido pero inservible: password_verify() contra él cuesta lo
// mismo que contra un hash real, así que el tiempo de respuesta de un login
// fallido no delata si la cuenta existe o no.
define("ADMIN_DUMMY_HASH", '$2y$10$AvAPH03iqfeN0uZLYQfOYunuM/CwzNs8/LajhQPearCIxIw4jjkbu');

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

// ─── Admin accounts (tabla `admin_users`) ─────────────────────────────────────

/**
 * Normaliza un email de admin para comparar y almacenar siempre igual.
 */
function adminNormalizeEmail(string $email): string {
    return strtolower(trim($email));
}

/**
 * Hash bcrypt USABLE de una cuenta, o null.
 *
 * Devuelve null tanto si la cuenta no existe como si existe con
 * `password_hash` NULL/vacío (cuenta creada sin contraseña, pendiente de
 * activación por el flujo de recuperación). Ambos casos deben fallar el login
 * de forma indistinguible: un NULL NUNCA es una credencial válida.
 *
 * Lanza si la consulta falla; el caller decide si usa el fallback de emergencia.
 */
function adminUserHash(PDO $pdo, string $email): ?string {
    $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => adminNormalizeEmail($email)]);
    $row = $stmt->fetch();
    if (!is_array($row)) return null;

    $hash = $row["password_hash"] ?? null;
    if (!is_string($hash) || $hash === "") return null;
    return $hash;
}

/**
 * ¿Existe la cuenta? (independientemente de si tiene contraseña).
 *
 * Una cuenta con `password_hash` NULL existe y SÍ debe poder pedir un enlace de
 * recuperación — es justamente así como se activa.
 *
 * Lanza si la consulta falla.
 */
function adminUserExists(PDO $pdo, string $email): bool {
    $stmt = $pdo->prepare("SELECT 1 FROM admin_users WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => adminNormalizeEmail($email)]);
    return $stmt->fetchColumn() !== false;
}

/**
 * Verifica email + contraseña contra `admin_users`.
 *
 * Fuente de verdad: la DB. Si la consulta falla por completo (tabla aún no
 * migrada, DB caída) cae al fallback de emergencia ADMIN_USERS y lo registra.
 * Una cuenta que SÍ se pudo consultar y no tiene hash usable falla aquí mismo,
 * sin tocar el fallback: así una cuenta sin contraseña (o eliminada de la DB)
 * no puede entrar por la puerta de atrás.
 */
function adminVerifyCredentials(array $config, string $email, string $password): bool {
    $email = adminNormalizeEmail($email);

    try {
        $hash = adminUserHash(getDb($config), $email);
        if ($hash === null) {
            password_verify($password, ADMIN_DUMMY_HASH);  // igualar tiempos
            return false;
        }
        return password_verify($password, $hash);
    } catch (Throwable $dbError) {
        error_log(
            "[admin-auth] admin_users no disponible, usando el fallback de emergencia ADMIN_USERS: "
            . $dbError->getMessage()
        );
    }

    $fallbackHash = ADMIN_USERS[$email] ?? null;
    if (!is_string($fallbackHash) || $fallbackHash === "") {
        password_verify($password, ADMIN_DUMMY_HASH);      // igualar tiempos
        return false;
    }
    return password_verify($password, $fallbackHash);
}

// ─── Helpers compartidos por el flujo de recuperación ─────────────────────────

/**
 * Base URL absoluta del panel, para construir enlaces en emails.
 *
 * Deliberadamente NO se deriva de $_SERVER["HTTP_HOST"]: un Host header
 * manipulado podría generar un enlace de recuperación que apunte al servidor
 * del atacante. Sólo config / entorno / literal conocido.
 */
function adminBaseUrl(array $config): string {
    $candidates = [
        (string)($config["admin_base_url"] ?? ""),
        (string)(getenv("ADMIN_BASE_URL") ?: ""),
        "https://admin.yutopias.com",
    ];
    foreach ($candidates as $candidate) {
        $candidate = rtrim(trim($candidate), "/");
        if ($candidate === "") continue;
        if (!preg_match('#^https?://[A-Za-z0-9.\-]+(?::\d+)?(?:/[A-Za-z0-9._~\-/]*)?$#', $candidate)) continue;
        return $candidate;
    }
    return "https://admin.yutopias.com";
}

/**
 * sha256 salteado de la IP, mismo esquema que los endpoints de public/api/.
 * Devuelve null si no hay IP o no hay `ip_salt` configurado: el hash es sólo
 * forense y jamás debe bloquear una recuperación de contraseña.
 */
function adminIpHash(array $config, string $ip): ?string {
    $salt = (string)($config["ip_salt"] ?? (getenv("NEWSLETTER_IP_SALT") ?: ""));
    $ip   = trim(explode(",", $ip)[0]);
    if ($ip === "" || $salt === "") return null;
    return hash("sha256", $ip . ":" . $salt);
}

/**
 * Dirección remitente para los emails del panel.
 */
function adminMailFrom(array $config): string {
    $from = (string)($config["mail_from"] ?? (getenv("NEWSLETTER_MAIL_FROM") ?: ""));
    $from = trim((string)preg_replace('/[\r\n]+/', "", $from));
    return filter_var($from, FILTER_VALIDATE_EMAIL) ? $from : "no-reply@yutopias.com";
}
