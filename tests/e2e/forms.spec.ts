import { test, expect } from "@playwright/test";

const BASE = "https://yutopias.com";

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
    await footer.getByPlaceholder(/email/i).fill("test+e2e@yutopias.com");
    await footer.getByRole("checkbox").check();

    const responsePromise = page.waitForResponse((r) =>
      r.url().includes("newsletter") && r.request().method() === "POST",
    );
    await footer.getByRole("button", { name: /suscrib/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBeLessThan(500);
    // El form se reemplaza por el mensaje de éxito
    await expect(footer.getByText(/gracias|suscrito|confirmad/i)).toBeVisible();
  });

  test("does not submit without accepting privacy", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await footer.getByPlaceholder(/email/i).fill("test@yutopias.com");
    // checkbox NOT checked
    const btn = footer.getByRole("button", { name: /suscrib/i });
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

  test("shows validation errors when fields are empty", async ({ page }) => {
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/completá todos los campos/i)).toBeVisible();
  });

  test("shows email validation error for invalid email", async ({ page }) => {
    await page.getByLabel("Nombre").fill("Test");
    await page.getByLabel("Empresa").fill("Empresa S.A.");
    await page.getByLabel("Email").fill("noesunemail");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/email no es válido/i)).toBeVisible();
  });

  test("shows privacy error when not accepted", async ({ page }) => {
    await page.getByLabel("Nombre").fill("Test");
    await page.getByLabel("Empresa").fill("Empresa S.A.");
    await page.getByLabel("Email").fill("test@empresa.com");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/política de privacidad/i)).toBeVisible();
  });

  test("submits and redirects to autodiagnostico", async ({ page }) => {
    await page.getByLabel("Nombre").fill("Test E2E");
    await page.getByLabel("Empresa").fill("Empresa E2E S.A.");
    await page.getByLabel("Email").fill("test+e2e@yutopias.com");
    await page.getByRole("checkbox").check();

    await page.getByRole("button", { name: /continuar/i }).click();
    await page.waitForURL(/autodiagnostico/, { timeout: 15_000 });
    expect(page.url()).toContain("autodiagnostico");
  });
});

// ---------------------------------------------------------------------------
// Bootcamp lead form — /es/programa
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

    const responsePromise = page.waitForResponse((r) =>
      r.url().includes("bootcamp") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: /apunt|reserv|enviar/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBeLessThan(500);
    await expect(page.getByText(/gracias|plaza reservada|recibirás/i)).toBeVisible();
  });

  test("requires all fields — HTML5 validation fires", async ({ page }) => {
    await page.getByRole("button", { name: /apunt|reserv|enviar/i }).click();
    // Sin llenar campos con `required`, el browser bloquea el submit
    const nameInput = page.locator("#bootcamp-name");
    const validationMsg = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    expect(validationMsg).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Ebook lead form — /es/recursos (o cualquier página con el form)
// ---------------------------------------------------------------------------
test.describe("Ebook lead form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/es/recursos`);
  });

  test("expands and submits successfully", async ({ page }) => {
    // Abrir el form si está colapsado
    const ctaBtn = page.getByRole("button", { name: /descargar|obtener.*ebook/i });
    if (await ctaBtn.isVisible()) {
      await ctaBtn.click();
    }

    await page.getByPlaceholder(/nombre/i).first().fill("Ana");
    await page.getByPlaceholder(/apellido/i).fill("García");
    await page.getByPlaceholder(/empresa/i).fill("Empresa E2E");
    await page.getByPlaceholder(/email/i).fill("test+ebook@yutopias.com");
    await page.getByRole("checkbox").check();

    const responsePromise = page.waitForResponse((r) =>
      r.url().includes("ebook") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: /enviar|descargar/i }).last().click();
    const response = await responsePromise;

    expect(response.status()).toBeLessThan(500);
    await expect(page.getByRole("link", { name: /descargar/i })).toBeVisible();
  });
});
