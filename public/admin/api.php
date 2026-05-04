<?php
declare(strict_types=1);
require_once __DIR__ . "/auth.php";
requireAuth();

header("Content-Type: application/json; charset=utf-8");

$action = (string)($_GET["action"] ?? "");
$csrf   = (string)($_GET["_csrf"] ?? $_POST["_csrf"] ?? "");

if (!verifyCsrf($csrf)) {
    http_response_code(403);
    echo json_encode(["error" => "CSRF invalid"]);
    exit;
}

try {
    $pdo = getDb($config);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}

function jsonOut(mixed $data): void {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

switch ($action) {

    // ─── Dashboard stats ──────────────────────────────────────────────────────
    case "stats":
        $stats = [];

        $stats["total_diagnostics"] = (int)$pdo->query(
            "SELECT COUNT(*) FROM diagnostic_sessions"
        )->fetchColumn();

        $stats["completed_diagnostics"] = (int)$pdo->query(
            "SELECT COUNT(*) FROM diagnostic_sessions WHERE status='completed'"
        )->fetchColumn();

        $stats["total_leads"] = (int)$pdo->query(
            "SELECT COUNT(*) FROM diagnostic_leads"
        )->fetchColumn();

        $stats["newsletter_subscribers"] = (int)$pdo->query(
            "SELECT COUNT(*) FROM newsletter_subscribers"
        )->fetchColumn();

        $stats["bootcamp_leads"] = (int)$pdo->query(
            "SELECT COUNT(*) FROM bootcamp_leads"
        )->fetchColumn();

        $stats["avg_score"] = round((float)$pdo->query(
            "SELECT COALESCE(AVG(score_over_10), 0) FROM diagnostic_results"
        )->fetchColumn(), 1);

        jsonOut(["ok" => true, "data" => $stats]);

    // ─── Sessions over time (last 90 days) ────────────────────────────────────
    case "chart_sessions_over_time":
        $rows = $pdo->query("
            SELECT DATE(created_at) AS day, COUNT(*) AS total
            FROM diagnostic_sessions
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            GROUP BY DATE(created_at)
            ORDER BY day ASC
        ")->fetchAll();
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── Conversion funnel ────────────────────────────────────────────────────
    case "chart_funnel":
        $total    = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_sessions")->fetchColumn();
        $leads    = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_leads")->fetchColumn();
        $complete = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_sessions WHERE status='completed'")->fetchColumn();
        jsonOut(["ok" => true, "data" => [
            ["label" => "Sesiones iniciadas", "value" => $total],
            ["label" => "Leads captados",     "value" => $leads],
            ["label" => "Completados",        "value" => $complete],
        ]]);

    // ─── Profile distribution ─────────────────────────────────────────────────
    case "chart_profiles":
        $rows = $pdo->query("
            SELECT profile, COUNT(*) AS total
            FROM diagnostic_sessions
            WHERE profile IS NOT NULL
            GROUP BY profile
            ORDER BY total DESC
        ")->fetchAll();
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── Score distribution (buckets) ─────────────────────────────────────────
    case "chart_scores":
        $rows = $pdo->query("
            SELECT
                CASE
                    WHEN score_over_10 < 3  THEN '0-2'
                    WHEN score_over_10 < 5  THEN '3-4'
                    WHEN score_over_10 < 7  THEN '5-6'
                    WHEN score_over_10 < 9  THEN '7-8'
                    ELSE '9-10'
                END AS bucket,
                COUNT(*) AS total
            FROM diagnostic_results
            GROUP BY bucket
            ORDER BY MIN(score_over_10)
        ")->fetchAll();
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── Locales distribution ─────────────────────────────────────────────────
    case "chart_locales":
        $rows = $pdo->query("
            SELECT locale, COUNT(*) AS total
            FROM diagnostic_sessions
            GROUP BY locale
            ORDER BY total DESC
        ")->fetchAll();
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── AG Grid: diagnostic full table ──────────────────────────────────────
    case "table_diagnostics":
        $page  = max(0, (int)($_GET["page"] ?? 0));
        $limit = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        $status = ($_GET["status"] ?? "all") === "completed" ? "completed" : "all";
        $where  = $status === "completed" ? "WHERE s.status = 'completed'" : "";

        $total = (int)$pdo->query(
            "SELECT COUNT(*) FROM diagnostic_sessions s $where"
        )->fetchColumn();

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
            $where
            ORDER BY s.created_at DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        jsonOut(["ok" => true, "total" => $total, "page" => $page, "limit" => $limit, "data" => $rows]);

    // ─── AG Grid: newsletter subscribers ─────────────────────────────────────
    case "table_newsletter":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        $total = (int)$pdo->query("SELECT COUNT(*) FROM newsletter_subscribers")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, email, locale, status, created_at, ip_hash
            FROM newsletter_subscribers
            ORDER BY created_at DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        jsonOut(["ok" => true, "total" => $total, "page" => $page, "limit" => $limit, "data" => $rows]);

    // ─── AG Grid: bootcamp leads ──────────────────────────────────────────────
    case "table_bootcamp":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        $total = (int)$pdo->query("SELECT COUNT(*) FROM bootcamp_leads")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, name, email, role_name, company, locale, privacy_accepted, created_at
            FROM bootcamp_leads
            ORDER BY created_at DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        jsonOut(["ok" => true, "total" => $total, "page" => $page, "limit" => $limit, "data" => $rows]);

    // ─── AG Grid: diagnostic leads ────────────────────────────────────────────
    case "table_leads":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        $total = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_leads")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT
                l.session_id,
                l.first_name,
                l.last_name,
                l.email,
                l.company,
                l.role_name,
                l.challenge_text,
                l.privacy_accepted,
                l.updated_at,
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
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        jsonOut(["ok" => true, "total" => $total, "page" => $page, "limit" => $limit, "data" => $rows]);

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
}
