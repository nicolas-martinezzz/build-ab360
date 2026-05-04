import { test, expect } from "@playwright/test";

test.describe("Navegación y locales", () => {
  test("home en español carga correctamente", async ({ page }) => {
    await page.goto("/es");
    await expect(page).toHaveURL(/\/es/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("home en catalán carga correctamente", async ({ page }) => {
    await page.goto("/ca");
    await expect(page).toHaveURL(/\/ca/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("home en inglés carga correctamente", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("/es/programa carga correctamente", async ({ page }) => {
    await page.goto("/es/programa");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("ruta /es/autodiagnostico está accesible", async ({ page }) => {
    const res = await page.goto("/es/autodiagnostico");
    expect(res?.status()).toBe(200);
    await expect(page.locator("#dl-name")).toBeVisible();
  });
});
