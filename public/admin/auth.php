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

/**
 * Acceso a la config cargada arriba desde dentro de una función.
 *
 * `$config` queda disponible en el scope que incluye este archivo (login.php,
 * index.php, api.php, …). requireAuth() no recibe parámetros —la llaman tres
 * páginas— y necesita consultar la DB, así que la config se guarda también
 * acá en vez de cambiarle la firma o depender de $GLOBALS.
 */
function adminConfig(?array $config = null): array {
    static $cached = [];
    if ($config !== null) $cached = $config;
    return $cached;
}
adminConfig($config);

// ─── Credentials ─────────────────────────────────────────────────────────────
// ⚠️  VACÍA A PROPÓSITO. NO volver a poblarla con hashes.
//
// Hasta el commit a3b7459 esta constante contenía los hashes bcrypt reales de
// las dos cuentas del panel. Este repositorio es PÚBLICO: esos hashes quedaron
// publicados y las contraseñas que representan se consideran comprometidas
// (ya rotadas por el flujo de recuperación).
//
// Mientras la constante siguiera poblada, CUALQUIER fallo de consulta a
// `admin_users` reactivaba la contraseña vieja publicada: rotarla desde el
// panel no la rotaba de verdad, era una puerta trasera permanente que anulaba
// el propósito de la feature.
//
// Fuente de verdad: la tabla `admin_users` (ver scripts/db-setup-production.sql).
// La red de seguridad ante un fallo de DB, SI se decide conservarla, vive en
// $config["admin_users_fallback"] dentro de private/newsletter-config.php, que
// existe SÓLO en el servidor y no se versiona. Si esa clave no está, el login
// falla cerrado. Ver odd/tasks/admin-password-recovery.md.
define("ADMIN_USERS", []);

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

/**
 * Tira la sesión actual y manda al login. No vuelve.
 */
function adminEndSession(): void {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) session_destroy();
    header("Location: login.php");
    exit;
}

function requireAuth(): void {
    startSecureSession();
    if (empty($_SESSION["admin_logged_in"])) {
        header("Location: login.php");
        exit;
    }

    // Un cambio de contraseña debe expulsar las sesiones ya abiertas: si no, un
    // atacante con sesión viva sobrevive al reset y la recuperación no sirve
    // para echarlo. login.php guarda el `password_changed_at` del momento de
    // autenticar; acá se compara con el valor vivo en DB.
    $email = (string)($_SESSION["admin_email"] ?? "");
    if ($email === "") adminEndSession();

    try {
        $liveStamp = adminPasswordStamp(getDb(adminConfig()), $email) ?? "";
    } catch (Throwable $dbError) {
        // DECISIÓN DELIBERADA: un hipo de DB NO puede dejar el panel
        // inaccesible. Se registra y se continúa con la sesión vigente. El
        // riesgo aceptado es que una sesión robada sobreviva mientras la DB
        // está caída; la alternativa (cerrar) convierte cualquier caída de DB
        // en un lockout total del admin legítimo justo cuando necesita entrar.
        error_log("[admin-auth] no se pudo revalidar password_changed_at: " . $dbError->getMessage());
        return;
    }

    // "" == nunca rotada. Una cuenta borrada de `admin_users` devuelve "" y
    // también cierra la sesión si traía sello.
    $knownStamp = (string)($_SESSION["admin_pwd_stamp"] ?? "");
    if ($liveStamp !== $knownStamp) adminEndSession();
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

    // hash_equals("", "") devuelve TRUE: un POST sin cookie de sesión arranca
    // una sesión vacía, así que sin este guard un formulario enviado con
    // csrf_token="" pasaba el chequeo. Afectaba a los tres formularios del
    // panel porque csrfToken() —que es lo que siembra la clave de sesión— se
    // llama DESPUÉS de procesar el POST. Ambos lados deben existir.
    $known = (string)($_SESSION["csrf_token"] ?? "");
    if ($known === "" || $token === "") return false;
    return hash_equals($known, $token);
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
 * Marca de la última rotación de contraseña de una cuenta, o null.
 *
 * null tanto si la cuenta no existe como si nunca rotó la contraseña
 * (`password_changed_at` NULL). La usa requireAuth() para invalidar sesiones
 * abiertas cuando la contraseña cambia.
 *
 * Lanza si la consulta falla.
 */
function adminPasswordStamp(PDO $pdo, string $email): ?string {
    $stmt = $pdo->prepare("SELECT password_changed_at FROM admin_users WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => adminNormalizeEmail($email)]);
    $row = $stmt->fetch();
    if (!is_array($row)) return null;

    $stamp = $row["password_changed_at"] ?? null;
    if (!is_string($stamp) || $stamp === "") return null;
    return $stamp;
}

/**
 * Igual que adminPasswordStamp() pero abre la conexión y no lanza: devuelve
 * null si la DB no está disponible. Para usar al autenticar, donde un fallo de
 * DB no debe tumbar el login (ya cubierto por el fallback de emergencia).
 */
function adminCurrentPasswordStamp(array $config, string $email): ?string {
    try {
        return adminPasswordStamp(getDb($config), $email);
    } catch (Throwable $dbError) {
        error_log("[admin-auth] no se pudo leer password_changed_at al autenticar: " . $dbError->getMessage());
        return null;
    }
}

/**
 * Fallback de emergencia leído de la config del servidor, nunca del código.
 *
 * Formato esperado en private/newsletter-config.php (archivo NO versionado, que
 * existe sólo en el servidor):
 *
 *     "admin_users_fallback" => [
 *         "jjm@yutopias.com" => '$2y$10$...hash bcrypt...',
 *     ],
 *
 * Si la clave no existe, está vacía o no es un array, no hay fallback y el
 * login falla cerrado. Las claves se normalizan acá, así que da igual cómo
 * estén escritas en la config.
 */
function adminFallbackHash(array $config, string $email): ?string {
    $fallback = $config["admin_users_fallback"] ?? null;
    if (!is_array($fallback)) return null;

    foreach ($fallback as $candidateEmail => $candidateHash) {
        if (adminNormalizeEmail((string)$candidateEmail) !== $email) continue;
        if (!is_string($candidateHash) || $candidateHash === "") return null;
        return $candidateHash;
    }
    return null;
}

/**
 * Verifica email + contraseña contra `admin_users`.
 *
 * Fuente de verdad: la DB. Una cuenta que SÍ se pudo consultar y no tiene hash
 * usable (inexistente, o `password_hash` NULL) falla aquí mismo sin mirar el
 * fallback: así una cuenta sin contraseña o eliminada de la DB no puede entrar
 * por la puerta de atrás, y una tabla vacía significa "nadie entra".
 *
 * El fallback de emergencia SÓLO se consulta si la consulta lanzó excepción
 * (tabla aún no migrada, DB caída) y vive en $config["admin_users_fallback"],
 * es decir en la config del servidor, no en este archivo versionado.
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
        $fallbackHash = adminFallbackHash($config, $email);
        if ($fallbackHash === null) {
            error_log(
                "[admin-auth] admin_users no disponible y sin fallback utilizable en "
                . "\$config[\"admin_users_fallback\"]; el login falla cerrado: "
                . $dbError->getMessage()
            );
            password_verify($password, ADMIN_DUMMY_HASH);  // igualar tiempos
            return false;
        }

        error_log(
            "[admin-auth] admin_users no disponible, usando el fallback de emergencia de la "
            . "config del servidor: " . $dbError->getMessage()
        );
        return password_verify($password, $fallbackHash);
    }
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
