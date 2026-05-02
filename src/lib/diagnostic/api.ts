import type { ProfileKey, LeadData, DiagnosticResults } from "./types";

const ENDPOINT = "/api/diagnostic.php";

function shouldPersistRemotely(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const isYutopias = /(^|\.)yutopias\.com$/i.test(host);
  return !isLocal && isYutopias;
}

function persistLocally(payload: Record<string, unknown>): void {
  try {
    const key = "ab360_local_diagnostic_store";
    const raw = localStorage.getItem(key);
    const store: { sessions: Record<string, unknown> } = raw
      ? JSON.parse(raw)
      : { sessions: {} };
    const sid = payload.sessionId as string;
    if (!store.sessions[sid]) {
      store.sessions[sid] = { prelead: null, start: null, answers: [], complete: null };
    }
    const target = store.sessions[sid] as Record<string, unknown>;
    if (payload.action === "prelead") target.prelead = payload;
    if (payload.action === "start") target.start = payload;
    if (payload.action === "answer") (target.answers as unknown[]).push(payload);
    if (payload.action === "complete") target.complete = payload;
    localStorage.setItem(key, JSON.stringify(store));
  } catch {
    // storage not available
  }
}

function generateLocalSessionId(): string {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `diag-${Date.now().toString(36)}-${randomPart}`;
}

async function post(payload: Record<string, unknown>): Promise<void> {
  if (!shouldPersistRemotely()) {
    persistLocally(payload);
    return;
  }
  await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// init — asks the server to create a session and return a server-generated ID.
// Falls back to a local ID when not on yutopias.com.
export async function initSession(locale: string): Promise<string> {
  if (!shouldPersistRemotely()) {
    return generateLocalSessionId();
  }
  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "init", locale }),
  });
  if (!r.ok) throw new Error("init_failed");
  const data = await r.json();
  if (typeof data.sessionId !== "string" || data.sessionId === "") {
    throw new Error("init_invalid_response");
  }
  return data.sessionId;
}

export async function savePrelead(
  sessionId: string,
  locale: string,
  lead: LeadData
): Promise<void> {
  const payload = {
    action: "prelead",
    sessionId,
    locale,
    firstName: lead.name,
    company: lead.company,
    email: lead.email,
    privacyAccepted: true,
  };

  if (!shouldPersistRemotely()) {
    persistLocally(payload);
    return;
  }

  const r = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("prelead_failed");
}

export function saveStart(
  sessionId: string,
  locale: string,
  profile: ProfileKey
): void {
  post({ action: "start", sessionId, locale, profile }).catch(() => {});
}

export function saveAnswer(
  sessionId: string,
  questionIndex: number,
  dimension: string,
  optionIndex: number,
  optionScore: number
): void {
  post({
    action: "answer",
    sessionId,
    questionIndex,
    dimension,
    optionIndex,
    optionScore,
  }).catch(() => {});
}

export function saveComplete(
  sessionId: string,
  results: DiagnosticResults,
  lead?: { firstName: string; lastName?: string; company: string; role?: string; email: string; challenge?: string }
): void {
  post({
    action: "complete",
    sessionId,
    weightedScore: results.weightedScore,
    scoreOver10: results.scoreOver10,
    topRetos: results.topRetos.map((r) => `${r.reto.code} · ${r.reto.name}`),
    summary: {
      weightedScore: results.weightedScore,
      scoreOver10: results.scoreOver10,
      profile: results.profile,
      dimensionPerformance: results.dimensionPerformance,
    },
    lead: lead ?? null,
  }).catch(() => {});
}
