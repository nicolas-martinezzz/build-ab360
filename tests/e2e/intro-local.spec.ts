/**
 * Intro overlay — flash regression tests (LOCAL dev server)
 *
 * Run with:
 *   npx playwright test intro-local --project=chromium
 *
 * These tests target localhost:3001 (the baseURL in playwright.config.ts) so
 * they exercise YOUR local build — not production.
 *
 * Goal: verify that at NO POINT between navigation and overlay appearance does
 * the user see page content without the overlay covering it.
 *
 * Technique: inject a per-frame sampler via addInitScript that logs whether the
 * overlay is in the DOM on each animation frame.  If any frame recorded
 * "section has non-transparent background" while the overlay was absent, a
 * flash occurred.  CPU throttling via CDP widens the timing window so a real
 * flash can't hide behind fast hardware.
 */

import { test, expect, chromium } from "@playwright/test";

const LOCAL = "http://localhost:3001";

// ─── helpers ─────────────────────────────────────────────────────────────────

type FrameEntry = {
  t: number;
  overlayInDom: boolean;
  visibleSectionBg: string | null; // null = no section with non-transparent bg
};

/**
 * Inject a rAF sampler that records one entry per animation frame until stopped.
 * Call this BEFORE page.goto so it runs before any page scripts.
 */
async function injectFrameSampler(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const log: FrameEntry[] = [];
    (window as any).__framelog = log;
    (window as any).__stopFrameLog = false;

    const shieldCoversViewport = () => {
      const shield = document.getElementById("intro-shield");
      if (!shield) return false;
      const s = window.getComputedStyle(shield);
      // Shield is effective if it exists, is not hidden, and has a blocking position
      return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
    };

    const sample = () => {
      if ((window as any).__stopFrameLog) return;

      const overlay = document.querySelector(".intro-stage");
      // Either the React overlay OR the server-rendered shield constitutes valid coverage.
      const covered = !!overlay || shieldCoversViewport();

      const sections = document.querySelectorAll(
        "main, section, header, nav, footer, [class*='hero'], [class*='Hero']"
      );

      let visibleSectionBg: string | null = null;
      sections.forEach((el) => {
        if (visibleSectionBg) return;
        const bg = window.getComputedStyle(el).backgroundColor;
        if (
          bg !== "rgba(0, 0, 0, 0)" &&
          bg !== "transparent" &&
          bg !== "rgb(0, 0, 0)"
        ) {
          visibleSectionBg = `${el.tagName}${el.className ? "." + el.className.split(" ")[0] : ""} → ${bg}`;
        }
      });

      log.push({
        t: performance.now(),
        overlayInDom: covered,         // true if overlay OR shield is active
        visibleSectionBg,
      });

      requestAnimationFrame(sample);
    };

    requestAnimationFrame(sample);
  });
}

// ─── 1. Flash detection — first visit ────────────────────────────────────────

test.describe("1. Flash detection (first visit)", () => {
  test("no frame shows page content before overlay is in DOM — normal speed", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => sessionStorage.clear());
    await injectFrameSampler(page);

    await page.goto(`${LOCAL}/es`, { waitUntil: "networkidle" });
    await page.evaluate(() => ((window as any).__stopFrameLog = true));

    const log: FrameEntry[] = await page.evaluate(() => (window as any).__framelog);

    // Find any frame where a section had a non-black bg while overlay was absent.
    const flashFrames = log.filter(
      (f) => !f.overlayInDom && f.visibleSectionBg !== null
    );

    if (flashFrames.length > 0) {
      console.log("FLASH DETECTED in frames:", JSON.stringify(flashFrames.slice(0, 5), null, 2));
    }

    expect(
      flashFrames,
      `Flash detected: ${flashFrames.length} frame(s) had visible section backgrounds without the overlay.\n` +
        `First occurrence at t=${flashFrames[0]?.t?.toFixed(1)}ms: ${flashFrames[0]?.visibleSectionBg}`
    ).toHaveLength(0);
  });

  test("no frame shows page content before overlay is in DOM — CPU throttled 4×", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Throttle CPU via CDP to 4× slowdown — makes the flash window larger and
    // easier to catch if it exists.
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await context.addInitScript(() => sessionStorage.clear());
    await injectFrameSampler(page);

    await page.goto(`${LOCAL}/es`, { waitUntil: "networkidle" });
    await page.evaluate(() => ((window as any).__stopFrameLog = true));

    const log: FrameEntry[] = await page.evaluate(() => (window as any).__framelog);

    const flashFrames = log.filter(
      (f) => !f.overlayInDom && f.visibleSectionBg !== null
    );

    if (flashFrames.length > 0) {
      console.log("FLASH DETECTED (throttled) in frames:", JSON.stringify(flashFrames.slice(0, 5), null, 2));
    }

    // Attach the full log for inspection even if the test passes.
    await test.info().attach("framelog-throttled.json", {
      body: Buffer.from(JSON.stringify(log, null, 2)),
      contentType: "application/json",
    });

    await cdp.detach();
    await context.close();

    expect(
      flashFrames,
      `Flash detected (CPU throttled): ${flashFrames.length} frame(s) had visible section backgrounds without the overlay.\n` +
        `First at t=${flashFrames[0]?.t?.toFixed(1)}ms: ${flashFrames[0]?.visibleSectionBg}`
    ).toHaveLength(0);
  });

  test("overlay covers full viewport immediately after mount", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => sessionStorage.clear());
    await page.goto(`${LOCAL}/es`, { waitUntil: "domcontentloaded" });

    // Wait just one rAF tick after DOMContentLoaded — overlay should already be there.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));

    const overlay = page.locator(".intro-stage");
    await expect(overlay).toBeVisible({ timeout: 3_000 });

    const box = await overlay.boundingBox();
    const vp = page.viewportSize()!;

    expect(box!.x).toBeLessThanOrEqual(1);
    expect(box!.y).toBeLessThanOrEqual(1);
    expect(box!.width).toBeGreaterThanOrEqual(vp.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(vp.height - 1);
  });
});

// ─── 2. Screenshot sequence ───────────────────────────────────────────────────

test.describe("2. Screenshot sequence (visual record)", () => {
  test("capture frames during load — attach for manual review", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Use a 4× CPU throttle so the timing window is human-visible in the shots.
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await context.addInitScript(() => sessionStorage.clear());

    // Navigate and immediately start polling screenshots every 100 ms.
    const screenshots: { label: string; data: Buffer }[] = [];

    const navPromise = page.goto(`${LOCAL}/es`, { waitUntil: "networkidle" });

    // Poll until nav resolves.
    let tick = 0;
    const interval = setInterval(async () => {
      try {
        const shot = await page.screenshot({ fullPage: false });
        screenshots.push({ label: `t${tick++ * 100}ms`, data: shot });
      } catch {
        // page may not be ready yet — skip
      }
    }, 100);

    await navPromise;
    clearInterval(interval);

    // Attach every screenshot so the test report has a visual timeline.
    for (const { label, data } of screenshots) {
      await test.info().attach(label, { body: data, contentType: "image/png" });
    }

    // At minimum, verify overlay is visible after load.
    await expect(page.locator(".intro-stage")).toBeVisible({ timeout: 3_000 });

    await cdp.detach();
    await context.close();
  });
});

// ─── 3. Body inline-style gate ────────────────────────────────────────────────

test.describe("3. Body inline-style gate", () => {
  test("body has inline background:#000 before any JS runs (first visit)", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => sessionStorage.clear());
    // 'domcontentloaded' ensures the body exists but our inline scripts have run.
    // We check the body style AFTER it's been parsed but before React hydrates.
    await page.goto(`${LOCAL}/es`, { waitUntil: "domcontentloaded" });

    // body.style.background should still be '#000' (first visit — inline script
    // only clears it for returning visitors).
    const inlineBg = await page.evaluate(() => document.body?.style.background ?? "");
    // Browsers normalise '#000' → 'rgb(0, 0, 0)' in style.background.
    const isBlack = inlineBg === "#000" || inlineBg === "rgb(0, 0, 0)" || inlineBg === "black";
    expect(isBlack, `Inline body background must be black on first visit, got: "${inlineBg}"`).toBe(true);
  });

  test("body inline background is cleared by init script for returning visitors", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
    await page.goto(`${LOCAL}/es`, { waitUntil: "domcontentloaded" });

    const inlineBg = await page.evaluate(() => document.body.style.background);
    expect(
      inlineBg,
      "Inline style must be cleared by the synchronous init script for returning visitors"
    ).toBe("");
  });
});
