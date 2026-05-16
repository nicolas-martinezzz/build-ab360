import { test, expect } from "@playwright/test";

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es");
  });

  test("muestra solo el icono de LinkedIn en redes sociales", async ({ page }) => {
    const footer = page.locator("#site-footer");

    // Icono de LinkedIn (tiene aria-label)
    const linkedinIcon = footer.locator('a[aria-label*="LinkedIn"]');
    await expect(linkedinIcon).toBeVisible();
    await expect(linkedinIcon).toHaveAttribute("target", "_blank");
    await expect(linkedinIcon).toHaveAttribute("rel", /noreferrer/);

    // Instagram y YouTube eliminados
    await expect(footer.locator('a[href*="instagram.com"]')).toHaveCount(0);
    await expect(footer.locator('a[href*="youtube.com"]')).toHaveCount(0);
  });

  test("credit line tiene link a YUTOPIAS SYSTEMS S.L. en LinkedIn", async ({ page }) => {
    // El link del credit line no tiene aria-label (a diferencia del icono)
    const link = page
      .locator("#site-footer")
      .getByRole("link", { name: "YUTOPIAS SYSTEMS S.L." });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://www.linkedin.com/company/yutopias/posts/?feedView=all");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  });

  test("credit line tiene link a Nicolas Martinez en LinkedIn", async ({ page }) => {
    const link = page
      .locator("#site-footer")
      .locator('a[href="https://www.linkedin.com/in/martineznae/"]');

    await expect(link).toBeVisible();
    await expect(link).toHaveText("Nicolas Martinez");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  });

  test("credit line en catalán usa 'i' como conector", async ({ page }) => {
    await page.goto("/ca");
    const footer = page.locator("#site-footer");
    await expect(footer).toContainText("Disseny web i desenvolupament");
    await expect(footer.locator('a[href*="martineznae"]')).toBeVisible();
  });

  test("credit line en inglés usa 'and' como conector", async ({ page }) => {
    await page.goto("/en");
    const footer = page.locator("#site-footer");
    await expect(footer).toContainText("Web design and development");
    await expect(footer.locator('a[href*="martineznae"]')).toBeVisible();
  });
});
