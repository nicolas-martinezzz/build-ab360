import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initSession, savePrelead, saveStart, saveAnswer, saveComplete } from "./api";

const STORAGE_KEY = "ab360_local_diagnostic_store";

/* ─── helpers ─── */
function setHostname(hostname: string) {
  Object.defineProperty(window, "location", {
    value: { hostname, protocol: "https:" },
    writable: true,
  });
}

/* ─── initSession ─── */
describe("initSession", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("en localhost devuelve un ID local con formato diag-*", async () => {
    setHostname("localhost");
    const id = await initSession("es");
    expect(id).toMatch(/^diag-[a-f0-9]{24}$/);
  });

  it("en localhost genera IDs únicos en llamadas sucesivas", async () => {
    setHostname("localhost");
    const ids = await Promise.all(Array.from({ length: 50 }, () => initSession("es")));
    expect(new Set(ids).size).toBe(50);
  });

  it("en yutopias.com llama fetch con action=init y retorna el sessionId del servidor", async () => {
    setHostname("yutopias.com");
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, sessionId: "diag-server-abc123" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const id = await initSession("es");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/diagnostic.php");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.action).toBe("init");
    expect(body.locale).toBe("es");
    expect(id).toBe("diag-server-abc123");
  });

  it("en yutopias.com lanza error si fetch responde !ok", async () => {
    setHostname("yutopias.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(initSession("es")).rejects.toThrow("init_failed");
  });

  it("en yutopias.com lanza error si el servidor no devuelve sessionId", async () => {
    setHostname("yutopias.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }));
    await expect(initSession("es")).rejects.toThrow("init_invalid_response");
  });
});

/* ─── API calls — entorno local (localStorage fallback) ─── */
describe("API en entorno local (localStorage fallback)", () => {
  beforeEach(() => {
    localStorage.clear();
    setHostname("localhost");
  });
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it("saveStart persiste en localStorage con action='start'", () => {
    const sid = "diag-test-001";
    saveStart(sid, "es", "direccion");

    const raw = localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : null;
    expect(store?.sessions?.[sid]?.start?.action).toBe("start");
    expect(store?.sessions?.[sid]?.start?.profile).toBe("direccion");
  });

  it("saveAnswer acumula respuestas en el array local", () => {
    const sid = "diag-test-002";
    saveAnswer(sid, 0, "A", 2, 30);
    saveAnswer(sid, 1, "B", 3, 0);

    const raw = localStorage.getItem(STORAGE_KEY);
    const store = JSON.parse(raw!);
    expect(store.sessions[sid].answers).toHaveLength(2);
    expect(store.sessions[sid].answers[0].questionIndex).toBe(0);
    expect(store.sessions[sid].answers[1].questionIndex).toBe(1);
  });

  it("saveComplete persiste el completion con los scores", () => {
    const sid = "diag-test-003";
    const fakeResults = {
      weightedScore: 65,
      scoreOver10: 6.5,
      profile: "direccion" as const,
      topRetos: [],
      dimensionPerformance: { A: 70, B: 60, C: 65, D: 60 },
    };
    saveComplete(sid, fakeResults);

    const raw = localStorage.getItem(STORAGE_KEY);
    const store = JSON.parse(raw!);
    expect(store.sessions[sid].complete?.action).toBe("complete");
    expect(store.sessions[sid].complete?.weightedScore).toBe(65);
  });

  it("saveComplete incluye summary.profile y summary.dimensionPerformance", () => {
    const sid = "diag-test-004";
    const fakeResults = {
      weightedScore: 72,
      scoreOver10: 7.2,
      profile: "promotor_inversor" as const,
      topRetos: [],
      dimensionPerformance: { A: 80, B: 70, C: 65, D: 75 },
    };
    saveComplete(sid, fakeResults);

    const raw = localStorage.getItem(STORAGE_KEY);
    const store = JSON.parse(raw!);
    const complete = store.sessions[sid].complete;
    expect(complete.summary.profile).toBe("promotor_inversor");
    expect(complete.summary.dimensionPerformance).toEqual({ A: 80, B: 70, C: 65, D: 75 });
  });

  it("múltiples sesiones se almacenan independientemente", () => {
    saveStart("sid-A", "es", "direccion");
    saveStart("sid-B", "ca", "arquitecto_ingeniero");

    const raw = localStorage.getItem(STORAGE_KEY);
    const store = JSON.parse(raw!);
    expect(Object.keys(store.sessions)).toContain("sid-A");
    expect(Object.keys(store.sessions)).toContain("sid-B");
    expect(store.sessions["sid-A"].start.profile).toBe("direccion");
    expect(store.sessions["sid-B"].start.profile).toBe("arquitecto_ingeniero");
  });
});

/* ─── savePrelead — entorno producción (fetch) ─── */
describe("savePrelead en dominio yutopias.com", () => {
  beforeEach(() => setHostname("yutopias.com"));
  afterEach(() => vi.restoreAllMocks());

  it("llama fetch con method POST y Content-Type JSON", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await savePrelead("diag-prod-001", "es", {
      name: "Ana García",
      company: "Constructora ABC",
      email: "ana@abc.es",
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/diagnostic.php");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("el body enviado incluye todos los campos del lead", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockFetch);

    await savePrelead("diag-prod-002", "es", {
      name: "Carlos López",
      company: "Arquitectos SL",
      email: "carlos@arq.es",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.action).toBe("prelead");
    expect(body.sessionId).toBe("diag-prod-002");
    expect(body.firstName).toBe("Carlos López");
    expect(body.company).toBe("Arquitectos SL");
    expect(body.email).toBe("carlos@arq.es");
    expect(body.privacyAccepted).toBe(true);
  });

  it("lanza error si fetch responde !ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(
      savePrelead("diag-fail", "es", { name: "X", company: "Y", email: "x@y.com" })
    ).rejects.toThrow("prelead_failed");
  });
});
