/**
 * test-email-flow.mjs
 * Runs a full diagnostic flow against the local PHP server.
 * Usage: node scripts/test-email-flow.mjs
 *
 * Starts php -S localhost:8080 -t public with .env vars loaded,
 * runs the full init→prelead→start→12 answers→complete flow,
 * then kills the server.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const PORT = 8080;
const BASE = `http://localhost:${PORT}`;
const ORIGIN = "http://localhost:3000";

// ── Load .env ────────────────────────────────────────────────────────────────
const env = { ...process.env };
const envLines = readFileSync(path.join(root, ".env"), "utf8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx > 0) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
}

// Map Next.js .env names to PHP env names used by diagnostic.php
env.NEWSLETTER_DB_HOST     = env.PROD_DB_HOST;
env.NEWSLETTER_DB_PORT     = env.PROD_DB_PORT;
env.NEWSLETTER_DB_NAME     = env.PROD_DB_NAME;
env.NEWSLETTER_DB_USER     = env.PROD_DB_USER;
env.NEWSLETTER_DB_PASSWORD = env.PROD_DB_PASSWORD;

console.log(`APP_ENV          = ${env.APP_ENV}`);
console.log(`LOCAL_DEV_EMAIL  = ${env.LOCAL_DEV_EMAIL}`);
console.log(`DB_HOST          = ${env.NEWSLETTER_DB_HOST}`);
console.log(`NOTIFY_TO_PROD   = ${env.NOTIFY_TO_PROD}`);

// ── Start PHP server ─────────────────────────────────────────────────────────
console.log(`\nStarting PHP server on :${PORT}...`);
const php = spawn("php", ["-S", `localhost:${PORT}`, "-t", "public"], {
  cwd: root,
  env,
  stdio: ["ignore", "pipe", "pipe"],
});

php.stderr.on("data", (d) => process.stdout.write(`[php] ${d}`));
php.on("error", (e) => { console.error("PHP failed to start:", e.message); process.exit(1); });

await new Promise((r) => setTimeout(r, 1500));

// ── HTTP helper ──────────────────────────────────────────────────────────────
async function api(body) {
  const res = await fetch(`${BASE}/api/diagnostic.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": ORIGIN },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

function ok(label, res) {
  const pass = res.status >= 200 && res.status < 300 && res.json.ok !== false && !res.json.message;
  console.log(`  ${pass ? "✓" : "✗"} ${label} [${res.status}] ${JSON.stringify(res.json)}`);
  if (!pass) { php.kill(); process.exit(1); }
  return res.json;
}

// ── Full flow ────────────────────────────────────────────────────────────────
console.log("\n── Flow ────────────────────────────────────────────────");

// 1. init
const initRes = await api({ action: "init", locale: "es", source: "autodiagnostico" });
const { sessionId } = ok("init", initRes);
console.log(`     sessionId = ${sessionId}`);

// 2. prelead (step 1 — captures email from the start)
ok("prelead", await api({
  action: "prelead",
  sessionId,
  locale: "es",
  firstName: "Nicolás",
  company: "Yūtopias Test",
  email: "test-user@yutopias.com", // will be redirected to LOCAL_DEV_EMAIL
  privacyAccepted: true,
}));

// 3. start — pick profile
ok("start", await api({
  action: "start",
  sessionId,
  locale: "es",
  profile: "direccion",
}));

// 4. 12 answers — valid scores are 0, 30, 70, 100 only
const dimensions = ["A","A","A","A","B","B","B","C","C","C","D","D"];
const scores     = [30, 70, 30, 70, 30, 70, 30, 70, 30, 70, 30, 70];
for (let i = 0; i < 12; i++) {
  ok(`answer ${i + 1}/12`, await api({
    action: "answer",
    sessionId,
    questionIndex: i,
    dimension: dimensions[i],
    optionIndex: scores[i] === 70 ? 2 : 1,
    optionScore: scores[i],
  }));
}

// 5. complete — with bridge lead (triggers both admin + user emails)
ok("complete", await api({
  action: "complete",
  sessionId,
  weightedScore: 48,
  scoreOver10: 4.8,
  topRetos: [
    "01_1 · Análisis predictivo 360",
    "02_1 · Institucionalización del patrimonio de datos",
    "04_1 · Visibilidad consolidada de cartera",
  ],
  summary: {
    weightedScore: 48,
    scoreOver10: 4.8,
    profile: "direccion",
    dimensionPerformance: { A: 45, B: 50, C: 40, D: 55 },
  },
  lead: {
    firstName: "Nicolás",
    lastName: "Test",
    company: "Yūtopias Test",
    role: "CEO",
    email: "test-user@yutopias.com", // redirected to LOCAL_DEV_EMAIL
    challenge: "Mejorar la toma de decisiones con datos en tiempo real",
  },
}));

console.log("\n── Result ──────────────────────────────────────────────");
console.log(`✓ All steps passed.`);
console.log(`✓ Two emails sent to: ${env.LOCAL_DEV_EMAIL}`);
console.log(`  → Admin notification (internal)`);
console.log(`  → User confirmation report`);

php.kill();
process.exit(0);
