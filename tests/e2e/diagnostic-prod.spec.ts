/**
 * Production smoke test — diagnostic flow on yutopias.com
 * Run: npx playwright test --config playwright.prod.config.ts
 */
import { test, expect, Page } from "@playwright/test";

const URL = "https://yutopias.com/es/autodiagnostico/";

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/prod-${name}.png`, fullPage: false });
}

test("full diagnostic flow — production", async ({ page }) => {
  // ── 1. Load ─────────────────────────────────────────────────────────────
  await page.goto(URL);
  await page.waitForLoadState("networkidle");
  await shot(page, "01-landing");

  // Hero + wizard must render
  await expect(page.locator("h1, h2, h3").first()).toBeVisible({ timeout: 15000 });

  // ── 2. Prelead form (step 1) ─────────────────────────────────────────────
  // The prelead has name/company/email + privacy checkbox
  await page.waitForSelector('input[autocomplete="given-name"]', { timeout: 10000 });
  await page.fill('input[autocomplete="given-name"]', "Playwright Test");
  await page.fill('input[autocomplete="organization"]', "Yutopias QA");
  await page.fill('input[type="email"]', "nicolas.martinez23@gmail.com");
  await page.locator('input[type="checkbox"]').first().check();
  await shot(page, "02-prelead-filled");

  // Scope submit to the diagnostic wizard form, not the newsletter form in footer
  await page.locator('button[type="submit"]').filter({ hasText: /diagnóstico|Empezar|Start|Continuar/i }).click();
  await page.waitForTimeout(2000);
  await shot(page, "03-after-prelead");

  // ── 3. Profile selection ──────────────────────────────────────────────────
  // Wait for profile step — looks for the profile grid buttons
  await page.waitForSelector('[id^="p"], .profile-btn, button:has-text("CEO"), button:has-text("Dirección")', { timeout: 10000 }).catch(() => {});
  await shot(page, "04-profile-step");

  // Click "CEO / CIO / COO" — matches id="pCEO" or text
  const ceoBtnById = page.locator('#pCEO');
  const ceoBtnByText = page.locator('button, div[onclick]').filter({ hasText: /CEO|Dirección/i });

  if (await ceoBtnById.count() > 0) {
    await ceoBtnById.click();
  } else if (await ceoBtnByText.count() > 0) {
    await ceoBtnByText.first().click();
  }
  await page.waitForTimeout(500);

  // Click "Continuar"
  const btnNext = page.locator('button').filter({ hasText: /Continuar|Continue/i });
  if (await btnNext.count() > 0) {
    await btnNext.first().click();
    await page.waitForTimeout(800);
  }
  await shot(page, "05-profile-selected");

  // ── 4. Answer 12 questions ───────────────────────────────────────────────
  // Accept cookies banner so it doesn't block clicks
  const cookieBtn = page.locator("button").filter({ hasText: /Solo necesarias|Aceptar todo/i });
  if (await cookieBtn.count() > 0) {
    await cookieBtn.first().click();
    await page.waitForTimeout(300);
  }

  await page.waitForTimeout(600);
  await shot(page, "06-q01-first");

  for (let q = 0; q < 12; q++) {
    // StepQuestion renders options as: button.w-full.text-left with border-2 class
    const optList = page.locator('button.w-full.text-left');
    await optList.first().waitFor({ state: "visible", timeout: 8000 });
    const count = await optList.count();
    await optList.nth(Math.min(1, count - 1)).click();
    await page.waitForTimeout(150);

    // "Siguiente"/"Finalizar" = bg-green-500 button, enabled, at bottom right
    const nextBtn = page.locator('button.bg-green-500:not([disabled])').last();
    await nextBtn.waitFor({ state: "visible", timeout: 5000 });
    await nextBtn.click();
    await page.waitForTimeout(300);
  }

  // ── 5. Results ───────────────────────────────────────────────────────────
  await page.waitForTimeout(2500);
  await shot(page, "07-results-full");

  // Score ring SVG
  const ring = page.locator("svg circle[stroke-dasharray]");
  await expect(ring.first()).toBeVisible({ timeout: 10000 });
  await shot(page, "08-score-ring");

  // Dimension cards (.diagnostic-dim-card)
  const dimCards = page.locator(".diagnostic-dim-card");
  const dimCount = await dimCards.count();
  expect(dimCount).toBeGreaterThan(0);
  await shot(page, "09-dim-cards");

  // Band card background — must NOT be dark navy or black
  const bandCard = page.locator(".diagnostic-band-card").first();
  await expect(bandCard).toBeVisible();
  const bandBg = await bandCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  expect(bandBg).not.toBe("rgb(0, 0, 0)");
  expect(bandBg).not.toBe("rgb(28, 30, 46)");
  expect(bandBg).not.toBe("rgb(20, 27, 46)");

  // Reto cards
  const retoCards = page.locator(".diagnostic-reto-card");
  expect(await retoCards.count()).toBeGreaterThan(0);

  // Print button
  const printBtn = page.locator("button").filter({ hasText: /Imprimir|Print/i });
  await expect(printBtn).toBeVisible({ timeout: 5000 });
  await printBtn.scrollIntoViewIfNeeded();
  await shot(page, "10-print-button");

  // ── 6. Bridge form ───────────────────────────────────────────────────────
  const bridgeWrapper = page.locator(".diagnostic-bridge-section");
  await expect(bridgeWrapper).toBeVisible({ timeout: 5000 });
  await bridgeWrapper.scrollIntoViewIfNeeded();
  await shot(page, "11-bridge-section");

  // Fill bridge form
  const bridgeFirstName = bridgeWrapper.locator('input[autocomplete="given-name"]');
  const bridgeEmail = bridgeWrapper.locator('input[type="email"]');

  if (await bridgeFirstName.count() > 0) {
    await bridgeFirstName.fill("Playwright");
    const ln = bridgeWrapper.locator('input[autocomplete="family-name"]');
    if (await ln.count() > 0) await ln.fill("Test");
    const org = bridgeWrapper.locator('input[autocomplete="organization"]');
    if (await org.count() > 0) await org.fill("Yutopias QA");
    const role = bridgeWrapper.locator('input[autocomplete="organization-title"]');
    if (await role.count() > 0) await role.fill("QA Engineer");
    if (await bridgeEmail.count() > 0) await bridgeEmail.fill("nicolas.martinez23@gmail.com");

    await shot(page, "12-bridge-filled");
    const submitBtn = bridgeWrapper.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await shot(page, "13-bridge-submitted");
  }

  await shot(page, "14-final");
});

test("print media: page renders without dark backgrounds", async ({ page }) => {
  await page.goto(URL);
  await page.waitForLoadState("networkidle");

  // Emulate print media
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(500);

  // body background in print mode — globals.css sets background:#ffffff
  const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
  // rgba(0,0,0,0) = transparent = no explicit bg set = fine for print (browser defaults to white)
  // rgb(255,255,255) = explicit white = also fine
  const isTransparentOrWhite = bodyBg === "rgba(0, 0, 0, 0)" || bodyBg === "rgb(255, 255, 255)";
  expect(isTransparentOrWhite).toBe(true);

  await page.screenshot({ path: "tests/screenshots/prod-print-simulation.png", fullPage: false });
});
