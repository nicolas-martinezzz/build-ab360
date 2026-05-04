import { test, expect } from "@playwright/test";

const DIAG_URL = "/es/autodiagnostico";

test.describe("Diagnóstico — flujo completo", () => {
  test("carga la página y muestra el formulario de prelead", async ({ page }) => {
    await page.goto(DIAG_URL);
    await expect(page.locator("#dl-name")).toBeVisible();
    await expect(page.locator("#dl-company")).toBeVisible();
    await expect(page.locator("#dl-email")).toBeVisible();
  });

  test("valida campos requeridos en prelead", async ({ page }) => {
    await page.goto(DIAG_URL);
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("valida formato de email incorrecto", async ({ page }) => {
    await page.goto(DIAG_URL);
    await page.locator("#dl-name").fill("Test User");
    await page.locator("#dl-company").fill("Test Company");
    await page.locator("#dl-email").fill("no-es-un-email");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("flujo completo: prelead → perfil → 12 preguntas → resultados", async ({ page }) => {
    await page.goto(DIAG_URL);

    // Step 1 — Prelead
    await page.locator("#dl-name").fill("Nicolas Martinez");
    await page.locator("#dl-company").fill("Yutopias Test");
    await page.locator("#dl-email").fill("test@yutopias.com");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();

    // Step 2 — Profile selection (espera el grid de perfiles)
    const profileBtn = page.getByRole("button", { name: /CEO|Dirección/i }).first();
    await expect(profileBtn).toBeVisible({ timeout: 10_000 });
    await profileBtn.click();
    await page.getByRole("button", { name: /continuar|siguiente|continue/i }).click();

    // Step 3 — 12 preguntas: siempre elegimos la primera opción
    for (let q = 0; q < 12; q++) {
      const counter = page.locator("text=/\\d+ \\/ 12/");
      await expect(counter).toBeVisible({ timeout: 8_000 });

      // Seleccionar primera opción de respuesta
      const options = page.locator("button.w-full.text-left");
      await options.first().click();

      // Botón de navegación: verde, al fondo a la derecha
      const nextBtn = page.locator("button.bg-\\[\\#127334\\]").last();
      await expect(nextBtn).toBeEnabled({ timeout: 5_000 });
      await nextBtn.click();
    }

    // Step 4 — Resultados (wizard SPA, misma URL)
    await expect(page.getByText("Tu diagnóstico", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Tus 3 prioridades de mejora", { exact: true })).toBeVisible();
  });
});
