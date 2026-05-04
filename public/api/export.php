<?php
declare(strict_types=1);

// ─── Config file (production uses private/newsletter-config.php) ─────────────
$configPath = getenv("NEWSLETTER_CONFIG_FILE") ?: dirname(dirname(__DIR__)) . "/private/newsletter-config.php";
$config = [];
if (is_file($configPath)) {
    $loaded = require $configPath;
    if (is_array($loaded)) $config = $loaded;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Expects: GET /api/export.php?key=<EXPORT_API_KEY>[&format=json|csv][&status=completed|all][&limit=500]
$apiKey = (string)($config["export_api_key"] ?? getenv("EXPORT_API_KEY") ?? "");
if ($apiKey === "") {
    http_response_code(503);
    echo json_encode(["message" => "Export not configured"]);
    exit;
}

$providedKey = trim((string)($_GET["key"] ?? ""));
if (!hash_equals($apiKey, $providedKey)) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

// ─── DB config ────────────────────────────────────────────────────────────────
$dbHost     = (string)($config["db_host"]     ?? getenv("NEWSLETTER_DB_HOST")     ?? "");
$dbPort     = (int)   ($config["db_port"]     ?? getenv("NEWSLETTER_DB_PORT")     ?? 3306);
$dbName     = (string)($config["db_name"]     ?? getenv("NEWSLETTER_DB_NAME")     ?? "");
$dbUser     = (string)($config["db_user"]     ?? getenv("NEWSLETTER_DB_USER")     ?? "");
$dbPassword = (string)($config["db_password"] ?? getenv("NEWSLETTER_DB_PASSWORD") ?? "");

if ($dbHost === "" || $dbName === "" || $dbUser === "" || $dbPassword === "") {
    http_response_code(500);
    echo json_encode(["message" => "Database not configured"]);
    exit;
}

// ─── Query params ─────────────────────────────────────────────────────────────
$format = in_array($_GET["format"] ?? "json", ["json", "csv"], true) ? $_GET["format"] : "json";
$status = ($_GET["status"] ?? "completed") === "all" ? "all" : "completed";
$limit  = max(1, min(2000, (int)($_GET["limit"] ?? 500)));

// ─── DB ───────────────────────────────────────────────────────────────────────
try {
    $dsn = sprintf("mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4", $dbHost, $dbPort, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPassword, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    $whereStatus = $status === "all" ? "" : "WHERE s.status = 'completed'";

    $stmt = $pdo->prepare("
        SELECT
            s.id              AS session_id,
            s.locale,
            s.profile,
            s.status,
            s.created_at,
            s.completed_at,
            l.first_name,
            l.last_name,
            l.company,
            l.role_name,
            l.email,
            l.challenge_text,
            r.weighted_score,
            r.score_over_10,
            r.score_a,
            r.score_b,
            r.score_c,
            r.score_d,
            r.top_reto_1,
            r.top_reto_2,
            r.top_reto_3
        FROM diagnostic_sessions s
        LEFT JOIN diagnostic_leads   l ON l.session_id = s.id
        LEFT JOIN diagnostic_results r ON r.session_id = s.id
        {$whereStatus}
        ORDER BY s.created_at DESC
        LIMIT :lim
    ");
    $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    if ($format === "csv") {
        header("Content-Type: text/csv; charset=utf-8");
        header("Content-Disposition: attachment; filename=\"diagnosticos-" . date("Y-m-d") . ".csv\"");

        $out = fopen("php://output", "w");
        if (!empty($rows)) {
            fputcsv($out, array_keys($rows[0]));
            foreach ($rows as $row) fputcsv($out, $row);
        }
        fclose($out);
    } else {
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode([
            "ok"    => true,
            "total" => count($rows),
            "data"  => $rows,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["message" => "Internal error"]);
}
