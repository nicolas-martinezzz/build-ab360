/**
 * Security and input-validation tests for the diagnostic PHP backend.
 *
 * These tests hit the real API endpoint on the running dev server
 * (http://localhost:3001/api/diagnostic.php) to verify that the server
 * enforces its own validation rules — rate limiting, CORS, input sanitisation,
 * method restrictions, and required-field checks.
 *
 * They intentionally send bad or malicious input and assert the server
 * rejects it with the appropriate HTTP status code.
 */

import { test, expect } from "@playwright/test";

const API = "http://localhost:3001/api/diagnostic.php";

/* ─── Helper ─────────────────────────────────────────────────────────────── */

async function post(body: unknown, origin = "http://localhost:3001") {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": origin,
    },
    body: JSON.stringify(body),
  });
  let json: unknown = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json };
}

/* ─── Method enforcement ─────────────────────────────────────────────────── */

test.describe("HTTP method enforcement", () => {
  test("GET devuelve 405", async () => {
    const res = await fetch(API, { method: "GET", headers: { Origin: "http://localhost:3001" } });
    expect(res.status).toBe(405);
  });

  test("PUT devuelve 405", async () => {
    const res = await fetch(API, { method: "PUT", headers: { Origin: "http://localhost:3001" } });
    expect(res.status).toBe(405);
  });

  test("DELETE devuelve 405", async () => {
    const res = await fetch(API, { method: "DELETE", headers: { Origin: "http://localhost:3001" } });
    expect(res.status).toBe(405);
  });

  test("OPTIONS (preflight) devuelve 204", async () => {
    const res = await fetch(API, {
      method: "OPTIONS",
      headers: {
        "Origin": "http://localhost:3001",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(res.status).toBe(204);
  });
});

/* ─── CORS ───────────────────────────────────────────────────────────────── */

test.describe("CORS — origen no autorizado", () => {
  test("origen desconocido recibe 403", async () => {
    const { status } = await post({ action: "init", locale: "es" }, "https://evil.com");
    expect(status).toBe(403);
  });

  test("origen sin header recibe la respuesta pero no Access-Control-Allow-Origin amplio", async () => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "init", locale: "es" }),
    });
    // Puede ser 403 (no origin) o respuesta normal sin CORS — no debe ser 200 con Allow: *
    const acao = res.headers.get("Access-Control-Allow-Origin");
    expect(acao).not.toBe("*");
  });
});

/* ─── Payload validation ─────────────────────────────────────────────────── */

test.describe("Payload vacío o malformado", () => {
  test("body vacío devuelve 400", async () => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3001" },
      body: "",
    });
    expect(res.status).toBe(400);
  });

  test("JSON inválido devuelve 400", async () => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "http://localhost:3001" },
      body: "{ not valid json",
    });
    expect(res.status).toBe(400);
  });

  test("action ausente devuelve 400", async () => {
    const { status } = await post({ locale: "es" });
    expect(status).toBe(400);
  });

  test("action desconocida devuelve 400", async () => {
    const { status } = await post({ action: "hackyAction", locale: "es" });
    expect(status).toBe(400);
  });

  test("action vacía devuelve 400", async () => {
    const { status } = await post({ action: "", locale: "es" });
    expect(status).toBe(400);
  });
});

/* ─── Action: prelead ────────────────────────────────────────────────────── */

test.describe("Action prelead — validación de campos", () => {
  test("sin sessionId devuelve 400", async () => {
    const { status } = await post({
      action: "prelead",
      firstName: "Test",
      company: "Test SA",
      email: "test@test.com",
      privacyAccepted: true,
    });
    expect(status).toBe(400);
  });

  test("sessionId con formato inválido devuelve 400", async () => {
    const { status } = await post({
      action: "prelead",
      sessionId: "../../etc/passwd",
      firstName: "Test",
      company: "Test SA",
      email: "test@test.com",
      privacyAccepted: true,
    });
    expect(status).toBe(400);
  });

  test("email malformado devuelve 400", async () => {
    const { status } = await post({
      action: "prelead",
      sessionId: "diag-aabbccdd1122aabbccdd1122",
      firstName: "Test",
      company: "Test SA",
      email: "not-an-email",
      privacyAccepted: true,
    });
    expect(status).toBe(400);
  });

  test("privacyAccepted=false devuelve 400", async () => {
    const { status } = await post({
      action: "prelead",
      sessionId: "diag-aabbccdd1122aabbccdd1122",
      firstName: "Test",
      company: "Test SA",
      email: "test@test.com",
      privacyAccepted: false,
    });
    expect(status).toBe(400);
  });

  test("firstName vacío devuelve 400", async () => {
    const { status } = await post({
      action: "prelead",
      sessionId: "diag-aabbccdd1122aabbccdd1122",
      firstName: "",
      company: "Test SA",
      email: "test@test.com",
      privacyAccepted: true,
    });
    expect(status).toBe(400);
  });
});

/* ─── Action: answer ─────────────────────────────────────────────────────── */

test.describe("Action answer — validación de rangos", () => {
  const BASE_ANSWER = {
    action: "answer",
    sessionId: "diag-aabbccdd1122aabbccdd1122",
    questionIndex: 0,
    dimension: "A",
    optionIndex: 0,
    optionScore: 100,
  };

  test("questionIndex fuera de rango (negativo) devuelve 400", async () => {
    const { status } = await post({ ...BASE_ANSWER, questionIndex: -1 });
    expect(status).toBe(400);
  });

  test("questionIndex fuera de rango (>= 12) devuelve 400", async () => {
    const { status } = await post({ ...BASE_ANSWER, questionIndex: 12 });
    expect(status).toBe(400);
  });

  test("dimension inválida devuelve 400", async () => {
    const { status } = await post({ ...BASE_ANSWER, dimension: "Z" });
    expect(status).toBe(400);
  });

  test("optionScore inválido (no en 0/30/70/100) devuelve 400", async () => {
    const { status } = await post({ ...BASE_ANSWER, optionScore: 50 });
    expect(status).toBe(400);
  });

  test("optionIndex fuera de rango devuelve 400", async () => {
    const { status } = await post({ ...BASE_ANSWER, optionIndex: 5 });
    expect(status).toBe(400);
  });
});

/* ─── Action: complete — input sanitisation ─────────────────────────────── */

test.describe("Action complete — validación de scores", () => {
  const BASE_COMPLETE = {
    action: "complete",
    sessionId: "diag-aabbccdd1122aabbccdd1122",
    weightedScore: 75,
    scoreOver10: 7.5,
    topRetos: ["Análisis predictivo 360", "Auditoría de desempeño", "Visibilidad consolidada de cartera"],
    summary: {
      weightedScore: 75,
      scoreOver10: 7.5,
      profile: "direccion",
      dimensionPerformance: { A: 80, B: 70, C: 75, D: 72 },
    },
    lead: null,
  };

  test("weightedScore negativo devuelve 400", async () => {
    const { status } = await post({ ...BASE_COMPLETE, weightedScore: -1 });
    expect(status).toBe(400);
  });

  test("weightedScore > 100 devuelve 400", async () => {
    const { status } = await post({ ...BASE_COMPLETE, weightedScore: 101 });
    expect(status).toBe(400);
  });

  test("scoreOver10 negativo devuelve 400", async () => {
    const { status } = await post({ ...BASE_COMPLETE, scoreOver10: -0.1 });
    expect(status).toBe(400);
  });

  test("scoreOver10 > 10 devuelve 400", async () => {
    const { status } = await post({ ...BASE_COMPLETE, scoreOver10: 10.1 });
    expect(status).toBe(400);
  });

  test("sessionId con inyección SQL devuelve 400", async () => {
    const { status } = await post({ ...BASE_COMPLETE, sessionId: "'; DROP TABLE diagnostic_sessions; --" });
    expect(status).toBe(400);
  });

  test("sessionId con path traversal devuelve 400", async () => {
    const { status } = await post({ ...BASE_COMPLETE, sessionId: "../../../etc/passwd" });
    expect(status).toBe(400);
  });
});

/* ─── XSS — datos de usuario no se reflejan en la respuesta ────────────── */

test.describe("XSS — el servidor no refleja input en la respuesta JSON", () => {
  test("payload con script tag no aparece en la respuesta JSON", async () => {
    const { json } = await post({
      action: "prelead",
      sessionId: "diag-aabbccdd1122aabbccdd1122",
      firstName: '<script>alert("xss")</script>',
      company: "Test SA",
      email: "test@test.com",
      privacyAccepted: true,
    });
    const raw = JSON.stringify(json);
    expect(raw).not.toContain("<script>");
  });
});
