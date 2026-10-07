import { test, expect } from "@playwright/test";

const BASE = "https://yutopias.com";

// Los endpoints PHP de producción tienen un gate anti-bot por tiempo: rechazan
// envíos hechos menos de 1500ms (800ms para ebook) después del `startedAt`
// que el form captura al montarse. Esperamos un poco más antes de cada submit.
const BOT_TIME_GATE_MS = 1_700;

// El cookie banner es un overlay fijo inferior que intercepta clicks y el
// intro overlay tapa la página en la primera visita. Ambos se desactivan
// seteando el storage que el producto usa para recordarlos
// (ver CookieConsentBanner/useCookieConsent y el intro-shield del layout).
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem("cookie-consent", JSON.stringify({ analytics: false }));
    sessionStorage.setItem("intro-seen", "1");
  });
});

// ---------------------------------------------------------------------------
// Newsletter footer (presente en todas las páginas)
// ---------------------------------------------------------------------------
test.describe("Newsletter footer form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/es/`);
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  });

  test("submits successfully with valid data", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await footer.getByPlaceholder(/nombre/i).fill("Test Usuario");
    // El placeholder real es "Tu e-mail" (con guión)
    await footer.getByPlaceholder(/e-?mail/i).fill("test+e2e@yutopias.com");
    await footer.getByRole("checkbox").check();

    // El backend rechaza envíos demasiado rápidos (anti-bot)
    await page.waitForTimeout(BOT_TIME_GATE_MS);

    const responsePromise = page.waitForResponse((r) =>
      r.url().includes("newsletter") && r.request().method() === "POST",
    );
    // El botón real es "Subscribirse"
    await footer.getByRole("button", { name: /subscrib/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBeLessThan(500);
    // El form se reemplaza por el mensaje de éxito
    await expect(footer.getByText(/gracias|suscrito|añadido|confirmad/i)).toBeVisible();
  });

  test("does not submit without accepting privacy", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await footer.getByPlaceholder(/e-?mail/i).fill("test@yutopias.com");
    // checkbox NOT checked
    const btn = footer.getByRole("button", { name: /subscrib/i });
    await expect(btn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Reserva de plaza — la página se eliminó el 07/10/2026. Las URLs viejas
// (circularon públicamente) deben responder 301 hacia la página de programa
// del idioma del visitante (regla en public/.htaccess).
// ---------------------------------------------------------------------------
test.describe("Reserva plaza → 301 redirect to programa", () => {
  const cases = [
    { from: "/es/reserva-plaza", to: "/es/programa/" },
    { from: "/es/reserva-plaza/", to: "/es/programa/" },
    { from: "/en/book-your-spot", to: "/en/program/" },
    { from: "/en/book-your-spot/", to: "/en/program/" },
    { from: "/ca/reserva-placa", to: "/ca/programa/" },
    { from: "/ca/reserva-placa/", to: "/ca/programa/" },
  ];

  for (const { from, to } of cases) {
    test(`${from} responde 301 → ${to}`, async ({ request }) => {
      const res = await request.get(`${BASE}${from}`, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      expect(res.headers()["location"]).toContain(to);
    });
  }
});

// ---------------------------------------------------------------------------
// Bootcamp lead form — /es/programa (campaña Bootcamp Zero × APCE Catalunya)
// ---------------------------------------------------------------------------
test.describe("Bootcamp lead form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/es/programa`);
    // El form está en el sticky aside — scrollear hasta él
    await page.locator("#bootcamp-name").scrollIntoViewIfNeeded();
  });

  test("submits successfully with valid data", async ({ page }) => {
    await page.locator("#bootcamp-name").fill("Test E2E");
    await page.locator("#bootcamp-email").fill("test+bootcamp@yutopias.com");
    await page.locator("#bootcamp-role").fill("CTO");
    await page.locator("#bootcamp-company").fill("Empresa E2E");
    // Las dos preguntas radio de la campaña son obligatorias
    await page.getByRole("radio", { name: "Sí, me quedaré en el almuerzo" }).check();
    await page.getByRole("radio", { name: "Empresa no asociada" }).check();

    await page.waitForTimeout(BOT_TIME_GATE_MS);

    const responsePromise = page.waitForResponse((r) =>
      r.url().includes("bootcamp") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Solicitar plaza" }).click();
    const response = await responsePromise;

    expect(response.status()).toBeLessThan(500);
    // messages/es.json → programaPage.bootcamp.formSuccess
    await expect(page.getByText(/tu solicitud ha sido guardada/i)).toBeVisible();
  });

  test("requires all fields — HTML5 validation fires", async ({ page }) => {
    await page.getByRole("button", { name: "Solicitar plaza" }).click();
    // Sin llenar campos con `required`, el browser bloquea el submit
    const nameInput = page.locator("#bootcamp-name");
    const validationMsg = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    expect(validationMsg).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Ebook lead form — /es/resources/ab360-ebook (viene expandido de entrada)
// ---------------------------------------------------------------------------
test.describe("Ebook lead form", () => {
  test.beforeEach(async ({ page }) => {
    // La ruta /es/recursos ya no existe (404) — la sección es /es/resources y
    // el form del ebook vive en la página del ebook, inicialmente expandido.
    await page.goto(`${BASE}/es/resources/ab360-ebook/`);
  });

  test("expands and submits successfully", async ({ page }) => {
    const form = page.locator('form[name="ebook-subscription"]');
    await form.scrollIntoViewIfNeeded();

    await page.locator("#ebook-first-name").fill("Ana");
    await page.locator("#ebook-last-name").fill("García");
    await page.locator("#ebook-company").fill("Empresa E2E");
    await page.locator("#ebook-email").fill("test+ebook@yutopias.com");
    await form.getByRole("checkbox").check();

    // Gate anti-bot del endpoint (800ms desde el montaje del form)
    await page.waitForTimeout(1_000);

    const responsePromise = page.waitForResponse((r) =>
      r.url().includes("ebook") && r.request().method() === "POST",
    );
    await form.getByRole("button", { name: /descargar gratis/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBeLessThan(500);
    await expect(page.getByRole("link", { name: /descargar ebook/i })).toBeVisible();
  });
});
