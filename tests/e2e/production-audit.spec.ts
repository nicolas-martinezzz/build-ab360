/**
 * Auditoría completa de producción — yutopias.com
 * Ejecutar con: PLAYWRIGHT_BASE_URL=https://yutopias.com npx playwright test production-audit --project=chromium
 *
 * Cubre: homepage, i18n, video hero, formularios, APIs, admin panel, assets, 404
 */
import { test, expect } from "@playwright/test";

const PROD = process.env.PLAYWRIGHT_BASE_URL ?? "https://yutopias.com";
const ADMIN = "https://admin.yutopias.com";

// ─── helpers ─────────────────────────────────────────────────────────────────

function url(path: string) {
  return `${PROD}${path}`;
}

// ─── 1. Homepage ─────────────────────────────────────────────────────────────

test.describe("1. Homepage", () => {
  test("redirige / a /es", async ({ page }) => {
    const res = await page.goto(PROD);
    await expect(page).toHaveURL(/\/es\/?$/);
    expect(res?.status()).toBeLessThan(400);
  });

  test("h1 visible y no vacío", async ({ page }) => {
    await page.goto(url("/es"));
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const text = await h1.innerText();
    expect(text.trim().length).toBeGreaterThan(5);
  });

  test("video del hero presente (no GIF)", async ({ page }) => {
    await page.goto(url("/es"));
    // El video debe existir en el DOM
    const video = page.locator("video").first();
    await expect(video).toBeAttached();
    // Verificar que tiene sources WebM y MP4
    const webmSource = page.locator('video source[type="video/webm"]');
    const mp4Source  = page.locator('video source[type="video/mp4"]');
    await expect(webmSource).toBeAttached();
    await expect(mp4Source).toBeAttached();
  });

  test("el GIF ya no se carga directamente como img en el hero", async ({ page }) => {
    await page.goto(url("/es"));
    const gifImg = page.locator('img[src*="yutopias-hero-background.gif"]');
    await expect(gifImg).toHaveCount(0);
  });

  test("CTA del hero apunta a autodiagnostico", async ({ page }) => {
    await page.goto(url("/es"));
    const cta = page.locator("a[href*='autodiagnostico'], a[href*='self-assessment'], a[href*='autodiagnostic']").first();
    await expect(cta).toBeVisible();
  });

  test("footer visible con links correctos", async ({ page }) => {
    await page.goto(url("/es"));
    const footer = page.locator("#site-footer");
    await expect(footer).toBeVisible();
    const linkedin = footer.locator('a[aria-label*="LinkedIn"]');
    await expect(linkedin).toBeVisible();
  });

  test("no hay errores de consola críticos en homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(url("/es"));
    await page.waitForLoadState("networkidle");
    const critical = errors.filter(e =>
      !e.includes("favicon") &&
      !e.includes("ResizeObserver") &&
      !e.includes("Non-Error")
    );
    expect(critical).toHaveLength(0);
  });
});

// ─── 2. i18n — 3 locales ─────────────────────────────────────────────────────

test.describe("2. i18n — locales es / en / ca", () => {
  for (const locale of ["es", "en", "ca"] as const) {
    test(`/${locale} carga con h1`, async ({ page }) => {
      await page.goto(url(`/${locale}`));
      await expect(page.locator("h1")).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/${locale}`));
    });

    test(`/${locale}/autodiagnostico (o equivalente) accesible`, async ({ page }) => {
      const diagPaths: Record<string, string> = {
        es: "/es/autodiagnostico",
        en: "/en/self-assessment",
        ca: "/ca/autodiagnostic",
      };
      const res = await page.goto(url(diagPaths[locale]));
      expect(res?.status()).toBe(200);
      await expect(page.locator("#dl-name")).toBeVisible({ timeout: 10_000 });
    });
  }

  test("selector de idioma cambia la URL", async ({ page }) => {
    await page.goto(url("/es"));
    // Buscar link al inglés en el selector de idioma
    const enLink = page.locator("a[href*='/en']").first();
    await expect(enLink).toBeVisible();
    await enLink.click();
    await expect(page).toHaveURL(/\/en/);
  });
});

// ─── 3. Páginas estáticas ─────────────────────────────────────────────────────

test.describe("3. Páginas estáticas", () => {
  const pages = [
    { path: "/es/programa",      name: "Programa" },
    { path: "/es/solution",      name: "Solution" },
    { path: "/es/challenge",     name: "Challenge" },
    { path: "/es/nosotros",      name: "Nosotros" },
    { path: "/es/privacy",       name: "Privacy" },
    { path: "/es/cookies",       name: "Cookies" },
    { path: "/es/reserva-plaza", name: "Reserva Plaza" },
  ];

  for (const { path, name } of pages) {
    test(`${name} (${path}) responde 200`, async ({ page }) => {
      const res = await page.goto(url(path));
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 8_000 });
    });
  }

  test("página 404 para ruta inexistente", async ({ page }) => {
    const res = await page.goto(url("/es/pagina-que-no-existe-xyz"));
    // Next.js static export puede devolver 200 con contenido 404 o un 404 real
    const bodyText = await page.locator("body").innerText();
    const is404 = (res?.status() === 404) || bodyText.includes("404") || bodyText.includes("Not Found");
    expect(is404).toBe(true);
  });
});

// ─── 4. Autodiagnóstico — flujo completo ──────────────────────────────────────

test.describe("4. Autodiagnóstico — flujo completo", () => {
  const DIAG = url("/es/autodiagnostico");

  test("muestra prelead con 3 campos + privacidad", async ({ page }) => {
    await page.goto(DIAG);
    await expect(page.locator("#dl-name")).toBeVisible();
    await expect(page.locator("#dl-company")).toBeVisible();
    await expect(page.locator("#dl-email")).toBeVisible();
    await expect(page.getByRole("checkbox").first()).toBeVisible();
  });

  test("valida campos vacíos", async ({ page }) => {
    await page.goto(DIAG);
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("valida email inválido", async ({ page }) => {
    await page.goto(DIAG);
    await page.locator("#dl-name").fill("Test");
    await page.locator("#dl-company").fill("Co");
    await page.locator("#dl-email").fill("malformed");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("flujo completo: prelead → perfil → 12 preguntas → resultados", async ({ page }) => {
    page.setDefaultTimeout(20_000);
    await page.goto(DIAG);

    await page.locator("#dl-name").fill("Audit Prod");
    await page.locator("#dl-company").fill("Yutopias Test");
    await page.locator("#dl-email").fill("audit@yutopias.com");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();

    // Selección de perfil
    const profileBtn = page.getByRole("button", { name: /CEO|Dirección/i }).first();
    await expect(profileBtn).toBeVisible({ timeout: 12_000 });
    await profileBtn.click();
    await page.getByRole("button", { name: /continuar|siguiente|continue/i }).click();

    // 12 preguntas
    for (let q = 0; q < 12; q++) {
      await expect(page.locator("text=/\\d+ \\/ 12/")).toBeVisible({ timeout: 10_000 });
      await page.locator("button.w-full.text-left").first().click();
      await page.locator("button.bg-\\[\\#127334\\]").last().click();
    }

    // Resultados
    await expect(page.getByText("Tu diagnóstico", { exact: true }).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Tus 3 prioridades de mejora", { exact: true })).toBeVisible();
  });
});

// ─── 5. Reserva Plaza ─────────────────────────────────────────────────────────

test.describe("5. Reserva Plaza", () => {
  const RP = url("/es/reserva-plaza");

  test("carga el formulario de reserva-plaza con campos correctos", async ({ page }) => {
    await page.goto(RP);
    await expect(page.locator("#rp-name")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("#rp-company")).toBeVisible();
    await expect(page.locator("#rp-email")).toBeVisible();
  });

  test("valida campos vacíos en reserva-plaza", async ({ page }) => {
    await page.goto(RP);
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible({ timeout: 5_000 });
  });

  test("muestra título del formulario en el h2", async ({ page }) => {
    await page.goto(RP);
    // Busca específicamente el h2 con ese texto (no el link de navegación)
    await expect(page.locator("h2").filter({ hasText: "Únete al Bootcamp Zero" })).toBeVisible({ timeout: 8_000 });
  });
});

// ─── 6. API PHP — newsletter.php (CORS-protected: requiere Origin header) ────

test.describe("6. API PHP — newsletter.php", () => {
  // Estas APIs tienen CORS validation — sin Origin header devuelven 403 por diseño.
  // Testeamos que: (a) rechazan correctamente sin origen, (b) aceptan con origen correcto
  // pero con datos inválidos devuelven 4xx.

  test("rechaza requests sin Origin header (CORS protection activa)", async ({ request }) => {
    const res = await request.post(`${PROD}/api/newsletter.php`, {
      data: { email: "test@test.com", locale: "es", accepted: true, submittedAt: Date.now() - 5000 },
      headers: { "Content-Type": "application/json" },
    });
    // Sin Origin → debe devolver 403 (CORS protection)
    expect(res.status()).toBe(403);
  });

  test("acepta request con Origin correcto pero email inválido → 400", async ({ request }) => {
    const res = await request.post(`${PROD}/api/newsletter.php`, {
      data: { email: "bad-email", locale: "es", accepted: true, submittedAt: Date.now() - 5000 },
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://yutopias.com",
      },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("acepta request con Origin correcto y devuelve JSON", async ({ request }) => {
    const res = await request.post(`${PROD}/api/newsletter.php`, {
      data: { email: "bad-email", locale: "es", accepted: true, submittedAt: Date.now() - 5000 },
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://yutopias.com",
      },
    });
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/application\/json/);
  });
});

// ─── 7. API PHP — diagnostic.php ─────────────────────────────────────────────

test.describe("7. API PHP — diagnostic.php", () => {
  test("rechaza requests sin Origin header (CORS protection activa)", async ({ request }) => {
    const res = await request.post(`${PROD}/api/diagnostic.php`, {
      data: { action: "init", locale: "es" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(403);
  });

  test("con Origin correcto, init sin locale usa fallback 'es' y devuelve sessionId", async ({ request }) => {
    // locale es opcional — el endpoint hace fallback a "es"
    const res = await request.post(`${PROD}/api/diagnostic.php`, {
      data: { action: "init" },
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://yutopias.com",
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json().catch(() => null);
    expect(body?.ok).toBe(true);
    expect(typeof body?.sessionId).toBe("string");
  });
});

// ─── 8. API PHP — reserva-plaza.php ──────────────────────────────────────────

test.describe("8. API PHP — reserva-plaza.php", () => {
  test("rechaza requests sin Origin header (CORS protection activa)", async ({ request }) => {
    const res = await request.post(`${PROD}/api/reserva-plaza.php`, {
      data: { name: "Test", company: "Co", email: "test@test.com", locale: "es", accepted: true },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(403);
  });

  test("con Origin correcto y email inválido devuelve 400", async ({ request }) => {
    const res = await request.post(`${PROD}/api/reserva-plaza.php`, {
      data: { name: "Test", company: "Co", email: "bad-email", locale: "es", accepted: true, submittedAt: Date.now() - 5000 },
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://yutopias.com",
      },
    });
    expect([400, 422]).toContain(res.status());
  });
});

// ─── 9. Assets estáticos en producción ───────────────────────────────────────

test.describe("9. Assets estáticos", () => {
  const assets = [
    "/videos/hero-background.webm",
    "/videos/hero-background.mp4",
    "/videos/about-hero-background.mp4",
    "/images/home/partners-cta-lounge.jpg",
    "/images/simulab/simulab-yutopias-1.png",
    "/images/challenge/taxonomy-pillars.webp",
  ];

  for (const asset of assets) {
    test(`${asset} responde 200`, async ({ request }) => {
      const res = await request.get(`${PROD}${asset}`);
      expect(res.status()).toBe(200);
    });
  }

  test("hero-background.webm tiene Content-Type video/webm", async ({ request }) => {
    const res = await request.get(`${PROD}/videos/hero-background.webm`);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/video\/webm|application\/octet-stream/);
  });

  test("hero-background.mp4 tiene Content-Type video/mp4", async ({ request }) => {
    const res = await request.get(`${PROD}/videos/hero-background.mp4`);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/video\/mp4|application\/octet-stream/);
  });
});

// ─── 10. Admin panel ─────────────────────────────────────────────────────────

test.describe("10. Admin panel — admin.yutopias.com", () => {
  test("sin sesión sirve el formulario de login (DirectoryIndex login.php)", async ({ page }) => {
    await page.goto(ADMIN);
    // Apache sirve login.php como DirectoryIndex — la URL puede quedar como / o redirigir
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("login.php tiene el botón Ingresar", async ({ page }) => {
    await page.goto(`${ADMIN}/login.php`);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /ingresar/i })).toBeVisible();
  });

  test("login con credenciales incorrectas muestra error", async ({ page }) => {
    await page.goto(`${ADMIN}/login.php`);
    await page.locator('input[name="email"]').fill("wrong@email.com");
    await page.locator('input[name="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: /ingresar/i }).click();
    // Debe quedar en login con mensaje de error en .error
    await expect(page.locator(".error")).toBeVisible({ timeout: 8_000 });
    await expect(page.locator(".error")).toContainText(/incorrecto|inválido|error/i);
  });

  test("api.php sin sesión redirige a login (devuelve HTML del login)", async ({ request }) => {
    const res = await request.get(`${ADMIN}/api.php?action=stats&_csrf=fake`);
    const body = await res.text();
    // Debe ser la página de login o un error JSON de auth
    const isLoginPage = body.toLowerCase().includes("password") || body.toLowerCase().includes("ingresar");
    const isAuthError  = body.includes('"error"') || body.includes("403") || body.includes("Unauthorized");
    expect(isLoginPage || isAuthError).toBe(true);
  });
});

// ─── 11. Seguridad / Headers básicos ─────────────────────────────────────────

test.describe("11. Seguridad básica", () => {
  test("HTTPS responde correctamente", async ({ request }) => {
    const res = await request.get(PROD);
    expect(res.status()).toBeLessThan(400);
  });

  test("auth.php no filtra código PHP ni datos sensibles cuando se accede directamente", async ({ request }) => {
    const res = await request.get(`${ADMIN}/auth.php`);
    // Puede devolver 200 con body vacío (PHP ejecutado sin output) o 4xx
    // Lo importante: el body NO debe contener código PHP fuente, contraseñas ni hashes
    const body = await res.text();
    expect(body).not.toMatch(/\$2y\$|password_hash|ADMIN_USERS|\$_POST|\<\?php/);
  });

  test("API export sin key devuelve 401", async ({ request }) => {
    const res = await request.get(`${PROD}/api/export.php`);
    expect(res.status()).toBe(401);
  });
});
