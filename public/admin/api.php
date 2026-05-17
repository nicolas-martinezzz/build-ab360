<?php
declare(strict_types=1);
require_once file_exists(__DIR__ . "/.local") ? __DIR__ . "/auth.local.php" : __DIR__ . "/auth.php";
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

$isSqlite = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === "sqlite";

function jsonOut(mixed $data): void {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// SQLite-compatible date expression: last N days
function daysAgoExpr(bool $sqlite, int $days): string {
    return $sqlite
        ? "datetime('now', '-{$days} days')"
        : "DATE_SUB(NOW(), INTERVAL {$days} DAY)";
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

        try {
            $stats["ebook_leads"] = (int)$pdo->query(
                "SELECT COUNT(*) FROM ebook_leads"
            )->fetchColumn();
        } catch (Throwable $ignored) {
            $stats["ebook_leads"] = 0;
        }

        jsonOut(["ok" => true, "data" => $stats]);

    // ─── Sessions over time (last 90 days) ────────────────────────────────────
    case "chart_sessions_over_time":
        $cutoff = daysAgoExpr($isSqlite, 90);
        $rows = $pdo->query("
            SELECT DATE(created_at) AS day, COUNT(*) AS total
            FROM diagnostic_sessions
            WHERE created_at >= $cutoff
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

    // ─── AG Grid: autodiagnostico sessions ───────────────────────────────────
    case "table_diagnostics":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        $status = ($_GET["status"] ?? "all") === "completed" ? "completed" : "all";
        $conditions = ["s.source = 'autodiagnostico'"];
        if ($status === "completed") $conditions[] = "s.status = 'completed'";
        $where = "WHERE " . implode(" AND ", $conditions);

        $total = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_sessions s $where")->fetchColumn();

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

    // ─── AG Grid: reserva-plaza leads ────────────────────────────────────────
    case "table_reservaplaza":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        $total = (int)$pdo->query("SELECT COUNT(*) FROM reserva_plaza_leads")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, name, company, email, locale, privacy_accepted, created_at
            FROM reserva_plaza_leads
            ORDER BY created_at DESC
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
            SELECT id, email, name, locale, privacy_accepted, source, created_at, ip_hash
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

    // ─── Session answers (12 questions) ──────────────────────────────────────
    case "session_answers":
        $sessionId = trim((string)($_GET["session_id"] ?? ""));
        if ($sessionId === "") {
            http_response_code(400);
            echo json_encode(["error" => "session_id required"]);
            exit;
        }
        $stmt = $pdo->prepare("
            SELECT question_index, dimension, option_index, option_score
            FROM diagnostic_answers
            WHERE session_id = :sid
            ORDER BY question_index ASC
        ");
        $stmt->execute([":sid" => $sessionId]);
        $rows = $stmt->fetchAll();
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── AG Grid: ebook leads ─────────────────────────────────────────────────
    case "table_ebook_leads":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        // CREATE IF NOT EXISTS — MySQL only (SQLite table created by seed or ebook-lead.php)
        if (!$isSqlite) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS ebook_leads (
                    id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    email              VARCHAR(255) NOT NULL,
                    consent_accepted   TINYINT(1) NOT NULL DEFAULT 0,
                    consent_timestamp  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    source_article     VARCHAR(120) NOT NULL DEFAULT 'resources',
                    ip_hash            VARCHAR(64) NULL,
                    locale             VARCHAR(8) NULL,
                    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uq_ebook_email (email),
                    INDEX idx_ebook_ip (ip_hash),
                    INDEX idx_ebook_source (source_article)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        }

        $total = (int)$pdo->query("SELECT COUNT(*) FROM ebook_leads")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, email, source_article, locale, consent_accepted, created_at, updated_at
            FROM ebook_leads
            ORDER BY created_at DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        jsonOut(["ok" => true, "total" => $total, "page" => $page, "limit" => $limit, "data" => $rows]);

    // ─── Dashboard: score promedio por dimensión ──────────────────────────────
    case "chart_dim_scores":
        $rows = $pdo->query("
            SELECT
                AVG(score_a) AS avg_a,
                AVG(score_b) AS avg_b,
                AVG(score_c) AS avg_c,
                AVG(score_d) AS avg_d
            FROM diagnostic_results
        ")->fetch();
        jsonOut(["ok" => true, "data" => [
            ["dim" => "A · Decidir con datos",         "avg" => round((float)($rows["avg_a"] ?? 0), 1)],
            ["dim" => "B · Conocimiento del equipo",    "avg" => round((float)($rows["avg_b"] ?? 0), 1)],
            ["dim" => "C · Decisiones coordinadas",     "avg" => round((float)($rows["avg_c"] ?? 0), 1)],
            ["dim" => "D · Visión en tiempo real",      "avg" => round((float)($rows["avg_d"] ?? 0), 1)],
        ]]);

    // ─── Dashboard: abandono por pregunta ────────────────────────────────────
    case "chart_question_dropout":
        $total = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_sessions")->fetchColumn();
        if ($total === 0) { jsonOut(["ok" => true, "data" => []]); }
        $rows = $pdo->query("
            SELECT question_index, COUNT(DISTINCT session_id) AS answered
            FROM diagnostic_answers
            GROUP BY question_index
            ORDER BY question_index ASC
        ")->fetchAll();
        $data = [];
        foreach ($rows as $r) {
            $data[] = [
                "question" => "P" . ((int)$r["question_index"] + 1),
                "answered" => (int)$r["answered"],
                "pct"      => round((int)$r["answered"] / $total * 100, 1),
            ];
        }
        jsonOut(["ok" => true, "data" => $data]);

    // ─── Dashboard: score promedio por perfil ─────────────────────────────────
    case "chart_score_by_profile":
        $rows = $pdo->query("
            SELECT s.profile, ROUND(AVG(r.score_over_10), 1) AS avg_score, COUNT(*) AS total
            FROM diagnostic_sessions s
            INNER JOIN diagnostic_results r ON r.session_id = s.id
            WHERE s.profile IS NOT NULL
            GROUP BY s.profile
            ORDER BY avg_score DESC
        ")->fetchAll();
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── Dashboard: top retos ─────────────────────────────────────────────────
    case "chart_top_retos":
        $retos = [];
        foreach (["top_reto_1","top_reto_2","top_reto_3"] as $col) {
            $rows = $pdo->query("
                SELECT {$col} AS reto, COUNT(*) AS cnt
                FROM diagnostic_results
                WHERE {$col} IS NOT NULL AND {$col} != ''
                GROUP BY {$col}
            ")->fetchAll();
            foreach ($rows as $r) {
                $retos[$r["reto"]] = ($retos[$r["reto"]] ?? 0) + (int)$r["cnt"];
            }
        }
        arsort($retos);
        $data = [];
        foreach (array_slice($retos, 0, 6) as $name => $cnt) {
            $data[] = ["reto" => $name, "total" => $cnt];
        }
        jsonOut(["ok" => true, "data" => $data]);

    // ─── Dashboard: ebook leads por fuente ───────────────────────────────────
    case "chart_ebook_sources":
        try {
            $rows = $pdo->query("
                SELECT source_article, COUNT(*) AS total
                FROM ebook_leads
                GROUP BY source_article
                ORDER BY total DESC
            ")->fetchAll();
        } catch (\Throwable $e) { $rows = []; }
        jsonOut(["ok" => true, "data" => $rows]);

    // ─── Dashboard: leads captados últimos 60 días (todas las fuentes) ────────
    case "chart_leads_over_time":
        $cutoff = daysAgoExpr($isSqlite, 60);
        $parts = [];

        $r1 = $pdo->query("
            SELECT DATE(created_at) AS day, COUNT(*) AS n FROM diagnostic_sessions
            WHERE created_at >= $cutoff GROUP BY DATE(created_at)
        ")->fetchAll(PDO::FETCH_KEY_PAIR);

        $r2 = $pdo->query("
            SELECT DATE(created_at) AS day, COUNT(*) AS n FROM newsletter_subscribers
            WHERE created_at >= $cutoff GROUP BY DATE(created_at)
        ")->fetchAll(PDO::FETCH_KEY_PAIR);

        try {
            $r3 = $pdo->query("
                SELECT DATE(created_at) AS day, COUNT(*) AS n FROM ebook_leads
                WHERE created_at >= $cutoff GROUP BY DATE(created_at)
            ")->fetchAll(PDO::FETCH_KEY_PAIR);
        } catch (\Throwable $e) { $r3 = []; }

        $days = [];
        $start = strtotime("-60 days");
        for ($i = 0; $i <= 60; $i++) {
            $d = date("Y-m-d", $start + $i * 86400);
            $days[] = [
                "day"          => $d,
                "diagnosticos" => (int)($r1[$d] ?? 0),
                "newsletter"   => (int)($r2[$d] ?? 0),
                "ebook"        => (int)($r3[$d] ?? 0),
            ];
        }
        jsonOut(["ok" => true, "data" => $days]);

    // ─── Dashboard: tasa de conversión detallada ──────────────────────────────
    case "chart_conversion":
        $sessions  = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_sessions")->fetchColumn();
        $completed = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_sessions WHERE status='completed'")->fetchColumn();
        $leads     = (int)$pdo->query("SELECT COUNT(*) FROM diagnostic_leads")->fetchColumn();
        $newsletter= (int)$pdo->query("SELECT COUNT(*) FROM newsletter_subscribers")->fetchColumn();
        try {
            $ebook = (int)$pdo->query("SELECT COUNT(*) FROM ebook_leads")->fetchColumn();
        } catch (\Throwable $e) { $ebook = 0; }
        $bootcamp  = (int)$pdo->query("SELECT COUNT(*) FROM bootcamp_leads")->fetchColumn();

        jsonOut(["ok" => true, "data" => [
            ["label" => "Diagnósticos iniciados", "value" => $sessions,  "pct" => 100],
            ["label" => "Completados",             "value" => $completed, "pct" => $sessions ? round($completed/$sessions*100,1) : 0],
            ["label" => "Leads captados",          "value" => $leads,     "pct" => $sessions ? round($leads/$sessions*100,1) : 0],
            ["label" => "Newsletter",              "value" => $newsletter,"pct" => null],
            ["label" => "Ebook leads",             "value" => $ebook,     "pct" => null],
            ["label" => "Bootcamp",                "value" => $bootcamp,  "pct" => null],
        ]]);

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
}
