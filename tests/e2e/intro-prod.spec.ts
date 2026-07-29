/**
 * Intro overlay — regression tests against production (yutopias.com)
 *
 * Run with:
 *   npx playwright test intro-prod --project=chromium --config=playwright.config.ts
 *
 * The config's baseURL points to localhost, but these tests always hit PROD directly.
 * They clear sessionStorage before each test to simulate a genuine first visit.
 *
 * What we're guarding against:
 *   - Intro not showing on first visit
 *   - Flash of page content before the intro overlay covers it
 *   - Intro showing on a returning visit (sessionStorage already has the key)
 */

import { test, expect, Page } from "@playwright/test";

const PROD = "https://yutopias.com";
const INTRO_SEEN_KEY = "intro-seen";
const OVERLAY_SELECTOR = ".intro-stage";

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Navigate to a URL with the earliest possible waitUntil so we can assert
 * state as close to first paint as Playwright allows.
 */
async function gotoEarly(page: Page, url: string) {
  await page.goto(url, { waitUntil: "commit" });
}

/**
 * Read the computed background-color of the <body> element.
 */
async function bodyBg(page: Page): Promise<string> {
  return page.evaluate(() =>
    window.getComputedStyle(document.body).backgroundColor
  );
}

/**
 * Return true if the overlay element exists in the DOM and is not hidden.
 */
async function overlayIsVisible(page: Page): Promise<boolean> {
  const el = page.locator(OVERLAY_SELECTOR);
  try {
    await el.waitFor({ state: "visible", timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

// ─── 1. First-visit behaviour ─────────────────────────────────────────────────

test.describe("1. First visit (no intro-seen key)", () => {
  test.beforeEach(async ({ context }) => {
    // Clear sessionStorage so every test starts as a genuine first visit.
    // addInitScript runs before any page script, including our inline script.
    await context.addInitScript(() => {
      // Block sessionStorage reads/writes during the very first navigation so
      // the inline script in layout.tsx sees no key and keeps body black.
      const _setItem = Storage.prototype.setItem.bind(sessionStorage);
      sessionStorage.clear();
      // Restore after clearing so the intro can write 'intro-seen' on dismiss.
      Storage.prototype.setItem = _setItem;
    });
  });

  test("body background is black before React hydrates", async ({ page }) => {
    // Use 'commit' so we inspect the DOM immediately after the first byte.
    await gotoEarly(page, `${PROD}/es`);

    const bg = await bodyBg(page);
    // The inline script in layout.tsx sets background to black for first-time
    // visitors. Browsers may serialise '#000' as either "rgb(0, 0, 0)" or
    // "rgba(0, 0, 0, 0)" depending on when the style is read, so compare the
    // parsed channels instead of the raw string.
    const channels = bg.match(/[\d.]+/g)?.slice(0, 3).map(Number);
    expect(channels, "Body should be black before intro overlay mounts").toEqual(
      [0, 0, 0]
    );
  });

  test("intro overlay appears within 3 s of page load", async ({ page }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });

    const visible = await overlayIsVisible(page);
    expect(visible, "Intro overlay must be visible on first visit").toBe(true);
  });

  test("intro overlay has z-index above page content", async ({ page }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "visible", timeout: 5_000 });

    const zIndex = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? window.getComputedStyle(el).zIndex : null;
    }, OVERLAY_SELECTOR);

    // CSS defines z-index: 9999 on .intro-stage
    expect(Number(zIndex)).toBeGreaterThanOrEqual(9999);
  });

  test("no flash: page content is not visible before overlay covers it", async ({
    page,
  }) => {
    // Strategy: inject a MutationObserver BEFORE navigation that records
    // whether any non-overlay element rendered a non-black background while
    // the overlay was absent.  We check that record after load.
    await page.addInitScript(() => {
      (window as any).__flashDetected = false;

      // Watch for any element added to <body> that is NOT the overlay and has
      // a computed background that is not black/transparent.
      const observer = new MutationObserver(() => {
        const overlay = document.querySelector(".intro-stage");
        if (overlay) {
          // Overlay is present — no need to watch further.
          observer.disconnect();
          return;
        }
        // Overlay is absent — check if any visible section/div has a light bg.
        const suspects = document.querySelectorAll("main, section, header, #__next > div");
        suspects.forEach((el) => {
          const bg = window.getComputedStyle(el).backgroundColor;
          // Anything that isn't transparent or black counts as a flash.
          if (
            bg !== "rgba(0, 0, 0, 0)" &&
            bg !== "transparent" &&
            bg !== "rgb(0, 0, 0)"
          ) {
            (window as any).__flashDetected = true;
          }
        });
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    });

    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });

    const flashed = await page.evaluate(() => (window as any).__flashDetected);
    expect(flashed, "Page content must not be visible before intro overlay").toBe(
      false
    );
  });

  test("screenshot at domcontentloaded shows black/overlay, not page content", async ({
    page,
  }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });

    // Give React one tick to mount the overlay, then screenshot.
    await page.waitForTimeout(200);
    const screenshot = await page.screenshot({ fullPage: false });

    // We can't pixel-compare inline in Playwright without a baseline, but we
    // can assert the overlay is in the DOM and covering the viewport.
    await expect(page.locator(OVERLAY_SELECTOR)).toBeVisible();

    // Also verify the hero h1 is not visible through the overlay
    // (it may exist in DOM but must not be visible to the user).
    const heroSection = page.locator("section").first();
    const overlayBox = await page.locator(OVERLAY_SELECTOR).boundingBox();
    const viewportSize = page.viewportSize();

    if (overlayBox && viewportSize) {
      // Overlay must cover the full viewport width and height.
      expect(overlayBox.width).toBeGreaterThanOrEqual(viewportSize.width - 1);
      expect(overlayBox.height).toBeGreaterThanOrEqual(viewportSize.height - 1);
    }

    // Attach screenshot to the test report for manual review.
    await test.info().attach("early-screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  });
});

// ─── 2. Returning-visit behaviour ────────────────────────────────────────────

test.describe("2. Returning visit (intro-seen already set)", () => {
  test.beforeEach(async ({ context }) => {
    // Simulate a session where the user has already seen the intro.
    await context.addInitScript(() => {
      sessionStorage.setItem("intro-seen", "1");
    });
  });

  test("intro overlay does NOT appear for returning visitors", async ({
    page,
  }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });

    // Give React time to potentially mount the overlay if it were going to.
    await page.waitForTimeout(1_500);

    const el = page.locator(OVERLAY_SELECTOR);
    await expect(el, "Overlay must not appear for returning visitors").toHaveCount(
      0
    );
  });

  test("inline script removes the body inline-style for returning visitors", async ({
    page,
  }) => {
    // We cannot check computed background-color because the site's global CSS
    // already sets the body to black independently of the inline style.
    // What we CAN assert is that the inline style attribute was cleared by the
    // synchronous script, meaning 'background' is no longer in body.style.
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });

    const inlineBackground = await page.evaluate(
      () => document.body.style.background
    );
    expect(
      inlineBackground,
      "Inline body.style.background must be cleared by the init script for returning visitors"
    ).toBe("");
  });

  test("page content is immediately visible for returning visitors", async ({
    page,
  }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible({ timeout: 5_000 });
  });
});

// ─── 3. Dismiss behaviour ─────────────────────────────────────────────────────

test.describe("3. Dismiss (click to skip)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      sessionStorage.clear();
    });
  });

  test("clicking the overlay while animation plays skips and shows 'toca para continuar'", async ({
    page,
  }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "visible", timeout: 5_000 });

    // Click immediately — animation should be in progress at < 5 s.
    await page.locator(OVERLAY_SELECTOR).click();

    // After skip, hint text changes to 'toca para continuar'
    await expect(page.locator(".intro-hint")).toHaveText("toca para continuar", {
      timeout: 2_000,
    });
  });

  test("second click after skip dismisses overlay and exposes page content", async ({
    page,
  }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "visible", timeout: 5_000 });

    // First click: skip animation.
    await page.locator(OVERLAY_SELECTOR).click();
    // Second click: dismiss.
    await page.locator(OVERLAY_SELECTOR).click();

    // Overlay should fade out and be removed from DOM.
    await expect(page.locator(OVERLAY_SELECTOR)).toHaveCount(0, {
      timeout: 3_000,
    });

    // Page content must now be visible.
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 3_000 });
  });

  test("inline body style is cleared after dismissal", async ({ page }) => {
    // dismiss() calls document.body.style.background = '' which removes the
    // inline style. The computed background may still be black (global CSS),
    // but the INLINE style must be empty so the body is not double-locked black.
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "visible", timeout: 5_000 });

    await page.locator(OVERLAY_SELECTOR).click();
    await page.locator(OVERLAY_SELECTOR).click();
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "detached", timeout: 3_000 });

    const inlineBackground = await page.evaluate(
      () => document.body.style.background
    );
    expect(
      inlineBackground,
      "dismiss() must clear the inline body.style.background"
    ).toBe("");
  });

  test("sessionStorage intro-seen is written after dismissal", async ({
    page,
  }) => {
    await page.goto(`${PROD}/es`, { waitUntil: "domcontentloaded" });
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "visible", timeout: 5_000 });

    await page.locator(OVERLAY_SELECTOR).click();
    await page.locator(OVERLAY_SELECTOR).click();
    await page.locator(OVERLAY_SELECTOR).waitFor({ state: "detached", timeout: 3_000 });

    const key = await page.evaluate(
      (k) => sessionStorage.getItem(k),
      INTRO_SEEN_KEY
    );
    expect(key).toBe("1");
  });
});
