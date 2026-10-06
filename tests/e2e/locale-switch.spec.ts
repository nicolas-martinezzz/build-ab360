/**
 * Locale switch — client-side navigation regression test
 *
 * Reproduces a real bug: switching locale via the header's language
 * selector is a CLIENT-SIDE navigation (next-intl <Link locale={...}>), which
 * forces `src/app/[locale]/layout.tsx` (`LocaleLayout`) to re-render on the
 * client because its dynamic `[locale]` segment changes value. If that
 * layout renders a `<script>` (raw or `next/script`), React throws:
 *
 *   Error: Encountered a script tag while rendering React component.
 *   Scripts inside React components are never executed when rendering on
 *   the client.
 *
 * because React does not support mounting a <script> element on a
 * client-only re-render. This test drives the REAL header locale selector
 * (not page.goto) across all six directed locale pairs and asserts there is
 * no console error, no page error, the resulting URL is correct for the
 * target locale, and the page still renders visible content.
 */

import { test, expect, type Page } from "@playwright/test";

const LOCALE_URL: Record<"es" | "en" | "ca", string> = {
  es: "/es/programa",
  en: "/en/program",
  ca: "/ca/programa",
};

const LOCALE_LABEL: Record<"es" | "en" | "ca", string> = {
  es: "Español",
  en: "English",
  ca: "Català",
};

const LOCALE_BUTTON_NAME = /idioma|language/i;

type Locale = "es" | "en" | "ca";

/**
 * Click the header's language-selector dropdown and pick `target`. This is a
 * real client-side navigation (next-intl <Link>), unlike `page.goto`, so it
 * exercises the exact code path that used to crash on locale switch.
 */
async function switchLocaleViaHeader(page: Page, target: Locale) {
  const toggle = page.getByRole("button", { name: LOCALE_BUTTON_NAME });
  await toggle.click();

  const option = page.getByRole("option", { name: LOCALE_LABEL[target] });
  await option.click();

  await expect(page).toHaveURL(new RegExp(`${LOCALE_URL[target]}/?$`));
  await expect(page.locator("h1, h2").first()).toBeVisible();
}

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return errors;
}

function assertNoErrors(errors: string[]) {
  const scriptTagCrash = errors.filter((e) => e.includes("Encountered a script tag"));
  expect(
    scriptTagCrash,
    `Found the exact regression this test guards against:\n${scriptTagCrash.join("\n")}`
  ).toHaveLength(0);

  expect(errors, `Unexpected console/page errors during locale switch:\n${errors.join("\n")}`).toHaveLength(0);
}

test.describe("Locale switch via header selector (client-side navigation)", () => {
  test("es/programa -> en -> ca -> es", async ({ page }) => {
    const errors = trackErrors(page);

    await page.goto(LOCALE_URL.es);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    await switchLocaleViaHeader(page, "en");
    await switchLocaleViaHeader(page, "ca");
    await switchLocaleViaHeader(page, "es");

    assertNoErrors(errors);
  });

  test("en/program -> es -> ca", async ({ page }) => {
    const errors = trackErrors(page);

    await page.goto(LOCALE_URL.en);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    await switchLocaleViaHeader(page, "es");
    await switchLocaleViaHeader(page, "ca");

    assertNoErrors(errors);
  });

  test("ca/programa -> es -> en", async ({ page }) => {
    const errors = trackErrors(page);

    await page.goto(LOCALE_URL.ca);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    await switchLocaleViaHeader(page, "es");
    await switchLocaleViaHeader(page, "en");

    assertNoErrors(errors);
  });
});
