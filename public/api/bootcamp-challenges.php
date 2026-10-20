<?php
declare(strict_types=1);

/**
 * bootcamp-challenges.php — respuestas del formulario de retos de la landing
 * oculta /es/bootcamp-retos (Bootcamp Zero, 22/10/2026).
 *
 * Sigue el patrón de openlab-contact.php: valida origen, honeypot y tiempo,
 * crea su propia tabla si no existe (no depende de una migración manual) y
 * guarda con prepared statements.
 *
 * Diferencias deliberadas respecto a openlab-contact.php:
 *   - SIN clave única por email: en un evento varias personas se apuntan desde
 *     el mismo sitio y queremos TODAS las respuestas, no un upsert.
 *   - Límite por IP MUY alto: los asistentes comparten el WiFi de la sede, así
 *     que salen todos con la misma IP pública. Un límite bajo dejaría fuera a
 *     la mayoría. Sigue habiendo tope para frenar un abuso automatizado.
 *   - Sin email al asistente ni notificación interna: no se pidió, y 60
 *     escaneos simultáneos generarían 60 correos.
 *   - Respuestas ANÓNIMAS permitidas: nombre, empresa, correo y consentimiento
 *     sólo se exigen si la persona marca la casilla de contacto. Las columnas
 *     siguen siendo NOT NULL y se guardan como cadena vacía, para no obligar a
 *     migrar una tabla ya creada.
 *
 * PHP 7.2 compatible (es la versión del servidor): sin arrow functions, ??=,
 * ?->, match ni str_contains.
 *
 * Ver odd/tasks/bootcamp-retos-landing.md.
 */

// ─── CORS ─────────────────────────────────────────────────────────────────────
$allowedOrigins = ["https://yutopias.com", "https://staging.yutopias.com"];

$localAppEnv = strtolower(trim((string)(getenv("APP_ENV") ?? "")));
if ($localAppEnv === "local" || $localAppEnv === "development") {
    $allowedOrigins[] = "http://localhost:3000";
    $allowedOrigins[] = "http://localhost:3001";
    $allowedOrigins[] = "http://127.0.0.1:3000";
}

$origin = isset($_SERVER["HTTP_ORIGIN"]) ? $_SERVER["HTTP_ORIGIN"] : "";
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: https://yutopias.com");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

// ─── Origin validation ────────────────────────────────────────────────────────
$requestOrigin = "";
if (isset($_SERVER["HTTP_ORIGIN"])) {
    $requestOrigin = (string)$_SERVER["HTTP_ORIGIN"];
} elseif (isset($_SERVER["HTTP_REFERER"])) {
    $requestOrigin = (string)$_SERVER["HTTP_REFERER"];
}
$validOrigin = false;
foreach ($allowedOrigins as $allowed) {
    if (strpos($requestOrigin, $allowed) === 0) { $validOrigin = true; break; }
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
$payload = json_decode($rawBody ? $rawBody : "{}", true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid payload"]);
    exit;
}

// ─── Honeypot ─────────────────────────────────────────────────────────────────
// El campo NO se llama "website": ese nombre lo rellenan el autorrelleno de
// Chrome y los gestores de contraseñas, lo que rechaza envíos legítimos.
$honeypot = trim((string)(isset($payload["contact_ref"]) ? $payload["contact_ref"] : ""));
if ($honeypot !== "") {
    // Respuesta de éxito a propósito: no se avisa al bot de que fue detectado.
    echo json_encode(["ok" => true]);
    exit;
}

// ─── Spam timing ──────────────────────────────────────────────────────────────
// Este formulario tiene casillas que leer: 1,5 s es un suelo prudente para una
// persona, imposible para un envío automatizado inmediato.
$submittedAt = (int)(isset($payload["submittedAt"]) ? $payload["submittedAt"] : 0);
$elapsedMs   = $submittedAt > 0 ? (int)(microtime(true) * 1000) - $submittedAt : PHP_INT_MAX;
if ($elapsedMs < 1500) {
    echo json_encode(["ok" => true]);
    exit;
}

// ─── Config / DB ──────────────────────────────────────────────────────────────
$configPath = getenv("NEWSLETTER_CONFIG_FILE") ?: dirname(dirname(__DIR__)) . "/private/newsletter-config.php";
$config = [];
if (is_file($configPath)) {
    $loaded = require $configPath;
    if (is_array($loaded)) { $config = $loaded; }
}

$dbHost     = (string)(isset($config["db_host"])     ? $config["db_host"]     : (getenv("PROD_DB_HOST")     ?: ""));
$dbPort     = (int)   (isset($config["db_port"])     ? $config["db_port"]     : (getenv("PROD_DB_PORT")     ?: 3306));
$dbName     = (string)(isset($config["db_name"])     ? $config["db_name"]     : (getenv("PROD_DB_NAME")     ?: ""));
$dbUser     = (string)(isset($config["db_user"])     ? $config["db_user"]     : (getenv("PROD_DB_USER")     ?: ""));
$dbPassword = (string)(isset($config["db_password"]) ? $config["db_password"] : (getenv("PROD_DB_PASSWORD") ?: ""));
$ipSalt     = (string)(isset($config["ip_salt"])     ? $config["ip_salt"]     : (getenv("NEWSLETTER_IP_SALT") ?: ""));

if ($dbHost === "" || $dbName === "" || $dbUser === "" || $dbPassword === "") {
    http_response_code(500);
    echo json_encode(["message" => "Database not configured"]);
    exit;
}

// ─── Campos y validación ──────────────────────────────────────────────────────
$fullName = substr(trim((string)(isset($payload["fullName"]) ? $payload["fullName"] : "")), 0, 180);
$email    = strtolower(substr(trim((string)(isset($payload["email"]) ? $payload["email"] : "")), 0, 255));
$company  = substr(trim((string)(isset($payload["company"]) ? $payload["company"] : "")), 0, 180);
$other    = substr(trim((string)(isset($payload["challengeOther"]) ? $payload["challengeOther"] : "")), 0, 300);
$locale   = substr(trim((string)(isset($payload["locale"]) ? $payload["locale"] : "es")), 0, 8);
$accepted = !empty($payload["accepted"]);
$wants    = !empty($payload["wantsContact"]);

// Los datos de contacto y el consentimiento sólo son obligatorios cuando la
// persona ha marcado que quiere que la contactemos. Sin esa casilla, la
// respuesta es anónima y válida: nos interesan los retos aunque no nos deje
// sus datos (ver maquetas del cliente, 20/10/2026).
if ($wants) {
    if ($fullName === "" || $email === "" || $company === "") {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields"]);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid email"]);
        exit;
    }
    if (!$accepted) {
        http_response_code(400);
        echo json_encode(["message" => "Privacy consent required"]);
        exit;
    }
} else {
    // Una respuesta anónima no guarda datos personales, ni siquiera si el
    // cliente los envía por error.
    $fullName = "";
    $email    = "";
    $company  = "";
    $accepted = false;
}

// Lista blanca: al cliente sólo se le aceptan estas claves, nunca texto libre
// en `challenges`. Debe coincidir con CHALLENGE_KEYS del componente React.
$allowedChallenges = ["predictive", "deviations", "objectives", "eu_taxonomy", "dashboards"];
$rawChallenges = isset($payload["challenges"]) && is_array($payload["challenges"])
    ? $payload["challenges"]
    : [];

$challenges = [];
foreach ($rawChallenges as $candidate) {
    if (!is_string($candidate)) { continue; }
    $candidate = trim($candidate);
    if (in_array($candidate, $allowedChallenges, true) && !in_array($candidate, $challenges, true)) {
        $challenges[] = $candidate;
    }
}

// Un envío sin ningún reto marcado no aporta nada: el formulario ya lo impide
// en el cliente y aquí se rechaza igual.
if (count($challenges) === 0 && $other === "") {
    http_response_code(400);
    echo json_encode(["message" => "Select at least one challenge"]);
    exit;
}

$ipHash = null;
$remoteIp = isset($_SERVER["REMOTE_ADDR"]) ? trim((string)$_SERVER["REMOTE_ADDR"]) : "";
if ($remoteIp !== "" && $ipSalt !== "") {
    $ipHash = hash("sha256", $remoteIp . ":" . $ipSalt);
}
$userAgent = substr((string)(isset($_SERVER["HTTP_USER_AGENT"]) ? $_SERVER["HTTP_USER_AGENT"] : ""), 0, 255);

// Tope por IP pensado para una sala entera compartiendo WiFi, no para una
// persona: frena un bot sin dejar fuera a los asistentes.
const RATE_LIMIT_MAX    = 200;
const RATE_LIMIT_WINDOW = 3600; // 1 hora

try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // ─── Bootstrap table ──────────────────────────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bootcamp_challenges (
            id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            full_name        VARCHAR(180)    NOT NULL,
            email            VARCHAR(255)    NOT NULL,
            company          VARCHAR(180)    NOT NULL,
            challenges       VARCHAR(500)    NOT NULL DEFAULT '',
            challenge_other  VARCHAR(500)    NULL,
            wants_contact    TINYINT(1)      NOT NULL DEFAULT 0,
            privacy_accepted TINYINT(1)      NOT NULL DEFAULT 0,
            status           VARCHAR(20)     NOT NULL DEFAULT 'pendiente',
            locale           VARCHAR(8)      NOT NULL DEFAULT 'es',
            ip_hash          VARCHAR(64)     NULL,
            user_agent       VARCHAR(255)    NULL,
            created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_bc_email      (email),
            KEY idx_bc_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ─── Rate limiting ────────────────────────────────────────────────────────
    if ($ipHash !== null) {
        try {
            $rlStmt = $pdo->prepare("
                SELECT COUNT(*) AS cnt
                  FROM bootcamp_challenges
                 WHERE ip_hash = :ip_hash
                   AND created_at >= DATE_SUB(NOW(), INTERVAL :window SECOND)
            ");
            $rlStmt->execute([":ip_hash" => $ipHash, ":window" => RATE_LIMIT_WINDOW]);
            $rlRow = $rlStmt->fetch();
            if ((int)(isset($rlRow["cnt"]) ? $rlRow["cnt"] : 0) >= RATE_LIMIT_MAX) {
                http_response_code(429);
                echo json_encode(["message" => "Too many requests"]);
                exit;
            }
        } catch (Throwable $ignored) {
            // Un fallo del contador nunca debe impedir guardar una respuesta.
        }
    }

    // ─── Insert ───────────────────────────────────────────────────────────────
    $pdo->prepare("
        INSERT INTO bootcamp_challenges
            (full_name, email, company, challenges, challenge_other, wants_contact, privacy_accepted, locale, ip_hash, user_agent)
        VALUES
            (:full_name, :email, :company, :challenges, :challenge_other, :wants_contact, :privacy_accepted, :locale, :ip_hash, :user_agent)
    ")->execute([
        ":full_name"        => $fullName,
        ":email"            => $email,
        ":company"          => $company,
        ":challenges"       => implode(",", $challenges),
        ":challenge_other"  => $other !== "" ? $other : null,
        ":wants_contact"    => $wants ? 1 : 0,
        ":privacy_accepted" => $accepted ? 1 : 0,
        ":locale"           => $locale,
        ":ip_hash"          => $ipHash,
        ":user_agent"       => $userAgent !== "" ? $userAgent : null,
    ]);

    echo json_encode(["ok" => true]);
} catch (Throwable $error) {
    error_log("[bootcamp-challenges] " . $error->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
