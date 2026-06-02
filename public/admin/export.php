<?php
declare(strict_types=1);
require_once file_exists(__DIR__ . "/.local") ? __DIR__ . "/auth.local.php" : __DIR__ . "/auth.php";
requireAuth();

$csrf = (string)($_GET["_csrf"] ?? "");
if (!verifyCsrf($csrf)) {
    http_response_code(403);
    die("CSRF invalid");
}

$table  = (string)($_GET["table"] ?? "diagnostics");
$format = in_array($_GET["format"] ?? "csv", ["csv", "excel"], true) ? $_GET["format"] : "csv";

try {
    $pdo = getDb($config);
} catch (Throwable $e) {
    http_response_code(500);
    die("DB connection failed");
}

// ─── Question bank (mirrors src/lib/diagnostic/data.ts QS) ───────────────────
const QUESTIONS = [
    ["dim" => "A", "text" => "En la fase de anteproyecto o viabilidad, ¿qué información económica y ambiental maneja el equipo técnico?",
     "opts" => ["Principalmente el coste de construcción. El impacto ambiental, si se calcula, llega después y por separado.",
                "Tenemos ratios de coste por tipología y algún indicador de carbono, pero no los cruzamos en el mismo modelo.",
                "Usamos herramientas de presupuesto y de huella de carbono, pero cada una vive en su propio sistema.",
                "Trabajamos con un modelo que genera simultáneamente ratios económicas y ambientales desde el primer boceto."]],
    ["dim" => "A", "text" => "Cuando hay que justificar el presupuesto de un proyecto ante dirección o ante un cliente, ¿qué argumento respalda las cifras?",
     "opts" => ["La experiencia del técnico que lo elabora. Si él lo dice, se asume que es razonable.",
                "Comparamos con proyectos anteriores, pero la búsqueda es manual y los datos no siempre son comparables.",
                "Tenemos una base de ratios de proyectos anteriores, aunque no está conectada al modelo actual del proyecto.",
                "El presupuesto se contrasta automáticamente con históricos de la misma tipología, fase y escala."]],
    ["dim" => "A", "text" => "Piensa en el último proyecto donde hubo un sobrecoste relevante. ¿En qué momento se supo?",
     "opts" => ["Cuando ya estaba ejecutado o muy avanzado. La desviación se gestionó cuando no había mucho margen.",
                "Relativamente tarde; alguien del equipo lo detectó revisando las certificaciones o el cierre mensual.",
                "Con cierta antelación gracias al seguimiento del director de proyecto, aunque el proceso es manual.",
                "Se detectó en fase de diseño gracias a un sistema de alertas antes de que afectara a la ejecución."]],
    ["dim" => "A", "text" => "¿Qué ocurre cuando un financiador o socio inversor pregunta por el cumplimiento de la Taxonomía Europea del proyecto?",
     "opts" => ["Es un tema pendiente. Sabemos que viene pero aún no tenemos un proceso para gestionarlo.",
                "Lo gestiona un técnico o consultor externo recopilando datos manualmente del proyecto. Lleva tiempo.",
                "Tenemos alguna herramienta o proceso, pero los indicadores no salen directamente del modelo del proyecto.",
                "Los indicadores DNSH y ratios financieras exigidas se generan desde el propio modelo del proyecto."]],
    ["dim" => "B", "text" => "Imagina que mañana tu técnico con más años en la empresa decide irse. ¿Qué se va con él?",
     "opts" => ["Se va gran parte del criterio técnico real. Hay documentos, pero no capturan el razonamiento detrás.",
                "Se va más de lo que quisiéramos. Hay carpetas y correos, pero reconstruir su lógica lleva semanas.",
                "Tenemos algo documentado, pero la base no está estructurada de forma que sea fácilmente reutilizable.",
                "El conocimiento está en el modelo de la organización. Su marcha sería una pérdida, no una descapitalización."]],
    ["dim" => "B", "text" => "Cuando llega un pliego de licitación de 300 páginas, ¿cuánto tarda el equipo en tener una lectura técnica útil?",
     "opts" => ["Días. Cada técnico lee lo que le toca y se pone en común. Hay riesgo de que algo se escape.",
                "Tenemos un esquema de análisis propio que ayuda, pero sigue siendo un proceso manual intensivo.",
                "Usamos alguna herramienta de IA para extraer puntos clave, aunque no está integrada con nuestros proyectos.",
                "Un asistente procesa el pliego en minutos, extrae los requisitos clave y los cruza con proyectos similares."]],
    ["dim" => "B", "text" => "Al arrancar el estudio económico de un proyecto nuevo, ¿cómo influyen los proyectos ya entregados?",
     "opts" => ["Poco o nada de forma sistemática. Cada proyecto nuevo arranca sin aprender formalmente del anterior.",
                "Alguien del equipo recuerda proyectos similares y ajusta a ojo. Depende de quién haga el estudio.",
                "Tenemos una base de datos de costes reales, pero consultarla y aplicarla al nuevo proyecto es manual.",
                "Los costes reales de proyectos cerrados actualizan automáticamente las bases de referencia para los siguientes."]],
    ["dim" => "C", "text" => "A mitad de un proyecto complejo, ¿cuántas 'versiones del proyecto' coexisten entre los distintos agentes?",
     "opts" => ["Varias, con diferencias que se descubren tarde. Los conflictos de versiones son una fuente habitual de retrabajo.",
                "Intentamos mantener una referencia común, pero la coordinación es por correo y reuniones; hay desfases.",
                "Compartimos un repositorio (BIM o similar), pero los cambios no siempre se trazan ni se comunican bien.",
                "Todos trabajan sobre el mismo modelo con trazabilidad de cambios. Los conflictos de versión no existen."]],
    ["dim" => "C", "text" => "Si asignas a un equipo distinto un proyecto del mismo tipo que ya has entregado bien, ¿qué nivel de resultado esperas?",
     "opts" => ["Honestamente, el resultado varía bastante. Hay equipos que funcionan mejor que otros con el mismo tipo de proyecto.",
                "Hay procedimientos escritos, pero en la práctica cada equipo los adapta. El resultado es desigual.",
                "Los procesos están bastante definidos, aunque su seguimiento y actualización requieren esfuerzo manual.",
                "El resultado debería ser equivalente. Trabajamos con procedimientos estándar que el equipo aplica sin ambigüedad."]],
    ["dim" => "C", "text" => "Si dentro de dos años alguien cuestiona judicialmente una decisión técnica tomada hoy, ¿qué prueba existe de quién la tomó, con qué información y por qué?",
     "opts" => ["Correos y actas dispersas. Reconstruir la trazabilidad completa llevaría días y probablemente quedaría incompleta.",
                "Hay documentación, pero no está centralizada ni organizada para ser fácilmente auditable.",
                "Tenemos un sistema de registro de decisiones, aunque no está completamente integrado con el modelo del proyecto.",
                "Existe un historial estructurado e inalterable con la decisión, el responsable, la fecha y el contexto técnico."]],
    ["dim" => "D", "text" => "Si esta tarde dirección te pregunta cuál es el riesgo financiero real de la cartera de proyectos en curso, ¿en cuánto tiempo tienes una respuesta fiable?",
     "opts" => ["Días. Necesitaría pedir datos a cada equipo, consolidar en Excel y revisar que no hay errores.",
                "Algunas horas. Tengo dashboards parciales pero necesito completar huecos manualmente.",
                "Tengo visibilidad por proyecto, pero la vista consolidada de cartera requiere trabajo adicional.",
                "Menos de una hora. El cuadro de mando muestra el estado en tiempo real sin trabajo adicional."]],
    ["dim" => "D", "text" => "Cuando se toma una decisión técnica relevante en obra, ¿cómo llega ese impacto a la dirección financiera?",
     "opts" => ["No llega de forma automática. El director de obra lo comunica cuando puede, o lo descubren en la siguiente reunión.",
                "Hay un proceso de comunicación, pero tarda días. El análisis de impacto financiero es manual.",
                "Usamos herramientas de gestión que lo registran, aunque la conexión con el modelo financiero requiere trabajo manual.",
                "El cambio técnico actualiza el modelo financiero al instante. La dirección lo ve en su cuadro de mando."]],
];

// ─── Simple table queries ─────────────────────────────────────────────────────
$queries = [
    "diagnostics" => "
        SELECT
            s.id              AS session_id,
            s.locale,
            s.profile,
            s.status,
            s.created_at,
            s.completed_at,
            l.first_name,
            l.last_name,
            l.email,
            l.company,
            l.role_name,
            l.challenge_text,
            r.score_over_10,
            r.weighted_score,
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
    "ebook_leads" => "
        SELECT id, email, source_article, locale, consent_accepted, created_at, updated_at
        FROM ebook_leads
        ORDER BY created_at DESC
    ",
    "openlab" => "
        SELECT id, name, email, org, priority, message, newsletter, locale, created_at
        FROM openlab_contacts
        ORDER BY created_at DESC
    ",
];

// ─── Full diagnostics export (one row per session with all 12 answers) ────────
if ($table === "diagnostics_full") {
    $sessions = $pdo->query("
        SELECT
            s.id              AS session_id,
            s.locale,
            s.profile,
            s.status,
            s.created_at,
            s.completed_at,
            l.first_name,
            l.last_name,
            l.email,
            l.company,
            l.role_name,
            l.challenge_text,
            r.score_over_10,
            r.weighted_score,
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
    ")->fetchAll();

    // Fetch all answers in one query, index by session_id → question_index
    $answerRows = $pdo->query("
        SELECT session_id, question_index, option_index, option_score
        FROM diagnostic_answers
        ORDER BY session_id, question_index
    ")->fetchAll();

    $answerMap = [];
    foreach ($answerRows as $a) {
        $answerMap[$a["session_id"]][(int)$a["question_index"]] = $a;
    }

    // Build flat rows: base fields + P1..P12 columns
    $rows = [];
    foreach ($sessions as $s) {
        $sid = $s["session_id"];
        $row = [
            "session_id"    => $sid,
            "fecha"         => $s["created_at"],
            "completado"    => $s["completed_at"] ?? "",
            "estado"        => $s["status"],
            "idioma"        => $s["locale"] ?? "",
            "perfil"        => $s["profile"] ?? "",
            "nombre"        => trim(($s["first_name"] ?? "") . " " . ($s["last_name"] ?? "")),
            "email"         => $s["email"] ?? "",
            "empresa"       => $s["company"] ?? "",
            "rol"           => $s["role_name"] ?? "",
            "desafio"       => $s["challenge_text"] ?? "",
            "score_10"      => $s["score_over_10"] ?? "",
            "score_pond"    => $s["weighted_score"] ?? "",
            "score_A"       => $s["score_a"] ?? "",
            "score_B"       => $s["score_b"] ?? "",
            "score_C"       => $s["score_c"] ?? "",
            "score_D"       => $s["score_d"] ?? "",
            "reto_1"        => $s["top_reto_1"] ?? "",
            "reto_2"        => $s["top_reto_2"] ?? "",
            "reto_3"        => $s["top_reto_3"] ?? "",
        ];

        // Add one column set per question
        foreach (QUESTIONS as $qi => $q) {
            $n   = $qi + 1;
            $ans = $answerMap[$sid][$qi] ?? null;
            $optIdx = $ans ? (int)$ans["option_index"] : null;
            $row["P{$n}_dimension"]  = $q["dim"];
            $row["P{$n}_pregunta"]   = $q["text"];
            $row["P{$n}_respuesta"]  = ($optIdx !== null) ? ($q["opts"][$optIdx] ?? "") : "";
            $row["P{$n}_score"]      = $ans ? (int)$ans["option_score"] : "";
        }

        $rows[] = $row;
    }

    $date = date("Y-m-d");

    if ($format === "csv") {
        header("Content-Type: text/csv; charset=utf-8");
        header("Content-Disposition: attachment; filename=\"diagnosticos-completos-{$date}.csv\"");
        $out = fopen("php://output", "w");
        fputs($out, "\xEF\xBB\xBF");
        if (!empty($rows)) {
            fputcsv($out, array_keys($rows[0]));
            foreach ($rows as $row) fputcsv($out, $row);
        }
        fclose($out);
        exit;
    }

    // Excel
    header("Content-Type: application/vnd.ms-excel; charset=utf-8");
    header("Content-Disposition: attachment; filename=\"diagnosticos-completos-{$date}.xls\"");
    echo '<html xmlns:o="urn:schemas-microsoft-com:office:office"
         xmlns:x="urn:schemas-microsoft-com:office:excel"
         xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>';
    echo "<table border='1'>";
    if (!empty($rows)) {
        echo "<tr>";
        foreach (array_keys($rows[0]) as $col) {
            echo "<th style='background:#166534;color:#fff;font-weight:bold'>" . htmlspecialchars((string)$col) . "</th>";
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
    exit;
}

// ─── Standard table exports ───────────────────────────────────────────────────
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
