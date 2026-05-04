<?php
declare(strict_types=1);
require_once __DIR__ . "/auth.php";
requireAuth();

$csrf = (string)($_GET["_csrf"] ?? "");
if (!verifyCsrf($csrf)) {
    http_response_code(403);
    die("CSRF invalid");
}

$table  = (string)($_GET["table"] ?? "diagnostics");
$format = in_array($_GET["format"] ?? "csv", ["csv", "excel"], true) ? $_GET["format"] : "csv";
$sourceMap = ["diagnostics" => "autodiagnostico", "reservaplaza" => "reserva-plaza"];

try {
    $pdo = getDb($config);
} catch (Throwable $e) {
    http_response_code(500);
    die("DB connection failed");
}

$queries = [
    "diagnostics" => "
        SELECT
            s.id              AS session_id,
            s.source,
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
        WHERE s.source = 'autodiagnostico'
        ORDER BY s.created_at DESC
    ",
    "reservaplaza" => "
        SELECT id, name, company, email, locale, privacy_accepted, created_at
        FROM reserva_plaza_leads
        ORDER BY created_at DESC
    ",
    "newsletter" => "
        SELECT id, email, name, locale, privacy_accepted, source, created_at, ip_hash
        FROM newsletter_subscribers
        ORDER BY created_at DESC
    ",
    "bootcamp" => "
        SELECT id, name, email, role_name, company, locale, privacy_accepted, created_at
        FROM bootcamp_leads
        ORDER BY created_at DESC
    ",
    "leads" => "
        SELECT
            l.session_id,
            l.first_name,
            l.last_name,
            l.email,
            l.company,
            l.role_name,
            l.challenge_text,
            l.privacy_accepted,
            s.locale,
            s.status,
            s.created_at,
            r.score_over_10,
            r.weighted_score,
            r.top_reto_1,
            r.top_reto_2,
            r.top_reto_3
        FROM diagnostic_leads l
        INNER JOIN diagnostic_sessions s ON s.id = l.session_id
        LEFT JOIN  diagnostic_results  r ON r.session_id = l.session_id
        ORDER BY s.created_at DESC
    ",
];

if (!isset($queries[$table])) {
    http_response_code(400);
    die("Unknown table");
}

$rows = $pdo->query($queries[$table])->fetchAll();
$date = date("Y-m-d");

if ($format === "csv") {
    header("Content-Type: text/csv; charset=utf-8");
    header("Content-Disposition: attachment; filename=\"{$table}-{$date}.csv\"");
    $out = fopen("php://output", "w");
    // UTF-8 BOM for Excel
    fputs($out, "\xEF\xBB\xBF");
    if (!empty($rows)) {
        fputcsv($out, array_keys($rows[0]));
        foreach ($rows as $row) fputcsv($out, $row);
    }
    fclose($out);
    exit;
}

// Excel via simple HTML table (opens correctly in Excel)
header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header("Content-Disposition: attachment; filename=\"{$table}-{$date}.xls\"");
echo '<html xmlns:o="urn:schemas-microsoft-com:office:office"
     xmlns:x="urn:schemas-microsoft-com:office:excel"
     xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>';
echo "<table border='1'>";
if (!empty($rows)) {
    echo "<tr>";
    foreach (array_keys($rows[0]) as $col) {
        echo "<th>" . htmlspecialchars((string)$col) . "</th>";
    }
    echo "</tr>";
    foreach ($rows as $row) {
        echo "<tr>";
        foreach ($row as $val) {
            echo "<td>" . htmlspecialchars((string)$val) . "</td>";
        }
        echo "</tr>";
    }
}
echo "</table></body></html>";
