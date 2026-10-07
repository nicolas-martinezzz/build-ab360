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
// Reserva de plaza — /es/reserva-plaza
// ---------------------------------------------------------------------------
test.describe("Reserva plaza form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/es/reserva-plaza`);
  });

  // El form sí tiene labels asociados (htmlFor/id), pero getByLabel("Nombre")
  // colisiona con el "Tu nombre" del newsletter del footer (substring match).
  // Usamos los ids estables del form, como hace production-audit.spec.ts.
  const fillForm = async (
    page: import("@playwright/test").Page,
    { name, company, email }: { name: string; company: string; email: string },
  ) => {
    await page.locator("#rp-name").fill(name);
    await page.locator("#rp-company").fill(company);
    await page.locator("#rp-email").fill(email);
  };

  test("shows validation errors when fields are empty", async ({ page }) => {
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/completá todos los campos/i)).toBeVisible();
  });

  test("shows email validation error for invalid email", async ({ page }) => {
    await fillForm(page, { name: "Test", company: "Empresa S.A.", email: "noesunemail" });
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/email no es válido/i)).toBeVisible();
  });

  test("shows privacy error when not accepted", async ({ page }) => {
    await fillForm(page, { name: "Test", company: "Empresa S.A.", email: "test@empresa.com" });
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(
      page.getByText(/tenés que aceptar la política de privacidad/i),
    ).toBeVisible();
  });

  test("submits and redirects to autodiagnostico", async ({ page }) => {
    await fillForm(page, {
      name: "Test E2E",
      company: "Empresa E2E S.A.",
      email: "test+e2e@yutopias.com",
    });
    // Scoped al form: el footer tiene su propio checkbox de privacidad
    await page
      .locator("form", { has: page.locator("#rp-name") })
      .getByRole("checkbox")
      .check();

    await page.waitForTimeout(BOT_TIME_GATE_MS);
    await page.getByRole("button", { name: /continuar/i }).click();
    await page.waitForURL(/autodiagnostico/, { timeout: 15_000 });
    expect(page.url()).toContain("autodiagnostico");
  });
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
