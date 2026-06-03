import { test, expect, type Page } from "@playwright/test";

const DIAG_URL = "/es/autodiagnostico";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

async function fillPrelead(page: Page, overrides: { name?: string; company?: string; email?: string } = {}) {
  await page.locator("#dl-name").fill(overrides.name ?? "Nicolas Martinez");
  await page.locator("#dl-company").fill(overrides.company ?? "Yutopias Test");
  await page.locator("#dl-email").fill(overrides.email ?? "test@yutopias.com");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
}

async function selectProfile(page: Page) {
  await expect(page.getByRole("button", { name: /CEO|Dirección/i }).first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /CEO|Dirección/i }).first().click();
  await page.getByRole("button", { name: /continuar|siguiente|continue/i }).click();
}

async function answerAllQuestions(page: Page, optionIndex = 0) {
  for (let q = 0; q < 12; q++) {
    await expect(page.locator("text=/\\d+ \\/ 12/")).toBeVisible({ timeout: 8_000 });
    const options = page.locator("button.w-full.text-left");
    await options.nth(optionIndex).click();
    const nextBtn = page.locator("button.bg-\\[\\#127334\\]").last();
    await expect(nextBtn).toBeEnabled({ timeout: 5_000 });
    await nextBtn.click();
  }
}

async function goToResults(page: Page, prelead: { name?: string; company?: string; email?: string } = {}) {
  await page.goto(DIAG_URL);
  await fillPrelead(page, prelead);
  await selectProfile(page);
  await answerAllQuestions(page);
  await expect(page.getByText("Tu diagnóstico", { exact: true }).first()).toBeVisible({ timeout: 15_000 });
}

/* ─── Prelead — validación de campos ────────────────────────────────────── */

test.describe("Prelead — validación de campos", () => {
  test("muestra el formulario de prelead al cargar", async ({ page }) => {
    await page.goto(DIAG_URL);
    await expect(page.locator("#dl-name")).toBeVisible();
    await expect(page.locator("#dl-company")).toBeVisible();
    await expect(page.locator("#dl-email")).toBeVisible();
  });

  test("bloquea submit si todos los campos están vacíos", async ({ page }) => {
    await page.goto(DIAG_URL);
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("bloquea submit si falta el nombre", async ({ page }) => {
    await page.goto(DIAG_URL);
    await page.locator("#dl-company").fill("Empresa");
    await page.locator("#dl-email").fill("ok@email.com");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("bloquea submit si el email tiene formato inválido", async ({ page }) => {
    await page.goto(DIAG_URL);
    await page.locator("#dl-name").fill("Test User");
    await page.locator("#dl-company").fill("Test Company");
    await page.locator("#dl-email").fill("no-es-un-email");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("bloquea submit si no se acepta la política de privacidad", async ({ page }) => {
    await page.goto(DIAG_URL);
    await page.locator("#dl-name").fill("Test User");
    await page.locator("#dl-company").fill("Test Company");
    await page.locator("#dl-email").fill("ok@email.com");
    await page.getByRole("button", { name: /empezar|comenzar|start/i }).click();
    await expect(page.locator("p.text-red-600")).toBeVisible();
  });

  test("avanza al paso de perfil con datos válidos", async ({ page }) => {
    await page.goto(DIAG_URL);
    await fillPrelead(page);
    await expect(page.getByRole("button", { name: /CEO|Dirección/i }).first()).toBeVisible({ timeout: 10_000 });
  });
});

/* ─── Flujo completo ─────────────────────────────────────────────────────── */

test.describe("Diagnóstico — flujo completo", () => {
  test("prelead → perfil → 12 preguntas → pantalla de resultados", async ({ page }) => {
    await goToResults(page);
    await expect(page.getByText("Tus 3 prioridades de mejora", { exact: true })).toBeVisible();
  });

  test("la puntuación global aparece en pantalla de resultados", async ({ page }) => {
    await goToResults(page);
    await expect(page.locator("text=/\\d[,.]\\d\\/10/").first()).toBeVisible({ timeout: 5_000 });
  });

  test("las 4 dimensiones se muestran en los resultados", async ({ page }) => {
    await goToResults(page);
    await expect(page.getByText("Bloque I", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Bloque II", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Bloque III", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Bloque IV", { exact: false }).first()).toBeVisible();
  });
});

/* ─── Botón de descarga ─────────────────────────────────────────────────── */

test.describe("Botón de descarga del informe", () => {
  test("el botón de descarga es visible en la pantalla de resultados", async ({ page }) => {
    await goToResults(page);
    const downloadBtn = page.getByRole("button", { name: /imprimir|informe|descargar|print|report/i }).first();
    await expect(downloadBtn).toBeVisible({ timeout: 5_000 });
  });

  test("al hacer click se descarga un archivo .html con nombre correcto", async ({ page }) => {
    await goToResults(page, { company: "TestEmpresa" });

    const downloadBtn = page.getByRole("button", { name: /imprimir|informe|descargar|print|report/i }).first();
    await expect(downloadBtn).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10_000 }),
      downloadBtn.click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.html$/i);
    expect(download.suggestedFilename()).toMatch(/^informe-diagnostico/);
  });

  test("el nombre del archivo incluye la empresa del usuario", async ({ page }) => {
    await goToResults(page, { company: "Constructora SA" });

    const downloadBtn = page.getByRole("button", { name: /imprimir|informe|descargar|print|report/i }).first();
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10_000 }),
      downloadBtn.click(),
    ]);

    expect(download.suggestedFilename().toLowerCase()).toContain("constructora");
  });

  test("el archivo descargado es HTML válido con el contenido del informe", async ({ page }) => {
    await goToResults(page);

    const downloadBtn = page.getByRole("button", { name: /imprimir|informe|descargar|print|report/i }).first();
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10_000 }),
      downloadBtn.click(),
    ]);

    const path = await download.path();
    const { readFileSync } = await import("fs");
    const content = readFileSync(path!, "utf-8");

    expect(content).toMatch(/^<!DOCTYPE html>/i);
    expect(content).toContain("yūtopias");
    expect(content).toContain("prioridades de mejora");
    expect(content).toContain("Rendimiento por dimensión");
    expect(content).not.toContain("undefined");
    expect(content).not.toContain("[object Object]");
    expect(content).not.toContain("NaN");
  });
});

/* ─── Navegación y estado ────────────────────────────────────────────────── */

test.describe("Navegación dentro del wizard", () => {
  test("el botón 'Volver' en selección de perfil regresa al prelead", async ({ page }) => {
    await page.goto(DIAG_URL);
    await fillPrelead(page);
    await expect(page.getByRole("button", { name: /CEO|Dirección/i }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /volver|back/i }).click();
    await expect(page.locator("#dl-name")).toBeVisible({ timeout: 5_000 });
  });

  test("el botón 'Siguiente' está deshabilitado hasta responder la pregunta", async ({ page }) => {
    await page.goto(DIAG_URL);
    await fillPrelead(page);
    await selectProfile(page);
    await expect(page.locator("text=/1 \\/ 12/")).toBeVisible({ timeout: 8_000 });
    const nextBtn = page.locator("button.bg-\\[\\#127334\\]").last();
    await expect(nextBtn).toBeDisabled();
  });

  test("el botón 'Siguiente' se habilita al seleccionar una respuesta", async ({ page }) => {
    await page.goto(DIAG_URL);
    await fillPrelead(page);
    await selectProfile(page);
    await expect(page.locator("text=/1 \\/ 12/")).toBeVisible({ timeout: 8_000 });
    await page.locator("button.w-full.text-left").first().click();
    await expect(page.locator("button.bg-\\[\\#127334\\]").last()).toBeEnabled({ timeout: 3_000 });
  });

  test("el indicador de progreso avanza de 1/12 a 2/12", async ({ page }) => {
    await page.goto(DIAG_URL);
    await fillPrelead(page);
    await selectProfile(page);
    await expect(page.locator("text=/1 \\/ 12/")).toBeVisible({ timeout: 8_000 });
    await page.locator("button.w-full.text-left").first().click();
    await page.locator("button.bg-\\[\\#127334\\]").last().click();
    await expect(page.locator("text=/2 \\/ 12/")).toBeVisible({ timeout: 5_000 });
  });

  test("el botón 'Empezar de nuevo' reinicia el wizard al prelead", async ({ page }) => {
    await goToResults(page);
    const restartBtn = page.getByRole("button", { name: /empezar de nuevo|reiniciar|restart/i }).first();
    await expect(restartBtn).toBeVisible({ timeout: 5_000 });
    await restartBtn.click();
    await expect(page.locator("#dl-name")).toBeVisible({ timeout: 5_000 });
  });
});
