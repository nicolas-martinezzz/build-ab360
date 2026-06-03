import { test, expect } from "@playwright/test";
import path from "path";

const SECTIONS = [
  { id: "hero",         selector: "section:has(h1), [id='hero'], .section-block:first-of-type" },
  { id: "intro-strip",  selector: "section:nth-of-type(2)" },
  { id: "simulab",      selector: "[aria-labelledby='simulab-title']" },
  { id: "openlab",      selector: "[aria-labelledby='openlab-title']" },
  { id: "ab360",        selector: "[aria-labelledby='ab360-title']" },
  { id: "testimonials", selector: "[aria-labelledby='testimonials-title']" },
  { id: "blog",         selector: "section:has([aria-labelledby='blog-title']), section:last-of-type" },
];

test.describe("Visual audit — /es/ home", () => {
  test("desktop full-page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/es/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: "tests/screenshots/home-desktop-full.png",
      fullPage: true,
    });
  });

  test("mobile full-page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/es/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: "tests/screenshots/home-mobile-full.png",
      fullPage: true,
    });
  });

  test("tablet full-page screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/es/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: "tests/screenshots/home-tablet-full.png",
      fullPage: true,
    });
  });

  test("desktop — section by section screenshots", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/es/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const sections = await page.locator("section").all();
    for (let i = 0; i < sections.length; i++) {
      try {
        await sections[i].scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await sections[i].screenshot({
          path: `tests/screenshots/desktop-section-${String(i + 1).padStart(2, "0")}.png`,
        });
      } catch {
        // section not visible, skip
      }
    }
  });

  test("mobile — section by section screenshots", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/es/", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const sections = await page.locator("section").all();
    for (let i = 0; i < sections.length; i++) {
      try {
        await sections[i].scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await sections[i].screenshot({
          path: `tests/screenshots/mobile-section-${String(i + 1).padStart(2, "0")}.png`,
        });
      } catch {
        // section not visible, skip
      }
    }
  });

  test("typography audit — computed line-heights on headings", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/es/", { waitUntil: "networkidle" });

    const results = await page.evaluate(() => {
      const headings = document.querySelectorAll("h1, h2, h3");
      return Array.from(headings).map((el) => {
        const styles = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 60),
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          fontWeight: styles.fontWeight,
          classes: el.className,
        };
      });
    });

    console.log("=== TYPOGRAPHY AUDIT ===");
    results.forEach((r) => {
      console.log(`${r.tag} | ${r.fontSize} | lh:${r.lineHeight} | w:${r.fontWeight} | "${r.text}"`);
    });

    expect(results.length).toBeGreaterThan(0);
  });

  test("spacing audit — section padding computed values", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/es/", { waitUntil: "networkidle" });

    const results = await page.evaluate(() => {
      const sections = document.querySelectorAll("section");
      return Array.from(sections).map((el, i) => {
        const styles = window.getComputedStyle(el);
        const firstH = el.querySelector("h1, h2");
        return {
          index: i + 1,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          bg: styles.backgroundColor,
          firstHeading: firstH?.textContent?.trim().slice(0, 40) ?? "—",
        };
      });
    });

    console.log("=== SPACING AUDIT ===");
    results.forEach((r) => {
      console.log(`Section ${r.index} | pt:${r.paddingTop} pb:${r.paddingBottom} | "${r.firstHeading}"`);
    });

    expect(results.length).toBeGreaterThan(0);
  });

  test("overflow audit — detect horizontal scroll issues", async ({ page }) => {
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/es/", { waitUntil: "networkidle" });

      const overflowingElements = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const vpWidth = window.innerWidth;
        if (docWidth <= vpWidth) return [];

        const all = document.querySelectorAll("*");
        const offenders: { tag: string; id: string; class: string; right: number }[] = [];
        all.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > vpWidth + 2) {
            offenders.push({
              tag: el.tagName,
              id: (el as HTMLElement).id,
              class: (el as HTMLElement).className?.slice(0, 60),
              right: Math.round(rect.right),
            });
          }
        });
        return offenders.slice(0, 20);
      });

      if (overflowingElements.length > 0) {
        console.log(`=== OVERFLOW at ${width}px ===`);
        overflowingElements.forEach((el) => {
          console.log(`  ${el.tag}#${el.id} .${el.class} → right: ${el.right}px`);
        });
      } else {
        console.log(`✓ No overflow at ${width}px`);
      }
    }
    expect(true).toBe(true);
  });
});
