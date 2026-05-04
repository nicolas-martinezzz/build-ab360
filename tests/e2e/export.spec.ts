import { test, expect } from "@playwright/test";

// export.php runs on production only (not Next.js dev server).
// Run with: PLAYWRIGHT_BASE_URL=https://yutopias.com EXPORT_API_KEY=<key> npx playwright test export
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "";

test.describe("Export API — /api/export.php", () => {
  test.skip(!BASE, "Set PLAYWRIGHT_BASE_URL=https://yutopias.com to run export tests");

  test("rechaza petición sin API key", async ({ request }) => {
    const res = await request.get(`${BASE}/api/export.php`);
    expect(res.status()).toBe(401);
  });

  test("rechaza API key incorrecta", async ({ request }) => {
    const res = await request.get(`${BASE}/api/export.php?key=wrong`);
    expect(res.status()).toBe(401);
  });

  test("devuelve JSON con key correcta", async ({ request }) => {
    const key = process.env.EXPORT_API_KEY ?? "";
    test.skip(!key, "Set EXPORT_API_KEY env var");

    const res = await request.get(`${BASE}/api/export.php?key=${key}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.total).toBe("number");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("devuelve CSV con format=csv", async ({ request }) => {
    const key = process.env.EXPORT_API_KEY ?? "";
    test.skip(!key, "Set EXPORT_API_KEY env var");

    const res = await request.get(`${BASE}/api/export.php?key=${key}&format=csv`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/text\/csv/);
  });
});
