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

        try {
            $stats["openlab_contacts"] = (int)$pdo->query(
                "SELECT COUNT(*) FROM openlab_contacts"
            )->fetchColumn();
        } catch (Throwable $ignored) {
            $stats["openlab_contacts"] = 0;
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

    // ─── AG Grid: openlab contacts ───────────────────────────────────────────
    case "table_openlab":
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(500, max(1, (int)($_GET["limit"] ?? 100)));
        $offset = $page * $limit;

        if (!$isSqlite) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS openlab_contacts (
                    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    name             VARCHAR(240)    NOT NULL,
                    email            VARCHAR(255)    NOT NULL,
                    org              VARCHAR(180)    NOT NULL,
                    priority         VARCHAR(64)     NOT NULL,
                    message          TEXT            NOT NULL,
                    newsletter       TINYINT(1)      NOT NULL DEFAULT 0,
                    locale           VARCHAR(8)      NOT NULL DEFAULT 'es',
                    ip_hash          VARCHAR(64)     NULL,
                    user_agent       VARCHAR(255)    NULL,
                    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    KEY idx_email      (email),
                    KEY idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        }

        $total = (int)$pdo->query("SELECT COUNT(*) FROM openlab_contacts")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT id, name, email, org, priority, newsletter, locale, message, created_at
            FROM openlab_contacts
            ORDER BY created_at DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        jsonOut(["ok" => true, "total" => $total, "page" => $page, "limit" => $limit, "data" => $rows]);

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

        try {
            $openlab = (int)$pdo->query("SELECT COUNT(*) FROM openlab_contacts")->fetchColumn();
        } catch (\Throwable $e) { $openlab = 0; }

        jsonOut(["ok" => true, "data" => [
            ["label" => "Diagnósticos iniciados", "value" => $sessions,  "pct" => 100],
            ["label" => "Completados",             "value" => $completed, "pct" => $sessions ? round($completed/$sessions*100,1) : 0],
            ["label" => "Leads captados",          "value" => $leads,     "pct" => $sessions ? round($leads/$sessions*100,1) : 0],
            ["label" => "Newsletter",              "value" => $newsletter,"pct" => null],
            ["label" => "Ebook leads",             "value" => $ebook,     "pct" => null],
            ["label" => "Bootcamp",                "value" => $bootcamp,  "pct" => null],
            ["label" => "OpenLab",                 "value" => $openlab,   "pct" => null],
        ]]);

    // ─── Articles: CREATE TABLE IF NOT EXISTS (MySQL compat) ─────────────────
    case "articles_init":
        if (!$isSqlite) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS articles (
                    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    slug             VARCHAR(160) NOT NULL,
                    type             ENUM('article','ebook') NOT NULL DEFAULT 'article',
                    published_at     DATE NOT NULL,
                    reading_time_min SMALLINT UNSIGNED NOT NULL DEFAULT 5,
                    author           VARCHAR(120) NOT NULL DEFAULT '',
                    author_role      VARCHAR(120) NOT NULL DEFAULT '',
                    categories       JSON NOT NULL,
                    cover_image      VARCHAR(255) NOT NULL DEFAULT '',
                    cover_image_alt  VARCHAR(255) NOT NULL DEFAULT '',
                    featured         TINYINT(1) NOT NULL DEFAULT 0,
                    sort_order       SMALLINT NOT NULL DEFAULT 0,
                    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uq_slug (slug)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS article_translations (
                    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                    article_id  BIGINT UNSIGNED NOT NULL,
                    locale      ENUM('es','en','ca') NOT NULL,
                    title       TEXT NOT NULL,
                    excerpt     TEXT NOT NULL,
                    seo_title   VARCHAR(255) NOT NULL DEFAULT '',
                    seo_desc    VARCHAR(512) NOT NULL DEFAULT '',
                    content     LONGTEXT NOT NULL,
                    PRIMARY KEY (id),
                    UNIQUE KEY uq_article_locale (article_id, locale),
                    CONSTRAINT fk_at_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        }
        jsonOut(["ok" => true]);

    // ─── Articles: list ───────────────────────────────────────────────────────
    case "list_articles":
        // Auto-init on MySQL
        if (!$isSqlite) {
            $action = "articles_init";
            // re-run init inline
            include __FILE__;
        }
        $page   = max(0, (int)($_GET["page"] ?? 0));
        $limit  = min(200, max(1, (int)($_GET["limit"] ?? 50)));
        $offset = $page * $limit;
        $type   = $_GET["type"] ?? "all";

        $where = $type !== "all" ? "WHERE a.type = " . $pdo->quote($type) : "";
        $total = (int)$pdo->query("SELECT COUNT(*) FROM articles a $where")->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT
                a.id, a.slug, a.type, a.published_at, a.reading_time_min,
                a.author, a.author_role, a.categories, a.cover_image, a.cover_image_alt,
                a.featured, a.sort_order, a.created_at, a.updated_at,
                t.title, t.excerpt
            FROM articles a
            LEFT JOIN article_translations t ON t.article_id = a.id AND t.locale = 'es'
            $where
            ORDER BY a.sort_order DESC, a.published_at DESC
            LIMIT :lim OFFSET :off
        ");
        $stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
        $stmt->bindValue(":off", $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        jsonOut(["ok" => true, "total" => $total, "page" => $page, "data" => $rows]);

    // ─── Articles: get single (with all translations) ─────────────────────────
    case "get_article":
        $id = (int)($_GET["id"] ?? 0);
        if ($id <= 0) { http_response_code(400); echo json_encode(["error" => "id required"]); exit; }

        $article = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
        $article->execute([$id]);
        $row = $article->fetch();
        if (!$row) { http_response_code(404); echo json_encode(["error" => "Not found"]); exit; }

        $tStmt = $pdo->prepare("SELECT locale, title, excerpt, seo_title, seo_desc, content FROM article_translations WHERE article_id = ?");
        $tStmt->execute([$id]);
        $translations = [];
        foreach ($tStmt->fetchAll() as $t) {
            $translations[$t["locale"]] = [
                "title"     => $t["title"],
                "excerpt"   => $t["excerpt"],
                "seo_title" => $t["seo_title"],
                "seo_desc"  => $t["seo_desc"],
                "content"   => $t["content"],
            ];
        }
        $row["translations"] = $translations;
        jsonOut(["ok" => true, "data" => $row]);

    // ─── Articles: save (insert or update) ────────────────────────────────────
    case "save_article":
        if ($_SERVER["REQUEST_METHOD"] !== "POST") { http_response_code(405); echo json_encode(["error" => "POST required"]); exit; }
        $body = json_decode(file_get_contents("php://input"), true) ?? [];

        $id           = isset($body["id"]) ? (int)$body["id"] : 0;
        $slug         = trim((string)($body["slug"] ?? ""));
        $type         = in_array($body["type"] ?? "", ["article","ebook"]) ? $body["type"] : "article";
        $publishedAt  = trim((string)($body["published_at"] ?? date("Y-m-d")));
        $readingTime  = max(0, (int)($body["reading_time_min"] ?? 5));
        $author       = trim((string)($body["author"] ?? ""));
        $authorRole   = trim((string)($body["author_role"] ?? ""));
        $categories   = json_encode(array_values((array)($body["categories"] ?? [])));
        $coverImage   = trim((string)($body["cover_image"] ?? ""));
        $coverAlt     = trim((string)($body["cover_image_alt"] ?? ""));
        $featured     = (int)(bool)($body["featured"] ?? false);
        $sortOrder    = (int)($body["sort_order"] ?? 0);
        $translations = (array)($body["translations"] ?? []);

        if ($slug === "") { http_response_code(400); echo json_encode(["error" => "slug required"]); exit; }

        if ($id > 0) {
            $upd = $pdo->prepare("
                UPDATE articles SET
                    slug=?, type=?, published_at=?, reading_time_min=?,
                    author=?, author_role=?, categories=?, cover_image=?,
                    cover_image_alt=?, featured=?, sort_order=?,
                    updated_at=CURRENT_TIMESTAMP
                WHERE id=?
            ");
            $upd->execute([$slug,$type,$publishedAt,$readingTime,$author,$authorRole,
                           $categories,$coverImage,$coverAlt,$featured,$sortOrder,$id]);
        } else {
            $ins = $pdo->prepare("
                INSERT INTO articles (slug,type,published_at,reading_time_min,author,author_role,categories,cover_image,cover_image_alt,featured,sort_order)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            ");
            $ins->execute([$slug,$type,$publishedAt,$readingTime,$author,$authorRole,
                           $categories,$coverImage,$coverAlt,$featured,$sortOrder]);
            $id = (int)$pdo->lastInsertId();
        }

        foreach (["es","en","ca"] as $locale) {
            $tr = $translations[$locale] ?? [];
            $title   = trim((string)($tr["title"] ?? ""));
            $excerpt = trim((string)($tr["excerpt"] ?? ""));
            $seoT    = trim((string)($tr["seo_title"] ?? ""));
            $seoD    = trim((string)($tr["seo_desc"] ?? ""));
            $content = is_string($tr["content"] ?? null) ? $tr["content"] : json_encode($tr["content"] ?? []);

            if ($isSqlite) {
                $pdo->prepare("INSERT OR REPLACE INTO article_translations (article_id,locale,title,excerpt,seo_title,seo_desc,content) VALUES (?,?,?,?,?,?,?)")
                    ->execute([$id,$locale,$title,$excerpt,$seoT,$seoD,$content]);
            } else {
                $pdo->prepare("INSERT INTO article_translations (article_id,locale,title,excerpt,seo_title,seo_desc,content)
                    VALUES (?,?,?,?,?,?,?)
                    ON DUPLICATE KEY UPDATE title=VALUES(title), excerpt=VALUES(excerpt),
                        seo_title=VALUES(seo_title), seo_desc=VALUES(seo_desc), content=VALUES(content)")
                    ->execute([$id,$locale,$title,$excerpt,$seoT,$seoD,$content]);
            }
        }

        jsonOut(["ok" => true, "id" => $id]);

    // ─── Articles: delete ─────────────────────────────────────────────────────
    case "delete_article":
        if ($_SERVER["REQUEST_METHOD"] !== "POST") { http_response_code(405); echo json_encode(["error" => "POST required"]); exit; }
        $body = json_decode(file_get_contents("php://input"), true) ?? [];
        $id = (int)($body["id"] ?? 0);
        if ($id <= 0) { http_response_code(400); echo json_encode(["error" => "id required"]); exit; }
        $pdo->prepare("DELETE FROM articles WHERE id = ?")->execute([$id]);
        jsonOut(["ok" => true]);

    // ─── Articles: export as TypeScript ──────────────────────────────────────
    case "export_articles_ts":
        $rows = $pdo->query("
            SELECT a.*, t_es.title AS es_title, t_es.excerpt AS es_excerpt, t_es.seo_title AS es_seo_title, t_es.seo_desc AS es_seo_desc, t_es.content AS es_content,
                   t_en.title AS en_title, t_en.excerpt AS en_excerpt, t_en.seo_title AS en_seo_title, t_en.seo_desc AS en_seo_desc, t_en.content AS en_content,
                   t_ca.title AS ca_title, t_ca.excerpt AS ca_excerpt, t_ca.seo_title AS ca_seo_title, t_ca.seo_desc AS ca_seo_desc, t_ca.content AS ca_content
            FROM articles a
            LEFT JOIN article_translations t_es ON t_es.article_id = a.id AND t_es.locale = 'es'
            LEFT JOIN article_translations t_en ON t_en.article_id = a.id AND t_en.locale = 'en'
            LEFT JOIN article_translations t_ca ON t_ca.article_id = a.id AND t_ca.locale = 'ca'
            ORDER BY a.type ASC, a.sort_order DESC, a.published_at DESC
        ")->fetchAll();

        header("Content-Type: text/plain; charset=utf-8");
        header("Content-Disposition: attachment; filename=\"articles-export.ts\"");

        echo "// AUTO-GENERATED — do not edit manually. Use admin panel to update.\n";
        echo "import type { Article } from \"./types\";\n\n";

        $articleVars = [];
        $ebookVars   = [];

        foreach ($rows as $r) {
            $varName = str_replace(["-"," "], "_", $r["slug"]);
            $cats    = json_decode($r["categories"] ?? "[]", true) ?: [];
            $catsStr = "[" . implode(", ", array_map(function($c) { return "\"$c\""; }, $cats)) . "]";

            $buildTranslation = function(string $prefix) use ($r): string {
                $content = json_decode($r["{$prefix}_content"] ?? "[]", true) ?: [];
                $sections = [];
                foreach ($content as $s) {
                    $type = $s["type"] ?? "paragraph";
                    if ($type === "paragraph") {
                        $t = addslashes($s["text"] ?? "");
                        $sections[] = "        { type: \"paragraph\", text: \"$t\" }";
                    } elseif ($type === "heading") {
                        $t = addslashes($s["text"] ?? "");
                        $sections[] = "        { type: \"heading\", level: " . (int)($s["level"] ?? 2) . ", text: \"$t\" }";
                    } elseif ($type === "list") {
                        $items = array_map(function($i) { return "\"" . addslashes($i) . "\""; }, (array)($s["items"] ?? []));
                        $sections[] = "        { type: \"list\", items: [" . implode(", ", $items) . "] }";
                    } elseif ($type === "quote") {
                        $t = addslashes($s["text"] ?? "");
                        $attr = isset($s["attribution"]) ? ", attribution: \"" . addslashes($s["attribution"]) . "\"" : "";
                        $sections[] = "        { type: \"quote\", text: \"$t\"$attr }";
                    } elseif ($type === "callout") {
                        $t = addslashes($s["text"] ?? "");
                        $sections[] = "        { type: \"callout\", text: \"$t\" }";
                    }
                }
                $title   = addslashes($r["{$prefix}_title"]     ?? "");
                $excerpt = addslashes($r["{$prefix}_excerpt"]    ?? "");
                $seoT    = addslashes($r["{$prefix}_seo_title"]  ?? "");
                $seoD    = addslashes($r["{$prefix}_seo_desc"]   ?? "");
                $contentStr = empty($sections) ? "" : "\n" . implode(",\n", $sections) . "\n      ";
                return "    {
      title: \"$title\",
      excerpt: \"$excerpt\",
      seoTitle: \"$seoT\",
      seoDescription: \"$seoD\",
      content: [$contentStr],
    }";
            };

            $featured    = $r["featured"] ? "true" : "false";
            $type        = $r["type"] === "ebook" ? "\n  type: \"ebook\"," : "";
            $typeComment = $r["type"] === "ebook" ? " (ebook)" : "";
            $readTime    = (int)$r["reading_time_min"];
            $slug        = $r["slug"];
            $publishedAt = $r["published_at"];
            $author      = addslashes($r["author"]);
            $authorRole  = addslashes($r["author_role"]);
            $coverImg    = $r["cover_image"];
            $coverAlt    = addslashes($r["cover_image_alt"]);

            $es = $buildTranslation("es");
            $en = $buildTranslation("en");
            $ca = $buildTranslation("ca");

            $commentStr = $typeComment !== "" ? " // $typeComment" : "";
            echo "export const {$varName}: Article ={$commentStr}\n";
            echo "  slug: \"$slug\",$type\n";
            echo "  publishedAt: \"$publishedAt\",\n";
            echo "  readingTimeMin: $readTime,\n";
            echo "  author: \"$author\",\n";
            echo "  authorRole: \"$authorRole\",\n";
            echo "  categories: $catsStr,\n";
            echo "  coverImage: \"$coverImg\",\n";
            echo "  coverImageAlt: \"$coverAlt\",\n";
            if ($r["featured"]) echo "  featured: true,\n";
            echo "  translations: {\n    es:\n$es,\n    en:\n$en,\n    ca:\n$ca,\n  },\n};\n\n";

            if ($r["type"] === "ebook") {
                $ebookVars[] = $varName;
            } else {
                $articleVars[] = $varName;
            }
        }

        echo "export const ALL_ARTICLES: Article[] = [" . implode(", ", $articleVars) . "];\n";
        echo "export const ALL_EBOOKS: Article[]   = [" . implode(", ", $ebookVars) . "];\n";
        echo "export const ALL_CONTENT: Article[]  = [...ALL_EBOOKS, ...ALL_ARTICLES];\n\n";
        echo "export const getArticleBySlug = (slug: string) => ALL_CONTENT.find((a) => a.slug === slug);\n";
        echo "export const getRelatedArticles = (slug: string, limit = 3): Article[] =>\n";
        echo "  ALL_ARTICLES.filter((a) => a.slug !== slug).slice(0, limit);\n";
        exit;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown action"]);
}
