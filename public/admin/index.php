<?php
declare(strict_types=1);
require_once __DIR__ . "/auth.php";
requireAuth();

$userEmail = $_SESSION["admin_email"] ?? "";
$csrf      = csrfToken();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Yutopias Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.2/dist/ag-grid-community.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:         #09090B;
      --surface:    #111113;
      --surface-2:  #18181B;
      --border:     #27272A;
      --border-2:   #3F3F46;
      --text:       #FAFAFA;
      --text-2:     #A1A1AA;
      --text-3:     #71717A;
      --accent:     #166534;
      --accent-lt:  #22C55E;
      --radius:     6px;
    }

    html.light {
      --bg:         #F4F4F5;
      --surface:    #FFFFFF;
      --surface-2:  #F4F4F5;
      --border:     #E4E4E7;
      --border-2:   #D4D4D8;
      --text:       #09090B;
      --text-2:     #3F3F46;
      --text-3:     #71717A;
      --accent:     #166534;
      --accent-lt:  #16A34A;
    }

    html.light .ag-theme-alpine-dark {
      --ag-background-color:              #FFFFFF;
      --ag-header-background-color:       #F4F4F5;
      --ag-odd-row-background-color:      #FFFFFF;
      --ag-row-hover-color:               rgba(0,0,0,.03);
      --ag-selected-row-background-color: rgba(22,163,74,.06);
      --ag-border-color:                  #E4E4E7;
      --ag-header-foreground-color:       #71717A;
      --ag-foreground-color:              #3F3F46;
    }

    /* ── Theme toggle button ────────────────────────────────── */
    .btn-theme {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px;
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius); cursor: pointer;
      color: var(--text-3); transition: color .15s, border-color .15s;
    }
    .btn-theme:hover { color: var(--text); border-color: var(--border-2); }
    .icon-dark  { display: block; }
    .icon-light { display: none; }
    html.light .icon-dark  { display: none; }
    html.light .icon-light { display: block; }

    html, body {
      height: 100%;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    body { background: var(--bg); color: var(--text); display: flex; flex-direction: column; }

    /* ── Topbar ───────────────────────────────────────────────── */
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 20px; height: 52px;
      background: var(--surface); border-bottom: 1px solid var(--border);
      flex-shrink: 0; position: sticky; top: 0; z-index: 10;
    }
    .topbar-brand {
      font-size: 13px; font-weight: 600; letter-spacing: .08em;
      text-transform: uppercase; color: var(--text); user-select: none;
    }
    .topbar-brand span { color: var(--text-3); font-weight: 400; margin-left: 6px; text-transform: none; letter-spacing: 0; }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .topbar-user {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 10px; border-radius: var(--radius);
      background: var(--surface-2); border: 1px solid var(--border);
    }
    .topbar-avatar {
      width: 22px; height: 22px; border-radius: 50%;
      background: var(--accent); display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 600; color: #fff; flex-shrink: 0;
    }
    .topbar-email { font-size: 12px; color: var(--text-2); }
    .btn-logout {
      padding: 5px 12px; background: transparent;
      border: 1px solid var(--border); border-radius: var(--radius);
      color: var(--text-3); font-size: 12px; font-family: inherit;
      cursor: pointer; transition: color .15s, border-color .15s;
    }
    .btn-logout:hover { color: var(--text); border-color: var(--border-2); }

    /* ── Layout ──────────────────────────────────────────────── */
    .layout { display: flex; flex: 1; overflow: hidden; min-height: 0; }

    /* ── Sidebar ─────────────────────────────────────────────── */
    .sidebar {
      width: 216px; flex-shrink: 0;
      background: var(--surface); border-right: 1px solid var(--border);
      padding: 16px 0; overflow-y: auto;
      display: flex; flex-direction: column;
    }
    .sidebar-section {
      padding: 0 12px; margin-bottom: 4px;
    }
    .sidebar-label {
      font-size: 11px; font-weight: 500; color: var(--text-3);
      text-transform: uppercase; letter-spacing: .06em;
      padding: 8px 8px 4px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 8px; font-size: 13px; cursor: pointer;
      color: var(--text-2); border-radius: var(--radius);
      transition: all .12s; user-select: none; font-weight: 400;
    }
    .nav-item:hover { color: var(--text); background: var(--surface-2); }
    .nav-item.active { color: var(--text); background: var(--surface-2); font-weight: 500; }
    .nav-item.active .nav-dot { background: var(--accent-lt); }
    .nav-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--border-2); flex-shrink: 0; transition: background .12s;
    }
    .sidebar-divider {
      height: 1px; background: var(--border); margin: 8px 12px;
    }

    /* ── Main ────────────────────────────────────────────────── */
    .main { flex: 1; overflow-y: auto; padding: 28px 32px; min-width: 0; }

    /* ── Section ─────────────────────────────────────────────── */
    .section { display: none; }
    .section.active { display: block; }

    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 18px; font-weight: 600; color: var(--text); }
    .page-subtitle { font-size: 13px; color: var(--text-3); margin-top: 2px; }

    /* ── Stat cards ─────────────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px; margin-bottom: 28px;
    }
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px 18px;
      transition: border-color .15s;
    }
    .stat-card:hover { border-color: var(--border-2); }
    .stat-label {
      font-size: 11px; font-weight: 500; color: var(--text-3);
      text-transform: uppercase; letter-spacing: .05em;
    }
    .stat-value {
      font-size: 26px; font-weight: 600; margin-top: 8px;
      color: var(--text); letter-spacing: -.02em;
    }
    .stat-sub { font-size: 11px; color: var(--text-3); margin-top: 4px; }

    /* ── Live indicator ──────────────────────────────────────── */
    .live-badge {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 11px; color: var(--text-3); float: right; margin-top: 4px;
    }
    .live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent-lt); animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .3; }
    }
    .refresh-timer { font-size: 11px; color: var(--text-3); }

    /* ── Charts ──────────────────────────────────────────────── */
    .charts-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 16px; margin-bottom: 28px;
    }
    .chart-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px;
    }
    .chart-card.wide { grid-column: span 2; }
    .chart-label {
      font-size: 11px; font-weight: 500; color: var(--text-3);
      text-transform: uppercase; letter-spacing: .05em; margin-bottom: 16px;
    }
    .chart-wrap { position: relative; height: 200px; }

    /* ── Table toolbar ───────────────────────────────────────── */
    .table-toolbar {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 12px; flex-wrap: wrap;
    }
    .search-wrap {
      position: relative; flex: 1; min-width: 200px; max-width: 320px;
    }
    .search-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      color: var(--text-3); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 7px 10px 7px 30px;
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius); color: var(--text);
      font-size: 12px; font-family: inherit; outline: none;
      transition: border-color .15s;
    }
    .search-input::placeholder { color: var(--text-3); }
    .search-input:focus { border-color: var(--border-2); }

    .toolbar-select {
      padding: 7px 10px; background: var(--surface-2);
      border: 1px solid var(--border); border-radius: var(--radius);
      color: var(--text-2); font-size: 12px; font-family: inherit;
      outline: none; cursor: pointer;
    }
    .btn-export {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 7px 12px; background: var(--surface-2);
      border: 1px solid var(--border); border-radius: var(--radius);
      color: var(--text-2); font-size: 12px; font-family: inherit;
      cursor: pointer; text-decoration: none; transition: all .15s;
      white-space: nowrap;
    }
    .btn-export:hover { color: var(--text); border-color: var(--border-2); }
    .table-info { margin-left: auto; font-size: 12px; color: var(--text-3); }

    /* ── AG Grid ─────────────────────────────────────────────── */
    .ag-wrap { width: 100%; height: 520px; border-radius: var(--radius); overflow: hidden; }

    .ag-theme-alpine-dark {
      --ag-background-color:          #111113;
      --ag-header-background-color:   #09090B;
      --ag-odd-row-background-color:  #111113;
      --ag-row-hover-color:           rgba(255,255,255,.03);
      --ag-selected-row-background-color: rgba(34,197,94,.06);
      --ag-border-color:              #27272A;
      --ag-header-foreground-color:   #71717A;
      --ag-foreground-color:          #A1A1AA;
      --ag-font-size:                 12px;
      --ag-font-family:               "Inter", sans-serif;
      --ag-cell-horizontal-padding:   14px;
      --ag-row-height:                40px;
      --ag-header-height:             40px;
    }

    /* ── Pagination ──────────────────────────────────────────── */
    .pagination {
      display: flex; align-items: center; gap: 8px; margin-top: 12px;
      justify-content: flex-end;
    }
    .page-btn {
      padding: 5px 12px; background: var(--surface-2);
      border: 1px solid var(--border); border-radius: var(--radius);
      color: var(--text-2); font-size: 12px; font-family: inherit;
      cursor: pointer; transition: all .12s;
    }
    .page-btn:disabled { opacity: .3; cursor: not-allowed; }
    .page-btn:not(:disabled):hover { color: var(--text); border-color: var(--border-2); }
    .page-info { font-size: 12px; color: var(--text-3); padding: 0 4px; }

    /* ── Empty state ─────────────────────────────────────────── */
    .empty { padding: 48px 0; text-align: center; color: var(--text-3); font-size: 13px; }
  </style>
</head>
<body>

<header class="topbar">
  <div class="topbar-brand">
    Yutopias <span>Admin</span>
  </div>
  <div class="topbar-right">
    <div class="topbar-user">
      <div class="topbar-avatar"><?= strtoupper(substr($userEmail, 0, 1)) ?></div>
      <span class="topbar-email"><?= htmlspecialchars($userEmail) ?></span>
    </div>
    <button class="btn-theme" id="btn-theme" title="Cambiar tema" onclick="toggleTheme()">
      <svg class="icon-dark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <svg class="icon-light" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    </button>
    <form id="logout-form" method="POST" action="logout.php" style="display:none">
      <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>">
    </form>
    <button class="btn-logout" onclick="document.getElementById('logout-form').submit()">Salir</button>
  </div>
</header>

<div class="layout">
  <nav class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label">General</div>
      <div class="nav-item active" data-section="dashboard">
        <span class="nav-dot"></span> Dashboard
      </div>
    </div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-section">
      <div class="sidebar-label">Datos</div>
      <div class="nav-item" data-section="diagnosticos">
        <span class="nav-dot"></span> Diagnósticos
      </div>
      <div class="nav-item" data-section="leads">
        <span class="nav-dot"></span> Leads diagnóstico
      </div>
      <div class="nav-item" data-section="newsletter">
        <span class="nav-dot"></span> Newsletter
      </div>
      <div class="nav-item" data-section="bootcamp">
        <span class="nav-dot"></span> Bootcamp
      </div>
    </div>
  </nav>

  <main class="main">

    <!-- Dashboard -->
    <section id="section-dashboard" class="section active">
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="page-title">Dashboard</div>
            <div class="page-subtitle">Resumen general de actividad</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span class="live-badge"><span class="live-dot"></span> Live</span>
            <span class="refresh-timer" id="refresh-timer">Actualizando en 30s</span>
          </div>
        </div>
      </div>

      <div class="stats-grid" id="stats-grid"></div>

      <div class="charts-grid">
        <div class="chart-card wide">
          <div class="chart-label">Sesiones · últimos 90 días</div>
          <div class="chart-wrap"><canvas id="chart-sessions"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Funnel de conversión</div>
          <div class="chart-wrap"><canvas id="chart-funnel"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Perfiles</div>
          <div class="chart-wrap"><canvas id="chart-profiles"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Distribución de scores</div>
          <div class="chart-wrap"><canvas id="chart-scores"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Idiomas</div>
          <div class="chart-wrap"><canvas id="chart-locales"></canvas></div>
        </div>
      </div>
    </section>

    <!-- Diagnósticos -->
    <section id="section-diagnosticos" class="section">
      <div class="page-header">
        <div class="page-title">Diagnósticos</div>
        <div class="page-subtitle">Todas las sesiones con resultados completos</div>
      </div>
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" id="diag-search" placeholder="Buscar...">
        </div>
        <select class="toolbar-select" id="diag-status">
          <option value="all">Todos los estados</option>
          <option value="completed">Completados</option>
        </select>
        <a id="export-diag-csv"   class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </a>
        <a id="export-diag-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="diag-info"></span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-diagnosticos"></div>
      <div class="pagination">
        <button class="page-btn" id="diag-prev" disabled>Anterior</button>
        <span class="page-info" id="diag-page">1</span>
        <button class="page-btn" id="diag-next">Siguiente</button>
      </div>
    </section>

    <!-- Leads diagnóstico -->
    <section id="section-leads" class="section">
      <div class="page-header">
        <div class="page-title">Leads diagnóstico</div>
        <div class="page-subtitle">Contactos que completaron el formulario de datos</div>
      </div>
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" id="ld-search" placeholder="Buscar...">
        </div>
        <a id="export-ld-csv"   class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </a>
        <a id="export-ld-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="ld-info"></span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-leads"></div>
      <div class="pagination">
        <button class="page-btn" id="ld-prev" disabled>Anterior</button>
        <span class="page-info" id="ld-page">1</span>
        <button class="page-btn" id="ld-next">Siguiente</button>
      </div>
    </section>

    <!-- Newsletter -->
    <section id="section-newsletter" class="section">
      <div class="page-header">
        <div class="page-title">Newsletter</div>
        <div class="page-subtitle">Suscriptores del footer</div>
      </div>
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" id="nl-search" placeholder="Buscar...">
        </div>
        <a id="export-nl-csv"   class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </a>
        <a id="export-nl-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="nl-info"></span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-newsletter"></div>
      <div class="pagination">
        <button class="page-btn" id="nl-prev" disabled>Anterior</button>
        <span class="page-info" id="nl-page">1</span>
        <button class="page-btn" id="nl-next">Siguiente</button>
      </div>
    </section>

    <!-- Bootcamp -->
    <section id="section-bootcamp" class="section">
      <div class="page-header">
        <div class="page-title">Bootcamp</div>
        <div class="page-subtitle">Leads del formulario de bootcamp</div>
      </div>
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" id="bc-search" placeholder="Buscar...">
        </div>
        <a id="export-bc-csv"   class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </a>
        <a id="export-bc-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="bc-info"></span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-bootcamp"></div>
      <div class="pagination">
        <button class="page-btn" id="bc-prev" disabled>Anterior</button>
        <span class="page-info" id="bc-page">1</span>
        <button class="page-btn" id="bc-next">Siguiente</button>
      </div>
    </section>

  </main>
</div>

<script>
const CSRF = <?= json_encode($csrf) ?>;

// ─── Theme toggle ────────────────────────────────────────────────────────────
(function() {
  const saved = localStorage.getItem("admin_theme");
  if (saved === "light") document.documentElement.classList.add("light");
})();

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle("light");
  localStorage.setItem("admin_theme", isLight ? "light" : "dark");
}

// ─── Navigation ──────────────────────────────────────────────────────────────
const gridsInited = {};

document.querySelectorAll(".nav-item").forEach(el => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    el.classList.add("active");
    const sec = el.dataset.section;
    document.getElementById("section-" + sec).classList.add("active");
    if (!gridsInited[sec]) {
      gridsInited[sec] = true;
      if (sec === "diagnosticos") initGrid("diagnosticos");
      if (sec === "leads")        initGrid("leads");
      if (sec === "newsletter")   initGrid("newsletter");
      if (sec === "bootcamp")     initGrid("bootcamp");
    }
  });
});

// ─── API ─────────────────────────────────────────────────────────────────────
async function api(params) {
  const qs = new URLSearchParams({ ...params, _csrf: CSRF });
  const r = await fetch("api.php?" + qs);
  if (!r.ok) throw new Error("API " + r.status);
  return r.json();
}

function exportUrl(table, format) {
  return `export.php?table=${table}&format=${format}&_csrf=${encodeURIComponent(CSRF)}`;
}

// ─── AG Grid factory ─────────────────────────────────────────────────────────
const gridApis = {};

function createGrid(containerId, colDefs) {
  const el = document.getElementById(containerId);
  agGrid.createGrid(el, {
    columnDefs: colDefs,
    rowData: [],
    defaultColDef: { sortable: true, resizable: true, filter: true, minWidth: 80, flex: 1 },
    animateRows: true,
    suppressMovableColumns: false,
    onGridReady: (e) => { gridApis[containerId] = e.api; },
  });
}

function setRows(containerId, rows) {
  gridApis[containerId]?.setGridOption("rowData", rows);
}

function setFilter(containerId, text) {
  gridApis[containerId]?.setGridOption("quickFilterText", text);
}

// ─── Generic grid loader ─────────────────────────────────────────────────────
const pageState = {};
const LIMIT = 100;

async function loadPage(key, action, extraParams = {}) {
  const page = pageState[key] ?? 0;
  const { data, total } = await api({ action, page, limit: LIMIT, ...extraParams });

  const containerId = "grid-" + key;
  setRows(containerId, data);

  const qf = document.getElementById(key.replace("leads","ld").replace("newsletter","nl").replace("bootcamp","bc").replace("diagnosticos","diag") + "-search")?.value
    || document.getElementById("ld-search")?.value; // fallback
  // apply per-section search
  const searchMap = { diagnosticos:"diag", leads:"ld", newsletter:"nl", bootcamp:"bc" };
  const prefix = searchMap[key] || key;
  const searchVal = document.getElementById(prefix + "-search")?.value ?? "";
  if (searchVal) setFilter(containerId, searchVal);

  const totalPages = Math.ceil(total / LIMIT);
  document.getElementById(prefix + "-info").textContent  = `${total} registros`;
  document.getElementById(prefix + "-page").textContent  = `Página ${page + 1} / ${totalPages || 1}`;
  document.getElementById(prefix + "-prev").disabled = page === 0;
  document.getElementById(prefix + "-next").disabled = (page + 1) * LIMIT >= total;
}

// ─── Column definitions ───────────────────────────────────────────────────────
const cols = {
  diagnosticos: [
    { field: "session_id",     headerName: "ID",          maxWidth: 80 },
    { field: "created_at",     headerName: "Fecha",       minWidth: 148 },
    { field: "status",         headerName: "Estado",      maxWidth: 110 },
    { field: "locale",         headerName: "Idioma",      maxWidth: 80 },
    { field: "profile",        headerName: "Perfil",      maxWidth: 100 },
    { field: "first_name",     headerName: "Nombre",      minWidth: 110 },
    { field: "last_name",      headerName: "Apellido",    minWidth: 110 },
    { field: "email",          headerName: "Email",       minWidth: 200 },
    { field: "company",        headerName: "Empresa",     minWidth: 130 },
    { field: "role_name",      headerName: "Rol",         minWidth: 130 },
    { field: "score_over_10",  headerName: "Score",       maxWidth: 80 },
    { field: "weighted_score", headerName: "Ponderado",   maxWidth: 100 },
    { field: "score_a",        headerName: "A",           maxWidth: 60 },
    { field: "score_b",        headerName: "B",           maxWidth: 60 },
    { field: "score_c",        headerName: "C",           maxWidth: 60 },
    { field: "score_d",        headerName: "D",           maxWidth: 60 },
    { field: "top_reto_1",     headerName: "Reto 1",      minWidth: 160 },
    { field: "top_reto_2",     headerName: "Reto 2",      minWidth: 160 },
    { field: "top_reto_3",     headerName: "Reto 3",      minWidth: 160 },
    { field: "challenge_text", headerName: "Desafío",     minWidth: 200 },
    { field: "completed_at",   headerName: "Completado",  minWidth: 148 },
  ],
  leads: [
    { field: "first_name",     headerName: "Nombre",      minWidth: 120 },
    { field: "last_name",      headerName: "Apellido",    minWidth: 120 },
    { field: "email",          headerName: "Email",       minWidth: 210 },
    { field: "company",        headerName: "Empresa",     minWidth: 140 },
    { field: "role_name",      headerName: "Rol",         minWidth: 140 },
    { field: "locale",         headerName: "Idioma",      maxWidth: 80 },
    { field: "status",         headerName: "Estado",      maxWidth: 110 },
    { field: "score_over_10",  headerName: "Score",       maxWidth: 80 },
    { field: "top_reto_1",     headerName: "Reto 1",      minWidth: 170 },
    { field: "top_reto_2",     headerName: "Reto 2",      minWidth: 170 },
    { field: "top_reto_3",     headerName: "Reto 3",      minWidth: 170 },
    { field: "challenge_text", headerName: "Desafío",     minWidth: 200 },
    { field: "created_at",     headerName: "Fecha",       minWidth: 148 },
    { field: "session_id",     headerName: "Sesión",      minWidth: 220 },
  ],
  newsletter: [
    { field: "id",             headerName: "ID",          maxWidth: 70 },
    { field: "email",          headerName: "Email",       minWidth: 240 },
    { field: "locale",         headerName: "Idioma",      maxWidth: 80 },
    { field: "status",         headerName: "Estado",      maxWidth: 110 },
    { field: "created_at",     headerName: "Fecha",       minWidth: 148 },
    { field: "ip_hash",        headerName: "IP hash",     minWidth: 200 },
  ],
  bootcamp: [
    { field: "id",             headerName: "ID",          maxWidth: 70 },
    { field: "name",           headerName: "Nombre",      minWidth: 180 },
    { field: "email",          headerName: "Email",       minWidth: 210 },
    { field: "role_name",      headerName: "Rol",         minWidth: 150 },
    { field: "company",        headerName: "Empresa",     minWidth: 150 },
    { field: "locale",         headerName: "Idioma",      maxWidth: 80 },
    { field: "created_at",     headerName: "Fecha",       minWidth: 148 },
  ],
};

const actionMap = {
  diagnosticos: "table_diagnostics",
  leads:        "table_leads",
  newsletter:   "table_newsletter",
  bootcamp:     "table_bootcamp",
};

const exportTableMap = {
  diagnosticos: "diagnostics",
  leads:        "leads",
  newsletter:   "newsletter",
  bootcamp:     "bootcamp",
};

const prefixMap = { diagnosticos: "diag", leads: "ld", newsletter: "nl", bootcamp: "bc" };

function initGrid(key) {
  createGrid("grid-" + key, cols[key]);
  pageState[key] = 0;

  const prefix = prefixMap[key];
  const action = actionMap[key];

  const load = (extraParams = {}) => loadPage(key, action, extraParams);

  // Initial load
  if (key === "diagnosticos") {
    load({ status: document.getElementById("diag-status").value });
    document.getElementById("diag-status").addEventListener("change", () => {
      pageState[key] = 0;
      load({ status: document.getElementById("diag-status").value });
    });
  } else {
    load();
  }

  // Pagination
  document.getElementById(prefix + "-prev").addEventListener("click", () => {
    pageState[key]--;
    key === "diagnosticos" ? load({ status: document.getElementById("diag-status").value }) : load();
  });
  document.getElementById(prefix + "-next").addEventListener("click", () => {
    pageState[key]++;
    key === "diagnosticos" ? load({ status: document.getElementById("diag-status").value }) : load();
  });

  // Search
  document.getElementById(prefix + "-search").addEventListener("input", (e) => {
    setFilter("grid-" + key, e.target.value);
  });

  // Export links
  document.getElementById("export-" + prefix + "-csv").href   = exportUrl(exportTableMap[key], "csv");
  document.getElementById("export-" + prefix + "-excel").href = exportUrl(exportTableMap[key], "excel");
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
const CHART_COLOR   = "#22C55E";
const CHART_DIM     = "rgba(34,197,94,.15)";
const PALETTE       = ["#22C55E","#166534","#4ADE80","#15803D","#86EFAC","#14532D"];
const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#71717A", font: { size: 11, family: "Inter" }, boxWidth: 10 } } },
  scales: {
    x: { ticks: { color: "#71717A", font: { size: 11 } }, grid: { color: "#1C1C1F" } },
    y: { ticks: { color: "#71717A", font: { size: 11 } }, grid: { color: "#1C1C1F" } },
  },
};
const NO_SCALES = { responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#71717A", font: { size: 11, family: "Inter" }, boxWidth: 10 } } } };

let charts = {};

async function loadDashboard() {
  // Stats
  try {
    const { data } = await api({ action: "stats" });
    const labels = {
      total_diagnostics:     ["Diagnósticos totales", "sesiones iniciadas"],
      completed_diagnostics: ["Completados",          "con resultado"],
      total_leads:           ["Leads diagnóstico",    "contactos captados"],
      newsletter_subscribers:["Newsletter",           "suscriptores"],
      bootcamp_leads:        ["Bootcamp",             "leads registrados"],
      avg_score:             ["Score promedio",       "sobre 10"],
    };
    const grid = document.getElementById("stats-grid");
    grid.innerHTML = "";
    Object.entries(data).forEach(([k, v]) => {
      const [label, sub] = labels[k] || [k, ""];
      grid.innerHTML += `<div class="stat-card">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${v}</div>
        <div class="stat-sub">${sub}</div>
      </div>`;
    });
  } catch(e) { console.error(e); }

  // Sessions over time
  try {
    const { data } = await api({ action: "chart_sessions_over_time" });
    if (charts.sessions) charts.sessions.destroy();
    charts.sessions = new Chart(document.getElementById("chart-sessions"), {
      type: "line",
      data: {
        labels: data.map(r => r.day),
        datasets: [{ label: "Sesiones", data: data.map(r => r.total),
          borderColor: CHART_COLOR, backgroundColor: CHART_DIM,
          fill: true, tension: .4, pointRadius: 2, borderWidth: 1.5 }],
      },
      options: { ...CHART_OPTS },
    });
  } catch(e) {}

  // Funnel
  try {
    const { data } = await api({ action: "chart_funnel" });
    if (charts.funnel) charts.funnel.destroy();
    charts.funnel = new Chart(document.getElementById("chart-funnel"), {
      type: "bar",
      data: {
        labels: data.map(r => r.label),
        datasets: [{ data: data.map(r => r.value), backgroundColor: PALETTE, borderRadius: 4 }],
      },
      options: { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } },
    });
  } catch(e) {}

  // Profiles
  try {
    const { data } = await api({ action: "chart_profiles" });
    if (charts.profiles) charts.profiles.destroy();
    charts.profiles = new Chart(document.getElementById("chart-profiles"), {
      type: "doughnut",
      data: {
        labels: data.map(r => r.profile || "Sin perfil"),
        datasets: [{ data: data.map(r => r.total), backgroundColor: PALETTE, borderWidth: 0 }],
      },
      options: { ...NO_SCALES, cutout: "62%" },
    });
  } catch(e) {}

  // Scores
  try {
    const { data } = await api({ action: "chart_scores" });
    if (charts.scores) charts.scores.destroy();
    charts.scores = new Chart(document.getElementById("chart-scores"), {
      type: "bar",
      data: {
        labels: data.map(r => r.bucket),
        datasets: [{ label: "Respuestas", data: data.map(r => r.total), backgroundColor: PALETTE, borderRadius: 4 }],
      },
      options: { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } },
    });
  } catch(e) {}

  // Locales
  try {
    const { data } = await api({ action: "chart_locales" });
    if (charts.locales) charts.locales.destroy();
    charts.locales = new Chart(document.getElementById("chart-locales"), {
      type: "pie",
      data: {
        labels: data.map(r => r.locale || "—"),
        datasets: [{ data: data.map(r => r.total), backgroundColor: PALETTE, borderWidth: 0 }],
      },
      options: { ...NO_SCALES },
    });
  } catch(e) {}
}

// ─── Auto-refresh (30s) ───────────────────────────────────────────────────────
const REFRESH_SECS = 3600;
let countdown = REFRESH_SECS;
loadDashboard();

setInterval(() => {
  countdown--;
  const el = document.getElementById("refresh-timer");
  if (el) {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    el.textContent = `Actualizando en ${m}:${String(s).padStart(2, "0")}`;
  }
  if (countdown <= 0) {
    countdown = REFRESH_SECS;
    loadDashboard();
    const activeSection = document.querySelector(".section.active")?.id?.replace("section-", "");
    if (activeSection && activeSection !== "dashboard" && gridsInited[activeSection]) {
      const key = activeSection;
      if (key === "diagnosticos") {
        loadPage(key, actionMap[key], { status: document.getElementById("diag-status").value });
      } else {
        loadPage(key, actionMap[key]);
      }
    }
  }
}, 1000);
</script>
</body>
</html>
