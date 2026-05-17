<?php
declare(strict_types=1);
require_once file_exists(__DIR__ . "/.local") ? __DIR__ . "/auth.local.php" : __DIR__ . "/auth.php";
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

    /* ── Dashboard blocks ────────────────────────────────────────── */
    .dash-block {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px;
    }
    .dash-block-title {
      font-size: 11px; font-weight: 500; color: var(--text-3);
      text-transform: uppercase; letter-spacing: .05em; margin-bottom: 16px;
    }

    /* ── Funnel bars ─────────────────────────────────────────────── */
    .funnel-row {
      display: grid; grid-template-columns: 180px 1fr 60px 64px;
      align-items: center; gap: 12px;
    }
    .funnel-label { font-size: 12px; color: var(--text-2); white-space: nowrap; }
    .funnel-track { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
    .funnel-fill  { height: 100%; border-radius: 4px; background: var(--accent-lt); transition: width .5s; }
    .funnel-val   { font-size: 13px; font-weight: 600; color: var(--text); text-align: right; }
    .funnel-pct   { font-size: 11px; color: var(--text-3); text-align: right; }

    /* ── KPI card delta ──────────────────────────────────────────── */
    .stat-trend { font-size: 11px; margin-top: 6px; }
    .stat-trend.up   { color: #22C55E; }
    .stat-trend.down { color: #EF4444; }
    .stat-trend.neutral { color: var(--text-3); }
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

    /* ── Drawer ──────────────────────────────────────────────── */
    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.5);
      z-index: 40; opacity: 0; pointer-events: none; transition: opacity .2s;
    }
    .drawer-overlay.open { opacity: 1; pointer-events: all; }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0;
      width: min(680px, 100vw); background: var(--surface);
      border-left: 1px solid var(--border); z-index: 50;
      display: flex; flex-direction: column;
      transform: translateX(100%); transition: transform .25s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
    }
    .drawer.open { transform: translateX(0); }
    .drawer-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
    }
    .drawer-title { font-size: 14px; font-weight: 600; color: var(--text); }
    .drawer-subtitle { font-size: 12px; color: var(--text-3); margin-top: 2px; }
    .btn-close {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: var(--radius);
      background: var(--surface-2); border: 1px solid var(--border);
      color: var(--text-3); cursor: pointer; flex-shrink: 0; transition: all .12s;
    }
    .btn-close:hover { color: var(--text); border-color: var(--border-2); }
    .drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
    .drawer-meta {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px;
    }
    .drawer-meta-item {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 10px 12px;
    }
    .drawer-meta-label { font-size: 10px; font-weight: 500; color: var(--text-3); text-transform: uppercase; letter-spacing: .05em; }
    .drawer-meta-value { font-size: 13px; color: var(--text); margin-top: 3px; font-weight: 500; }
    .drawer-score-bar {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px 16px; margin-bottom: 20px;
    }
    .drawer-score-title { font-size: 11px; font-weight: 500; color: var(--text-3); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 12px; }
    .dim-bars { display: flex; flex-direction: column; gap: 8px; }
    .dim-row { display: flex; align-items: center; gap: 10px; }
    .dim-label { font-size: 11px; color: var(--text-2); width: 180px; flex-shrink: 0; }
    .dim-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
    .dim-fill { height: 100%; border-radius: 3px; transition: width .4s; }
    .dim-val { font-size: 11px; color: var(--text-3); width: 32px; text-align: right; flex-shrink: 0; }
    .questions-list { display: flex; flex-direction: column; gap: 12px; }
    .q-section-title { font-size: 11px; font-weight: 500; color: var(--text-3); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 12px; }
    .q-card {
      background: var(--surface-2); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px 16px;
    }
    .q-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; }
    .q-num {
      font-size: 10px; font-weight: 600; color: var(--text-3);
      background: var(--border); border-radius: 3px; padding: 2px 6px; flex-shrink: 0; margin-top: 1px;
    }
    .q-dim { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 3px; flex-shrink: 0; margin-top: 1px; }
    .q-dim-A { background: rgba(34,197,94,.15); color: #22C55E; }
    .q-dim-B { background: rgba(34,197,94,.12); color: #4ADE80; }
    .q-dim-C { background: rgba(34,197,94,.1);  color: #86EFAC; }
    .q-dim-D { background: rgba(22,101,52,.4);  color: #86EFAC; }
    .q-text { font-size: 12px; color: var(--text); font-weight: 500; line-height: 1.5; }
    .q-opts { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; }
    .q-opt {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 8px 10px; border-radius: 4px; font-size: 12px;
      color: var(--text-3); line-height: 1.4; border: 1px solid transparent;
    }
    .q-opt.sel-0   { background: rgba(34,197,94,.1);  border-color: rgba(34,197,94,.3);  color: var(--text); }
    .q-opt.sel-30  { background: rgba(132,204,22,.08); border-color: rgba(132,204,22,.25);color: var(--text); }
    .q-opt.sel-70  { background: rgba(234,179,8,.08);  border-color: rgba(234,179,8,.25); color: var(--text); }
    .q-opt.sel-100 { background: rgba(239,68,68,.08);  border-color: rgba(239,68,68,.25); color: var(--text); }
    .q-opt-marker {
      width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
      border: 1.5px solid var(--border-2);
    }
    .q-opt.sel-0   .q-opt-marker { border-color: #22C55E; background: #22C55E; }
    .q-opt.sel-30  .q-opt-marker { border-color: #84CC16; background: #84CC16; }
    .q-opt.sel-70  .q-opt-marker { border-color: #EAB308; background: #EAB308; }
    .q-opt.sel-100 .q-opt-marker { border-color: #EF4444; background: #EF4444; }
    .drawer-loading { padding: 40px 0; text-align: center; color: var(--text-3); font-size: 13px; }
    .click-hint { font-size: 11px; color: var(--text-3); }
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
        <span class="nav-dot"></span> Autodiagnóstico
      </div>
      <div class="nav-item" data-section="reservaplaza">
        <span class="nav-dot"></span> Reserva-Plaza
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
      <div class="nav-item" data-section="ebook">
        <span class="nav-dot"></span> Ebook Leads
      </div>
    </div>
  </nav>

  <main class="main">

    <!-- Dashboard -->
    <section id="section-dashboard" class="section active">
      <div class="page-header">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <div>
            <div class="page-title">Dashboard</div>
            <div class="page-subtitle">Resumen general de actividad</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span class="live-badge"><span class="live-dot"></span> Live</span>
            <span class="refresh-timer" id="refresh-timer"></span>
          </div>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="stats-grid" id="stats-grid"></div>

      <!-- Conversion funnel (horizontal) -->
      <div class="dash-block" style="margin-bottom:16px">
        <div class="dash-block-title">Embudo de conversión</div>
        <div id="funnel-bars" style="display:flex;flex-direction:column;gap:8px;padding:4px 0"></div>
      </div>

      <!-- Row 1: leads over time (wide) + dimension scores -->
      <div class="charts-grid" style="margin-bottom:16px">
        <div class="chart-card wide">
          <div class="chart-label">Actividad últimos 60 días — diagnósticos · newsletter · ebook</div>
          <div class="chart-wrap" style="height:220px"><canvas id="chart-leads-time"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Madurez promedio por dimensión <span style="font-weight:400;text-transform:none;letter-spacing:0">(0 = más maduro)</span></div>
          <div class="chart-wrap"><canvas id="chart-dims"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Score promedio por perfil</div>
          <div class="chart-wrap"><canvas id="chart-score-profile"></canvas></div>
        </div>
      </div>

      <!-- Row 2: abandono + perfiles + scores + locales -->
      <div class="charts-grid" style="margin-bottom:16px">
        <div class="chart-card wide">
          <div class="chart-label">Respuestas por pregunta — abandono del diagnóstico</div>
          <div class="chart-wrap" style="height:200px"><canvas id="chart-dropout"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Distribución de scores</div>
          <div class="chart-wrap"><canvas id="chart-scores"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Perfiles</div>
          <div class="chart-wrap"><canvas id="chart-profiles"></canvas></div>
        </div>
      </div>

      <!-- Row 3: top retos + ebook fuentes + idiomas -->
      <div class="charts-grid">
        <div class="chart-card" style="grid-column:span 2">
          <div class="chart-label">Top retos identificados</div>
          <div class="chart-wrap" style="height:200px"><canvas id="chart-retos"></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-label">Fuentes de descarga del ebook</div>
          <div class="chart-wrap"><canvas id="chart-ebook-src"></canvas></div>
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
        <a id="export-diag-full-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="diag-info"></span>
        <span class="click-hint">↗ Clic en fila para ver respuestas</span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-diagnosticos"></div>
      <div class="pagination">
        <button class="page-btn" id="diag-prev" disabled>Anterior</button>
        <span class="page-info" id="diag-page">1</span>
        <button class="page-btn" id="diag-next">Siguiente</button>
      </div>
    </section>

    <!-- Reserva-Plaza -->
    <section id="section-reservaplaza" class="section">
      <div class="page-header">
        <div class="page-title">Reserva-Plaza</div>
        <div class="page-subtitle">Solicitudes del formulario de Bootcamp Zero</div>
      </div>
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" id="rp-search" placeholder="Buscar...">
        </div>
        <a id="export-rp-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="rp-info"></span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-reservaplaza"></div>
      <div class="pagination">
        <button class="page-btn" id="rp-prev" disabled>Anterior</button>
        <span class="page-info" id="rp-page">1</span>
        <button class="page-btn" id="rp-next">Siguiente</button>
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
        <a id="export-ld-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="ld-info"></span>
        <span class="click-hint">↗ Clic en fila para ver respuestas</span>
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

    <!-- Ebook Leads -->
    <section id="section-ebook" class="section">
      <div class="page-header">
        <div class="page-title">Ebook Leads</div>
        <div class="page-subtitle">Contactos que descargaron el ebook gratuito</div>
      </div>
      <div class="table-toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="search-input" type="text" id="eb-search" placeholder="Buscar...">
        </div>
        <a id="export-eb-excel" class="btn-export" href="#">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Excel
        </a>
        <span class="table-info" id="eb-info"></span>
      </div>
      <div class="ag-wrap ag-theme-alpine-dark" id="grid-ebook"></div>
      <div class="pagination">
        <button class="page-btn" id="eb-prev" disabled>Anterior</button>
        <span class="page-info" id="eb-page">1</span>
        <button class="page-btn" id="eb-next">Siguiente</button>
      </div>
    </section>

  </main>
</div>

<!-- Drawer overlay + panel -->
<div class="drawer-overlay" id="drawer-overlay" onclick="closeDrawer()"></div>
<div class="drawer" id="drawer">
  <div class="drawer-header">
    <div>
      <div class="drawer-title" id="drawer-title">Respuestas del diagnóstico</div>
      <div class="drawer-subtitle" id="drawer-subtitle"></div>
    </div>
    <button class="btn-close" onclick="closeDrawer()" title="Cerrar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="drawer-body" id="drawer-body">
    <div class="drawer-loading">Cargando...</div>
  </div>
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
      if (sec === "diagnosticos")  initGrid("diagnosticos");
      if (sec === "reservaplaza")  initGrid("reservaplaza");
      if (sec === "leads")         initGrid("leads");
      if (sec === "newsletter")    initGrid("newsletter");
      if (sec === "bootcamp")      initGrid("bootcamp");
      if (sec === "ebook")         initGrid("ebook");
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

function createGrid(containerId, colDefs, opts = {}) {
  const el = document.getElementById(containerId);
  agGrid.createGrid(el, {
    columnDefs: colDefs,
    rowData: [],
    defaultColDef: { sortable: true, resizable: true, filter: true, minWidth: 80, flex: 1 },
    animateRows: true,
    suppressMovableColumns: false,
    rowStyle: opts.onRowClicked ? { cursor: "pointer" } : {},
    onRowClicked: opts.onRowClicked ?? null,
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

  const prefix = prefixMap[key];
  const searchVal = document.getElementById(prefix + "-search")?.value ?? "";
  if (searchVal) setFilter(containerId, searchVal);

  const totalPages = Math.ceil(total / LIMIT);
  document.getElementById(prefix + "-info").textContent  = `${total} registros`;
  document.getElementById(prefix + "-page").textContent  = `Página ${page + 1} / ${totalPages || 1}`;
  document.getElementById(prefix + "-prev").disabled = page === 0;
  document.getElementById(prefix + "-next").disabled = (page + 1) * LIMIT >= total;
}

// ─── Column definitions ───────────────────────────────────────────────────────
const diagCols = [
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
];

const cols = {
  diagnosticos: diagCols,
  reservaplaza: [
    { field: "id",               headerName: "ID",         maxWidth: 70 },
    { field: "name",             headerName: "Nombre",     minWidth: 160 },
    { field: "company",          headerName: "Empresa",    minWidth: 160 },
    { field: "email",            headerName: "Email",      minWidth: 220 },
    { field: "locale",           headerName: "Idioma",     maxWidth: 80 },
    { field: "privacy_accepted", headerName: "Privacidad", maxWidth: 100 },
    { field: "created_at",       headerName: "Fecha",      minWidth: 148 },
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
    { field: "id",               headerName: "ID",          maxWidth: 70 },
    { field: "email",            headerName: "Email",       minWidth: 240 },
    { field: "name",             headerName: "Nombre",      minWidth: 150 },
    { field: "locale",           headerName: "Idioma",      maxWidth: 80 },
    { field: "source",           headerName: "Fuente",      minWidth: 140 },
    { field: "privacy_accepted", headerName: "Privacidad",  maxWidth: 100 },
    { field: "created_at",       headerName: "Fecha",       minWidth: 148 },
    { field: "ip_hash",          headerName: "IP hash",     minWidth: 200 },
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
  ebook: [
    { field: "id",               headerName: "ID",         maxWidth: 70 },
    { field: "email",            headerName: "Email",      minWidth: 240 },
    { field: "source_article",   headerName: "Fuente",     minWidth: 160 },
    { field: "locale",           headerName: "Idioma",     maxWidth: 80 },
    { field: "consent_accepted", headerName: "Consentido", maxWidth: 110 },
    { field: "created_at",       headerName: "Fecha",      minWidth: 148 },
    { field: "updated_at",       headerName: "Actualizado",minWidth: 148 },
  ],
};

const actionMap = {
  diagnosticos: "table_diagnostics",
  reservaplaza: "table_reservaplaza",
  leads:        "table_leads",
  newsletter:   "table_newsletter",
  bootcamp:     "table_bootcamp",
  ebook:        "table_ebook_leads",
};

const exportTableMap = {
  diagnosticos: "diagnostics",
  reservaplaza: "reservaplaza",
  leads:        "leads",
  newsletter:   "newsletter",
  bootcamp:     "bootcamp",
  ebook:        "ebook_leads",
};

const prefixMap = { diagnosticos: "diag", reservaplaza: "rp", leads: "ld", newsletter: "nl", bootcamp: "bc", ebook: "eb" };

function initGrid(key) {
  const rowClickable = key === "diagnosticos" || key === "leads";
  const gridOpts = rowClickable ? { onRowClicked: (e) => openDrawer(e.data) } : {};
  createGrid("grid-" + key, cols[key], gridOpts);
  pageState[key] = 0;

  const prefix = prefixMap[key];
  const action = actionMap[key];

  const load = (extraParams = {}) => loadPage(key, action, extraParams);

  const hasStatusFilter = key === "diagnosticos";
  const statusSelectId = prefix + "-status";

  // Initial load
  if (hasStatusFilter) {
    load({ status: document.getElementById(statusSelectId).value });
    document.getElementById(statusSelectId).addEventListener("change", () => {
      pageState[key] = 0;
      load({ status: document.getElementById(statusSelectId).value });
    });
  } else {
    load();
  }

  // Pagination
  document.getElementById(prefix + "-prev").addEventListener("click", () => {
    pageState[key]--;
    hasStatusFilter ? load({ status: document.getElementById(statusSelectId).value }) : load();
  });
  document.getElementById(prefix + "-next").addEventListener("click", () => {
    pageState[key]++;
    hasStatusFilter ? load({ status: document.getElementById(statusSelectId).value }) : load();
  });

  // Search
  document.getElementById(prefix + "-search").addEventListener("input", (e) => {
    setFilter("grid-" + key, e.target.value);
  });

  // Export links — single Excel button per section
  const excelTable = key === "diagnosticos" ? "diagnostics_full" : exportTableMap[key];
  const excelId    = key === "diagnosticos" ? "export-diag-full-excel" : "export-" + prefix + "-excel";
  document.getElementById(excelId).href = exportUrl(excelTable, "excel");
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
      const pfx = prefixMap[key];
      const hasStatus = key === "diagnosticos" || key === "reservaplaza";
      if (hasStatus) {
        loadPage(key, actionMap[key], { status: document.getElementById(pfx + "-status").value });
      } else {
        loadPage(key, actionMap[key]);
      }
    }
  }
}, 1000);

// ─── Dashboard stats labels ───────────────────────────────────────────────────
const _statsLabels = {
  total_diagnostics:      ["Diagnósticos totales",  "sesiones iniciadas"],
  completed_diagnostics:  ["Completados",            "con resultado"],
  total_leads:            ["Leads diagnóstico",      "contactos captados"],
  newsletter_subscribers: ["Newsletter",             "suscriptores"],
  bootcamp_leads:         ["Bootcamp",               "leads registrados"],
  avg_score:              ["Score promedio",          "sobre 10"],
  ebook_leads:            ["Ebook Leads",            "descargas registradas"],
};

// ─── Questions bank (mirrors src/lib/diagnostic/data.ts QS) ──────────────────
const QS = [
  { dim: "A", text: "En la fase de anteproyecto o viabilidad, ¿qué información económica y ambiental maneja el equipo técnico?",
    opts: ["Principalmente el coste de construcción. El impacto ambiental, si se calcula, llega después y por separado.",
           "Tenemos ratios de coste por tipología y algún indicador de carbono, pero no los cruzamos en el mismo modelo.",
           "Usamos herramientas de presupuesto y de huella de carbono, pero cada una vive en su propio sistema.",
           "Trabajamos con un modelo que genera simultáneamente ratios económicas y ambientales desde el primer boceto."],
    scores: [100, 70, 30, 0] },
  { dim: "A", text: "Cuando hay que justificar el presupuesto de un proyecto ante dirección o ante un cliente, ¿qué argumento respalda las cifras?",
    opts: ["La experiencia del técnico que lo elabora. Si él lo dice, se asume que es razonable.",
           "Comparamos con proyectos anteriores, pero la búsqueda es manual y los datos no siempre son comparables.",
           "Tenemos una base de ratios de proyectos anteriores, aunque no está conectada al modelo actual del proyecto.",
           "El presupuesto se contrasta automáticamente con históricos de la misma tipología, fase y escala."],
    scores: [100, 70, 30, 0] },
  { dim: "A", text: "Piensa en el último proyecto donde hubo un sobrecoste relevante. ¿En qué momento se supo?",
    opts: ["Cuando ya estaba ejecutado o muy avanzado. La desviación se gestionó cuando no había mucho margen.",
           "Relativamente tarde; alguien del equipo lo detectó revisando las certificaciones o el cierre mensual.",
           "Con cierta antelación gracias al seguimiento del director de proyecto, aunque el proceso es manual.",
           "Se detectó en fase de diseño gracias a un sistema de alertas antes de que afectara a la ejecución."],
    scores: [100, 70, 30, 0] },
  { dim: "A", text: "¿Qué ocurre cuando un financiador o socio inversor pregunta por el cumplimiento de la Taxonomía Europea del proyecto?",
    opts: ["Es un tema pendiente. Sabemos que viene pero aún no tenemos un proceso para gestionarlo.",
           "Lo gestiona un técnico o consultor externo recopilando datos manualmente del proyecto. Lleva tiempo.",
           "Tenemos alguna herramienta o proceso, pero los indicadores no salen directamente del modelo del proyecto.",
           "Los indicadores DNSH y ratios financieras exigidas se generan desde el propio modelo del proyecto."],
    scores: [100, 70, 30, 0] },
  { dim: "B", text: "Imagina que mañana tu técnico con más años en la empresa decide irse. ¿Qué se va con él?",
    opts: ["Se va gran parte del criterio técnico real. Hay documentos, pero no capturan el razonamiento detrás.",
           "Se va más de lo que quisiéramos. Hay carpetas y correos, pero reconstruir su lógica lleva semanas.",
           "Tenemos algo documentado, pero la base no está estructurada de forma que sea fácilmente reutilizable.",
           "El conocimiento está en el modelo de la organización. Su marcha sería una pérdida, no una descapitalización."],
    scores: [100, 70, 30, 0] },
  { dim: "B", text: "Cuando llega un pliego de licitación de 300 páginas, ¿cuánto tarda el equipo en tener una lectura técnica útil?",
    opts: ["Días. Cada técnico lee lo que le toca y se pone en común. Hay riesgo de que algo se escape.",
           "Tenemos un esquema de análisis propio que ayuda, pero sigue siendo un proceso manual intensivo.",
           "Usamos alguna herramienta de IA para extraer puntos clave, aunque no está integrada con nuestros proyectos.",
           "Un asistente procesa el pliego en minutos, extrae los requisitos clave y los cruza con proyectos similares."],
    scores: [100, 70, 30, 0] },
  { dim: "B", text: "Al arrancar el estudio económico de un proyecto nuevo, ¿cómo influyen los proyectos ya entregados?",
    opts: ["Poco o nada de forma sistemática. Cada proyecto nuevo arranca sin aprender formalmente del anterior.",
           "Alguien del equipo recuerda proyectos similares y ajusta a ojo. Depende de quién haga el estudio.",
           "Tenemos una base de datos de costes reales, pero consultarla y aplicarla al nuevo proyecto es manual.",
           "Los costes reales de proyectos cerrados actualizan automáticamente las bases de referencia para los siguientes."],
    scores: [100, 70, 30, 0] },
  { dim: "C", text: "A mitad de un proyecto complejo, ¿cuántas 'versiones del proyecto' coexisten entre los distintos agentes?",
    opts: ["Varias, con diferencias que se descubren tarde. Los conflictos de versiones son una fuente habitual de retrabajo.",
           "Intentamos mantener una referencia común, pero la coordinación es por correo y reuniones; hay desfases.",
           "Compartimos un repositorio (BIM o similar), pero los cambios no siempre se trazan ni se comunican bien.",
           "Todos trabajan sobre el mismo modelo con trazabilidad de cambios. Los conflictos de versión no existen."],
    scores: [100, 70, 30, 0] },
  { dim: "C", text: "Si asignas a un equipo distinto un proyecto del mismo tipo que ya has entregado bien, ¿qué nivel de resultado esperas?",
    opts: ["Honestamente, el resultado varía bastante. Hay equipos que funcionan mejor que otros con el mismo tipo de proyecto.",
           "Hay procedimientos escritos, pero en la práctica cada equipo los adapta. El resultado es desigual.",
           "Los procesos están bastante definidos, aunque su seguimiento y actualización requieren esfuerzo manual.",
           "El resultado debería ser equivalente. Trabajamos con procedimientos estándar que el equipo aplica sin ambigüedad."],
    scores: [100, 70, 30, 0] },
  { dim: "C", text: "Si dentro de dos años alguien cuestiona judicialmente una decisión técnica tomada hoy, ¿qué prueba existe de quién la tomó, con qué información y por qué?",
    opts: ["Correos y actas dispersas. Reconstruir la trazabilidad completa llevaría días y probablemente quedaría incompleta.",
           "Hay documentación, pero no está centralizada ni organizada para ser fácilmente auditable.",
           "Tenemos un sistema de registro de decisiones, aunque no está completamente integrado con el modelo del proyecto.",
           "Existe un historial estructurado e inalterable con la decisión, el responsable, la fecha y el contexto técnico."],
    scores: [100, 70, 30, 0] },
  { dim: "D", text: "Si esta tarde dirección te pregunta cuál es el riesgo financiero real de la cartera de proyectos en curso, ¿en cuánto tiempo tienes una respuesta fiable?",
    opts: ["Días. Necesitaría pedir datos a cada equipo, consolidar en Excel y revisar que no hay errores.",
           "Algunas horas. Tengo dashboards parciales pero necesito completar huecos manualmente.",
           "Tengo visibilidad por proyecto, pero la vista consolidada de cartera requiere trabajo adicional.",
           "Menos de una hora. El cuadro de mando muestra el estado en tiempo real sin trabajo adicional."],
    scores: [100, 70, 30, 0] },
  { dim: "D", text: "Cuando se toma una decisión técnica relevante en obra (cambio de material, modificación de sistema, ajuste de coste), ¿cómo llega ese impacto a la dirección financiera?",
    opts: ["No llega de forma automática. El director de obra lo comunica cuando puede, o lo descubren en la siguiente reunión.",
           "Hay un proceso de comunicación, pero tarda días. El análisis de impacto financiero es manual.",
           "Usamos herramientas de gestión que lo registran, aunque la conexión con el modelo financiero requiere trabajo manual.",
           "El cambio técnico actualiza el modelo financiero al instante. La dirección lo ve en su cuadro de mando."],
    scores: [100, 70, 30, 0] },
];

const DIM_NAMES = {
  A: "Decidir con datos",
  B: "Conocimiento del equipo",
  C: "Decisiones coordinadas",
  D: "Visión en tiempo real",
};

// ─── Drawer logic ─────────────────────────────────────────────────────────────
function openDrawer(rowData) {
  const sid = rowData.session_id;
  if (!sid) return;

  const drawer  = document.getElementById("drawer");
  const overlay = document.getElementById("drawer-overlay");
  const body    = document.getElementById("drawer-body");
  const title   = document.getElementById("drawer-title");
  const sub     = document.getElementById("drawer-subtitle");

  const name = [rowData.first_name, rowData.last_name].filter(Boolean).join(" ") || "—";
  title.textContent = name;
  sub.textContent   = rowData.email || sid;

  body.innerHTML = '<div class="drawer-loading">Cargando respuestas...</div>';
  drawer.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  api({ action: "session_answers", session_id: sid })
    .then(res => renderDrawer(body, rowData, res.data || []))
    .catch(() => { body.innerHTML = '<div class="drawer-loading">Error al cargar respuestas.</div>'; });
}

function closeDrawer() {
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("drawer-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

function renderDrawer(body, row, answers) {
  // Index answers by question_index
  const byQ = {};
  answers.forEach(a => { byQ[a.question_index] = a; });

  // Meta section
  const scoreColor = (s) => {
    const v = parseFloat(s) || 0;
    if (v <= 3) return "#22C55E";
    if (v <= 5) return "#84CC16";
    if (v <= 7) return "#EAB308";
    return "#EF4444";
  };

  const dimScores = { A: row.score_a, B: row.score_b, C: row.score_c, D: row.score_d };
  // score_a/b/c/d are 0-100 (higher = less mature), invert for bar fill
  const dimBarPct = (v) => {
    const n = parseFloat(v) || 0;
    return Math.round((100 - n));
  };
  const dimBarColor = (v) => {
    const n = parseFloat(v) || 0;
    if (n <= 25)  return "#22C55E";
    if (n <= 50)  return "#84CC16";
    if (n <= 75)  return "#EAB308";
    return "#EF4444";
  };

  let html = `<div class="drawer-meta">`;
  if (row.company)     html += `<div class="drawer-meta-item"><div class="drawer-meta-label">Empresa</div><div class="drawer-meta-value">${esc(row.company)}</div></div>`;
  if (row.role_name)   html += `<div class="drawer-meta-item"><div class="drawer-meta-label">Rol</div><div class="drawer-meta-value">${esc(row.role_name)}</div></div>`;
  if (row.profile)     html += `<div class="drawer-meta-item"><div class="drawer-meta-label">Perfil</div><div class="drawer-meta-value">${esc(row.profile)}</div></div>`;
  if (row.locale)      html += `<div class="drawer-meta-item"><div class="drawer-meta-label">Idioma</div><div class="drawer-meta-value">${esc(row.locale)}</div></div>`;
  if (row.score_over_10 != null) html += `<div class="drawer-meta-item"><div class="drawer-meta-label">Score</div><div class="drawer-meta-value" style="color:${scoreColor(row.score_over_10)}">${row.score_over_10} / 10</div></div>`;
  if (row.status)      html += `<div class="drawer-meta-item"><div class="drawer-meta-label">Estado</div><div class="drawer-meta-value">${esc(row.status)}</div></div>`;
  html += `</div>`;

  // Dimension bars
  if (row.score_a != null) {
    html += `<div class="drawer-score-bar">
      <div class="drawer-score-title">Madurez por dimensión <small style="text-transform:none;letter-spacing:0;font-weight:400">(verde = más maduro)</small></div>
      <div class="dim-bars">`;
    Object.entries(DIM_NAMES).forEach(([k, label]) => {
      const val = parseFloat(dimScores[k]) || 0;
      const pct = dimBarPct(val);
      const col = dimBarColor(val);
      html += `<div class="dim-row">
        <div class="dim-label">${label}</div>
        <div class="dim-track"><div class="dim-fill" style="width:${pct}%;background:${col}"></div></div>
        <div class="dim-val">${Math.round(100 - val)}%</div>
      </div>`;
    });
    html += `</div></div>`;
  }

  // Questions
  html += `<div class="q-section-title">Respuestas al diagnóstico</div><div class="questions-list">`;

  if (answers.length === 0) {
    html += `<div class="drawer-loading" style="padding:24px 0">Sin respuestas registradas para esta sesión.</div>`;
  } else {
    QS.forEach((q, i) => {
      const ans = byQ[i];
      html += `<div class="q-card">
        <div class="q-header">
          <span class="q-num">P${i + 1}</span>
          <span class="q-dim q-dim-${q.dim}">${q.dim} · ${DIM_NAMES[q.dim]}</span>
          <span class="q-text">${esc(q.text)}</span>
        </div>
        <div class="q-opts">`;
      q.opts.forEach((opt, oi) => {
        const score = q.scores[oi];
        const isSelected = ans && parseInt(ans.option_index) === oi;
        const selClass = isSelected ? `sel-${score}` : "";
        html += `<div class="q-opt ${selClass}">
          <div class="q-opt-marker"></div>
          <span>${esc(opt)}</span>
        </div>`;
      });
      html += `</div></div>`;
    });
  }

  html += `</div>`;
  body.innerHTML = html;
}

function esc(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

async function loadDashboard() {
  // Run all requests in parallel
  const [
    statsRes, convRes, dimsRes, dropRes, profileScoreRes,
    retosRes, ebookSrcRes, leadsTimeRes,
    profilesRes, scoresRes, localesRes
  ] = await Promise.allSettled([
    api({ action: "stats" }),
    api({ action: "chart_conversion" }),
    api({ action: "chart_dim_scores" }),
    api({ action: "chart_question_dropout" }),
    api({ action: "chart_score_by_profile" }),
    api({ action: "chart_top_retos" }),
    api({ action: "chart_ebook_sources" }),
    api({ action: "chart_leads_over_time" }),
    api({ action: "chart_profiles" }),
    api({ action: "chart_scores" }),
    api({ action: "chart_locales" }),
  ]);

  // ── KPI cards ────────────────────────────────────────────────────────────────
  if (statsRes.status === "fulfilled") {
    const data = statsRes.value.data;
    const grid = document.getElementById("stats-grid");
    grid.innerHTML = "";
    Object.entries(data).forEach(([k, v]) => {
      const [label, sub] = _statsLabels[k] || [k, ""];
      grid.innerHTML += `<div class="stat-card">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${v}</div>
        <div class="stat-sub">${sub}</div>
      </div>`;
    });
  }

  // ── Funnel horizontal ──────────────────────────────────────────────────────
  if (convRes.status === "fulfilled") {
    const data = convRes.value.data;
    const maxVal = Math.max(...data.map(r => r.value), 1);
    const container = document.getElementById("funnel-bars");
    container.innerHTML = data.map(r => `
      <div class="funnel-row">
        <div class="funnel-label">${r.label}</div>
        <div class="funnel-track"><div class="funnel-fill" style="width:${Math.round(r.value/maxVal*100)}%"></div></div>
        <div class="funnel-val">${r.value}</div>
        <div class="funnel-pct">${r.pct !== null ? r.pct + "%" : ""}</div>
      </div>`).join("");
  }

  // ── Actividad últimos 60 días ───────────────────────────────────────────────
  if (leadsTimeRes.status === "fulfilled") {
    const data = leadsTimeRes.value.data;
    if (charts.leadsTime) charts.leadsTime.destroy();
    charts.leadsTime = new Chart(document.getElementById("chart-leads-time"), {
      type: "line",
      data: {
        labels: data.map(r => r.day.slice(5)),
        datasets: [
          { label: "Diagnósticos", data: data.map(r => r.diagnosticos),
            borderColor: "#22C55E", backgroundColor: "rgba(34,197,94,.1)",
            fill: true, tension: .4, pointRadius: 0, borderWidth: 1.5 },
          { label: "Newsletter",   data: data.map(r => r.newsletter),
            borderColor: "#818CF8", backgroundColor: "rgba(129,140,248,.08)",
            fill: true, tension: .4, pointRadius: 0, borderWidth: 1.5 },
          { label: "Ebook",        data: data.map(r => r.ebook),
            borderColor: "#FB923C", backgroundColor: "rgba(251,146,60,.08)",
            fill: true, tension: .4, pointRadius: 0, borderWidth: 1.5 },
        ],
      },
      options: { ...CHART_OPTS, scales: {
        x: { ticks: { color: "#71717A", font: { size: 10 }, maxTicksLimit: 12 }, grid: { color: "#1C1C1F" } },
        y: { ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" }, beginAtZero: true },
      }},
    });
  }

  // ── Dimensiones promedio ────────────────────────────────────────────────────
  if (dimsRes.status === "fulfilled") {
    const data = dimsRes.value.data;
    if (charts.dims) charts.dims.destroy();
    charts.dims = new Chart(document.getElementById("chart-dims"), {
      type: "bar",
      data: {
        labels: data.map(r => r.dim),
        datasets: [{ data: data.map(r => r.avg), backgroundColor: ["#22C55E","#4ADE80","#86EFAC","#166534"], borderRadius: 4 }],
      },
      options: { ...CHART_OPTS,
        indexAxis: "y",
        plugins: { ...CHART_OPTS.plugins, legend: { display: false } },
        scales: {
          x: { min: 0, max: 100, ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" } },
          y: { ticks: { color: "#A1A1AA", font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
  }

  // ── Score por perfil ────────────────────────────────────────────────────────
  if (profileScoreRes.status === "fulfilled") {
    const data = profileScoreRes.value.data;
    if (charts.scoreProfile) charts.scoreProfile.destroy();
    charts.scoreProfile = new Chart(document.getElementById("chart-score-profile"), {
      type: "bar",
      data: {
        labels: data.map(r => r.profile),
        datasets: [{ label: "Score /10", data: data.map(r => r.avg_score),
          backgroundColor: PALETTE, borderRadius: 4 }],
      },
      options: { ...CHART_OPTS,
        plugins: { ...CHART_OPTS.plugins, legend: { display: false } },
        scales: {
          x: { ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" } },
          y: { min: 0, max: 10, ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" } },
        },
      },
    });
  }

  // ── Abandono por pregunta ───────────────────────────────────────────────────
  if (dropRes.status === "fulfilled") {
    const data = dropRes.value.data;
    if (charts.dropout) charts.dropout.destroy();
    charts.dropout = new Chart(document.getElementById("chart-dropout"), {
      type: "bar",
      data: {
        labels: data.map(r => r.question),
        datasets: [{ label: "Respondidas", data: data.map(r => r.answered),
          backgroundColor: data.map(r => {
            const p = r.pct;
            if (p >= 80) return "#22C55E";
            if (p >= 50) return "#EAB308";
            return "#EF4444";
          }),
          borderRadius: 3 }],
      },
      options: { ...CHART_OPTS,
        plugins: { ...CHART_OPTS.plugins, legend: { display: false },
          tooltip: { callbacks: { label: ctx => `${ctx.raw} sesiones (${data[ctx.dataIndex].pct}%)` } } },
        scales: {
          x: { ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" } },
          y: { ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" }, beginAtZero: true },
        },
      },
    });
  }

  // ── Distribución de scores ──────────────────────────────────────────────────
  if (scoresRes.status === "fulfilled") {
    const data = scoresRes.value.data;
    if (charts.scores) charts.scores.destroy();
    charts.scores = new Chart(document.getElementById("chart-scores"), {
      type: "bar",
      data: {
        labels: data.map(r => r.bucket),
        datasets: [{ label: "Sesiones", data: data.map(r => r.total), backgroundColor: PALETTE, borderRadius: 4 }],
      },
      options: { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: false } } },
    });
  }

  // ── Perfiles ────────────────────────────────────────────────────────────────
  if (profilesRes.status === "fulfilled") {
    const data = profilesRes.value.data;
    if (charts.profiles) charts.profiles.destroy();
    charts.profiles = new Chart(document.getElementById("chart-profiles"), {
      type: "doughnut",
      data: {
        labels: data.map(r => r.profile || "Sin perfil"),
        datasets: [{ data: data.map(r => r.total), backgroundColor: PALETTE, borderWidth: 0 }],
      },
      options: { ...NO_SCALES, cutout: "62%" },
    });
  }

  // ── Top retos ───────────────────────────────────────────────────────────────
  if (retosRes.status === "fulfilled") {
    const data = retosRes.value.data;
    if (charts.retos) charts.retos.destroy();
    charts.retos = new Chart(document.getElementById("chart-retos"), {
      type: "bar",
      data: {
        labels: data.map(r => r.reto),
        datasets: [{ data: data.map(r => r.total), backgroundColor: PALETTE, borderRadius: 4 }],
      },
      options: { ...CHART_OPTS,
        indexAxis: "y",
        plugins: { ...CHART_OPTS.plugins, legend: { display: false } },
        scales: {
          x: { ticks: { color: "#71717A", font: { size: 10 } }, grid: { color: "#1C1C1F" }, beginAtZero: true },
          y: { ticks: { color: "#A1A1AA", font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
  }

  // ── Fuentes ebook ───────────────────────────────────────────────────────────
  if (ebookSrcRes.status === "fulfilled") {
    const data = ebookSrcRes.value.data;
    if (charts.ebookSrc) charts.ebookSrc.destroy();
    charts.ebookSrc = new Chart(document.getElementById("chart-ebook-src"), {
      type: "doughnut",
      data: {
        labels: data.map(r => r.source_article),
        datasets: [{ data: data.map(r => r.total), backgroundColor: PALETTE, borderWidth: 0 }],
      },
      options: { ...NO_SCALES, cutout: "55%" },
    });
  }

  // ── Idiomas ─────────────────────────────────────────────────────────────────
  if (localesRes.status === "fulfilled") {
    const data = localesRes.value.data;
    if (charts.locales) charts.locales.destroy();
    charts.locales = new Chart(document.getElementById("chart-locales"), {
      type: "pie",
      data: {
        labels: data.map(r => r.locale || "—"),
        datasets: [{ data: data.map(r => r.total), backgroundColor: PALETTE, borderWidth: 0 }],
      },
      options: { ...NO_SCALES },
    });
  }
}
</script>
</body>
</html>
