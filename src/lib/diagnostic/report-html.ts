import type { DiagnosticResults } from "./types";
import { DIM } from "./data";

type ReportData = {
  results: DiagnosticResults;
  firstName: string;
  company: string;
  role: string;
};

const DIMS_META: Record<string, { name: string; short: string; color: string; bg: string; dark: string }> = {
  A: { name: "Decidir con datos",                  short: "Bloque I",   color: "#1B6B3A", bg: "#E8F3EA", dark: "#0D4A24" },
  B: { name: "Conocimiento del equipo",            short: "Bloque II",  color: "#2E9D4E", bg: "#E8F3EA", dark: "#1B6B3A" },
  C: { name: "Decisiones coordinadas",             short: "Bloque III", color: "#3AA76D", bg: "#EEF6EA", dark: "#216B47" },
  D: { name: "Visión en tiempo real de dirección", short: "Bloque IV",  color: "#6BC38C", bg: "#F0F7EC", dark: "#2E7D48" },
};

function e(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function bandMeta(pct: number): { color: string; bg: string; title: string; sub: string } {
  if (pct >= 0.85) return { color: "#0D4A24", bg: "#E8F3EA", title: "Tienes las bases. Falta conectarlas.", sub: "Tu organización ya funciona con prácticas sólidas en casi todas las áreas. Los retos que siguen no son urgencias: son oportunidades de integrar lo que ya hace bien para que el conjunto opere como un sistema." };
  if (pct >= 0.70) return { color: "#1B6B3A", bg: "#E8F3EA", title: "Buena base. Pero pierdes dinero por los huecos.", sub: "Hay cosas que funcionan bien. Otras dependen de trabajo manual o de personas concretas. Esos huecos tienen un coste que no se ve hasta que hay un problema." };
  if (pct >= 0.45) return { color: "#216B47", bg: "#EEF6EA", title: "Funciona. Pero la coordinación te cuesta dinero.", sub: "La información no fluye bien entre fases, herramientas y equipos. El retrabajo, los desvíos que aparecen tarde y las decisiones tomadas a ciegas tienen aquí su origen habitual." };
  return { color: "#2E7D48", bg: "#F0F7EC", title: "Todo depende del equipo. Si alguien se va, se va contigo.", sub: "Tu organización funciona por el criterio y la experiencia de las personas — lo cual es valioso. Pero esa dependencia limita tu capacidad de escalar, anticipar problemas y mantener la calidad cuando el equipo cambia." };
}

function matMeta(val: number): { label: string; copy: string; tone: string } {
  if (val >= 85) return { label: "Bien asentado",               copy: "Este bloque ya opera con buenas prácticas. El foco es mantener la consistencia y conectarlo con los otros bloques.",              tone: "rgba(27,107,58,0.10)" };
  if (val >= 70) return { label: "Funciona con huecos",         copy: "Hay procesos establecidos, pero dependen de trabajo manual o de personas concretas. Eso erosiona fiabilidad y escalabilidad.", tone: "rgba(46,157,78,0.10)" };
  if (val >= 45) return { label: "Hay base, falta conectar",    copy: "Existen herramientas parciales, pero la información no fluye entre ellas. De ahí el retrabajo y los errores de coordinación.", tone: "rgba(58,167,109,0.12)" };
  return          { label: "Requiere atención prioritaria", copy: "Este bloque opera reactivamente y depende de personas. Es el origen más probable de desvíos y pérdida de conocimiento.",         tone: "rgba(107,195,140,0.10)" };
}

const ISO_SVG = `<svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M 32 12 L 44 8 L 48 22 L 36 26 Z" fill="#1B6B3A" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 54 14 A 38 38 0 0 1 72 22 L 67 31 A 28 28 0 0 0 55 26 Z" fill="#3AA76D" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 72 22 A 38 38 0 0 1 85 39 L 76 44 A 28 28 0 0 0 67 31 Z" fill="#3AA76D" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 85 39 A 38 38 0 0 1 88 54 L 78 55 A 28 28 0 0 0 76 44 Z" fill="#6BC38C" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 88 54 A 38 38 0 0 1 81 73 L 72 68 A 28 28 0 0 0 78 55 Z" fill="#7FCA96" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 81 73 A 38 38 0 0 1 65 86 L 61 76 A 28 28 0 0 0 72 68 Z" fill="#8ED5A5" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 65 86 A 38 38 0 0 1 42 88 L 44 78 A 28 28 0 0 0 61 76 Z" fill="#9EDCB0" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 42 88 A 38 38 0 0 1 22 76 L 29 68 A 28 28 0 0 0 44 78 Z" fill="#AFE2BD" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 22 76 A 38 38 0 0 1 13 55 L 23 54 A 28 28 0 0 0 29 68 Z" fill="#B5E3C1" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 13 55 A 38 38 0 0 1 16 38 L 25 43 A 28 28 0 0 0 23 54 Z" fill="#C4E6CE" stroke="#0A1220" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M 50 28 A 22 22 0 0 1 71 44 L 68 46 A 19 19 0 0 0 50 31 Z" fill="#CDE8D3" stroke="#0A1220" stroke-width="1" stroke-linejoin="round"/>
  <path d="M 71 44 A 22 22 0 1 1 42 28 L 43 31 A 19 19 0 1 0 68 46 Z" fill="#CDE8D3" stroke="#0A1220" stroke-width="1" stroke-linejoin="round"/>
</svg>`;

export function generateReportHtml({ results, firstName, company, role }: ReportData): string {
  const { weightedScore, scoreOver10, topRetos, dimensionPerformance, profile } = results;
  const pct = weightedScore / 100;
  const sc = scoreOver10.toFixed(1).replace(".", ",");
  const profDisp = profile.replace(/_/g, " ").toUpperCase();
  const band = bandMeta(pct);

  const circ = +(2 * Math.PI * 46).toFixed(2);
  const offset = +(circ - pct * circ).toFixed(2);

  const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

  // Person block
  const rows: string[] = [];
  if (firstName) rows.push(`<tr><td style="padding:4px 0;font-size:13px;font-weight:600;color:#141B2E;width:90px;vertical-align:top;">Nombre</td><td style="padding:4px 0;font-size:13px;color:#141B2E;">${e(firstName)}</td></tr>`);
  if (company)   rows.push(`<tr><td style="padding:4px 0;font-size:13px;font-weight:600;color:#141B2E;vertical-align:top;">Empresa</td><td style="padding:4px 0;font-size:13px;color:#141B2E;">${e(company)}</td></tr>`);
  if (role)      rows.push(`<tr><td style="padding:4px 0;font-size:13px;font-weight:600;color:#141B2E;vertical-align:top;">Cargo</td><td style="padding:4px 0;font-size:13px;color:#141B2E;">${e(role)}</td></tr>`);
  const personBlock = rows.length > 0 ? `
  <div style="background:#FAFAF4;border:1px solid #E3E6DE;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1B6B3A;margin-bottom:12px;border-bottom:2px solid #1B6B3A;padding-bottom:6px;">Datos del diagnóstico</div>
    <table cellpadding="0" cellspacing="0" border="0" width="100%">${rows.join("")}</table>
  </div>` : "";

  // Dimension cards
  const dimCards = Object.entries(DIMS_META).map(([key, dim]) => {
    const val = dimensionPerformance[key as keyof typeof dimensionPerformance] ?? 0;
    const mat = matMeta(val);
    return `
    <div style="background:#fff;border:1px solid #E3E6DE;border-radius:8px;padding:16px 20px;">
      <div style="display:grid;grid-template-columns:1fr auto;align-items:start;gap:12px;margin-bottom:12px;">
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#8F97A3;margin-bottom:4px;">${e(dim.short)}</div>
          <div style="font-size:15px;font-weight:600;line-height:1.3;color:#141B2E;">${e(dim.name)}</div>
        </div>
        <div style="font-size:28px;font-weight:700;color:${dim.color};line-height:0.95;white-space:nowrap;">${val}%</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;background:${dim.bg};color:${dim.dark};">Madurez actual</span>
        <span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid ${dim.color};color:${dim.color};background:${mat.tone};">${e(mat.label)}</span>
      </div>
      <div style="background:#EEF0E8;border-radius:999px;height:6px;overflow:hidden;margin-bottom:8px;">
        <div style="height:100%;border-radius:999px;width:${val}%;background:${dim.color};"></div>
      </div>
      <div style="font-size:12px;line-height:1.6;color:#5A6472;">${e(mat.copy)}</div>
    </div>`;
  }).join("");

  // Top 3 reto cards
  const retoCards = topRetos.map((item, idx) => {
    const dim = DIMS_META[item.reto.dim];
    return `
    <div style="border:1px solid #E3E6DE;border-radius:8px;padding:20px 24px;background:#fff;border-left:4px solid ${dim.color};">
      <div style="display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;margin-bottom:12px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;border-radius:50%;background:#141B2E;color:#fff;font-size:13px;font-weight:700;">${idx + 1}</span>
        <div>
          <div style="font-size:17px;font-weight:600;line-height:1.3;color:#141B2E;">${e(item.reto.name)}</div>
          <div style="margin-top:6px;">
            <span style="display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:600;background:${dim.bg};color:${dim.dark};">${e(dim.short)} · ${e(dim.name)}</span>
          </div>
        </div>
      </div>
      <div style="font-size:13px;color:#5A6472;line-height:1.55;margin-bottom:8px;"><span style="font-weight:600;color:#141B2E;">Lo que ocurre hoy: </span>${e(item.reto.sit)}</div>
      <div style="font-size:13px;color:#141B2E;line-height:1.55;"><span style="font-weight:600;color:${dim.dark};">Lo que permite resolver: </span>${e(item.reto.obj)}</div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe de diagnóstico digital · yūtopias systems</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--navy:#141B2E;--green:#3AA76D;--green-dark:#1B6B3A;--cream:#F0F5E9;--cream-paper:#FAFAF4;--grey:#5A6472;--grey-soft:#8F97A3;--border:#E3E6DE;--font:'Montserrat',-apple-system,sans-serif;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--font);background:var(--cream);color:var(--navy);-webkit-font-smoothing:antialiased;}
.wrap{max-width:960px;margin:0 auto;}
.hero{background:var(--navy);color:#fff;padding:48px 40px 56px;}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:48px;}
.brand-name{font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.01em;}
.brand-name span{color:var(--green);font-weight:300;letter-spacing:0.14em;margin-left:2px;}
.hero h1{font-size:40px;font-weight:400;line-height:1.12;letter-spacing:-0.02em;max-width:780px;margin-bottom:12px;}
.hero .meta{font-size:14px;color:rgba(255,255,255,0.55);}
.body{background:var(--cream);padding:40px 40px 64px;}
.card{background:#fff;border-radius:8px;border:1px solid var(--border);padding:32px 36px;margin-bottom:20px;}
.result-band{border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid var(--border);}
.score-area{display:grid;grid-template-columns:140px 1fr;gap:32px;align-items:start;margin-bottom:28px;}
.ring-wrap{position:relative;width:130px;height:130px;}
.ring-wrap svg{transform:rotate(-90deg);display:block;}
.ring-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:100%;}
.dim-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.reto-list{display:grid;gap:12px;}
.sec-label{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1B6B3A;border-bottom:2px solid #1B6B3A;padding-bottom:6px;margin-bottom:16px;}
.legend{padding:12px 16px;border:1px dashed var(--border);border-radius:8px;background:var(--cream-paper);display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;}
.legend-item{font-size:10px;font-weight:600;padding:3px 8px;border-radius:999px;background:#EEF0E8;color:var(--grey);text-transform:uppercase;letter-spacing:0.04em;}
.footer{background:var(--navy);padding:20px 40px;}
.footer p{font-size:11px;color:rgba(255,255,255,0.4);text-align:center;}
.footer a{color:var(--green);text-decoration:none;}
@media print{
  body,html{background:#fff;}
  .hero{background:var(--navy)!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .result-band,.footer{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .dim-grid>div,.reto-list>div{page-break-inside:avoid;break-inside:avoid;}
}
@media(max-width:680px){
  .hero{padding:32px 20px 40px;}.body{padding:24px 20px 48px;}.card{padding:24px 20px;}
  .hero h1{font-size:26px;}.score-area{grid-template-columns:1fr;}.dim-grid{grid-template-columns:1fr;}
}
</style>
</head>
<body>
<div class="wrap">

<div class="hero">
  <div class="brand">
    ${ISO_SVG}
    <span class="brand-name">yūtopias<span>s y s t e m s</span></span>
  </div>
  <h1>Informe de diagnóstico de madurez digital</h1>
  <p class="meta">Generado el ${e(today)}</p>
</div>

<div class="body">

  ${personBlock}

  <div class="result-band" style="background:${band.bg};border-color:${band.color}44;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${band.color};margin-bottom:12px;">Tu diagnóstico</div>
    <div style="font-size:22px;font-weight:600;line-height:1.25;letter-spacing:-0.015em;color:${band.color};margin-bottom:10px;">${e(band.title)}</div>
    <div style="font-size:15px;line-height:1.65;color:#5A6472;">${e(band.sub)}</div>
  </div>

  <div class="card">
    <div class="score-area">
      <div>
        <div class="ring-wrap">
          <svg height="130" viewBox="0 0 110 110" width="130">
            <circle cx="55" cy="55" r="46" fill="none" stroke="#EDE9E0" stroke-width="10"/>
            <circle cx="55" cy="55" r="46" fill="none"
              stroke="${band.color}"
              stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="ring-center">
            <div style="font-size:30px;font-weight:700;line-height:1;color:${band.color};letter-spacing:-0.02em;">${sc}</div>
            <div style="font-size:11px;color:#8F97A3;margin-top:4px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">/10</div>
          </div>
        </div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#1B6B3A;margin-bottom:8px;">Puntuación global</div>
        <div style="font-size:32px;font-weight:700;color:#141B2E;line-height:1;margin-bottom:8px;">${weightedScore}<span style="font-size:16px;font-weight:400;color:#5A6472;">/100</span></div>
        <div style="margin-bottom:12px;"><span style="display:inline-block;background:#1B6B3A;color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;letter-spacing:0.05em;">${e(profDisp)}</span></div>
        <div style="background:#EEF0E8;border-radius:999px;height:8px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;border-radius:999px;width:${weightedScore}%;background:${band.color};"></div>
        </div>
        <div style="font-size:13px;color:#5A6472;line-height:1.6;">Puntuación: <strong>${sc}/10</strong>. Cada bloque pesa distinto según el perfil declarado.</div>
      </div>
    </div>

    <div class="sec-label">Rendimiento por dimensión</div>
    <div class="dim-grid">${dimCards}</div>

    <div class="legend">
      <span style="font-size:11px;font-weight:700;color:#141B2E;letter-spacing:0.06em;text-transform:uppercase;">Escala de madurez:</span>
      <span class="legend-item">0–44% Depende de personas</span>
      <span class="legend-item">45–69% Procesos parciales</span>
      <span class="legend-item">70–84% Base sólida</span>
      <span class="legend-item">85–100% Bien integrado</span>
    </div>
  </div>

  <div class="card">
    <div class="sec-label">Tus 3 prioridades de mejora</div>
    <div class="reto-list">${retoCards}</div>
  </div>

</div>

<div class="footer">
  <p>yūtopias systems · <a href="https://yutopias.com">yutopias.com</a> · Informe generado el ${e(today)}</p>
</div>

</div>
</body>
</html>`;
}

export function downloadReport(data: ReportData): void {
  const html = generateReportHtml(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const company = data.company.replace(/[^a-zA-Z0-9\-]/g, "-").replace(/-+/g, "-").toLowerCase();
  a.download = `informe-diagnostico${company ? `-${company}` : ""}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
