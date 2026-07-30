/**
 * Production form smoke-test — Playwright headless
 * Run: node scripts/test-forms-prod.mjs
 *
 * Uses native React input setter to trigger onChange, then dispatches
 * a submit event so React's onSubmit + event.preventDefault() fires
 * instead of the browser doing a native GET.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "fs";
import path from "path";
import os from "os";

const SITE = process.env.PROD_BASE_URL ?? "https://yutopias.com";
const BASE = `${SITE}/es`;
const SHOTS = path.join(os.tmpdir(), "form-tests");
mkdirSync(SHOTS, { recursive: true });

const results = [];
let browser;

const shot = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, `${name}.png`) });

const log = (form, status, detail = "") => {
  const icon = status === "PASS" ? "✅" : status === "SKIP" ? "⏭️" : "❌";
  console.log(`${icon} ${form}${detail ? "\n   " + detail : ""}`);
  results.push({ form, status, detail });
};

const isVisible = (loc) => loc.isVisible().catch(() => false);

/**
 * Set a value on a React-controlled input/select without bypassing onChange.
 * Uses the native property setter so React's synthetic event fires.
 */
const reactSet = async (page, selector, value) => {
  await page.evaluate(
    ({ sel, val }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const nativeSetter =
        el.tagName === "SELECT"
          ? Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set
          : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set ||
            Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
      if (nativeSetter) nativeSetter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    { sel: selector, val: value }
  );
};

/**
 * Submit a form via React's onSubmit (not native GET).
 * Dispatches a cancelable submit event — React calls preventDefault().
 */
const reactSubmit = async (page, formSelector) => {
  await page.evaluate((sel) => {
    const form = document.querySelector(sel);
    if (!form) return;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  }, formSelector);
};

/**
 * Collect API responses while running submitFn.
 */
const collectApiResponse = async (page, submitFn) => {
  let captured = null;
  const handler = async (response) => {
    const url = response.url();
    if (url.includes("/api/") && url.endsWith(".php")) captured = response;
  };
  page.on("response", handler);
  await submitFn();
  await page.waitForTimeout(4000);
  page.off("response", handler);
  return captured;
};

// ─── 1. BootcampLead (/programa) ─────────────────────────────────────────────
async function testBootcampLead(page) {
  await page.goto(`${BASE}/programa/`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#bootcamp-name").scrollIntoViewIfNeeded();
  await shot(page, "01a-bootcamp");

  await reactSet(page, "#bootcamp-name", "Test Playwright");
  await reactSet(page, "#bootcamp-email", "test-playwright@yutopias-test.com");
  await reactSet(page, "#bootcamp-role", "CTO");
  await reactSet(page, "#bootcamp-company", "Empresa Test S.L.");

  const res = await collectApiResponse(page, () =>
    reactSubmit(page, "form:has(#bootcamp-name)")
  );
  await shot(page, "01b-bootcamp-result");

  const s = res?.status();
  const b = (await res?.text().catch(() => ""))?.slice(0, 200);
  log("BootcampLead (/programa)", s === 200 ? "PASS" : "FAIL", `HTTP ${s} — ${b}`);
}

// ─── 2. ReservaPlaza (/reserva-plaza) ────────────────────────────────────────
async function testReservaPlaza(page) {
  await page.goto(`${BASE}/reserva-plaza/`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#rp-name").scrollIntoViewIfNeeded();
  await shot(page, "02a-reserva");

  await reactSet(page, "#rp-name", "Test Playwright");
  await reactSet(page, "#rp-company", "Empresa Test S.L.");
  await reactSet(page, "#rp-email", "test-playwright@yutopias-test.com");

  // Check all checkboxes in the form
  await page.evaluate(() => {
    document.querySelectorAll('form input[type="checkbox"]').forEach(cb => {
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });

  const res = await collectApiResponse(page, () =>
    reactSubmit(page, "form:has(#rp-name)")
  );
  await shot(page, "02b-reserva-result");

  const s = res?.status();
  const b = (await res?.text().catch(() => ""))?.slice(0, 200);
  log("ReservaPlaza (/reserva-plaza)", s === 200 ? "PASS" : "FAIL", `HTTP ${s} — ${b}`);
}

// ─── 3. OpenlabContact (home) ─────────────────────────────────────────────────
async function testOpenlabContact(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 20000 });
  await page.locator("#ol-name").scrollIntoViewIfNeeded();
  await shot(page, "03a-openlab");

  await reactSet(page, "#ol-name", "Test Playwright");
  await reactSet(page, "#ol-email", "test-playwright@yutopias-test.com");
  await reactSet(page, "#ol-org", "Empresa Test S.L.");
  await reactSet(page, "#ol-priority", "urgente");
  await reactSet(page, "#ol-message", "Mensaje de prueba automática Playwright. Por favor ignorar.");

  await page.evaluate(() => {
    document.querySelectorAll('#ol-name')
      .item(0)
      ?.closest("form")
      ?.querySelectorAll('input[type="checkbox"]')
      .forEach(cb => {
        if (!cb.checked) {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
  });

  const res = await collectApiResponse(page, () =>
    reactSubmit(page, "form:has(#ol-name)")
  );
  await shot(page, "03b-openlab-result");

  const s = res?.status();
  const b = (await res?.text().catch(() => ""))?.slice(0, 200);
  log("OpenlabContact (home)", s === 200 ? "PASS" : "FAIL", `HTTP ${s} — ${b}`);
}

// ─── 4. Diagnostic StepPrelead (/autodiagnostico) ────────────────────────────
async function testDiagnosticPrelead(page) {
  await page.goto(`${BASE}/autodiagnostico/`, { waitUntil: "networkidle", timeout: 20000 });

  // Click through quiz steps until the prelead form appears
  for (let i = 0; i < 40; i++) {
    if (await isVisible(page.locator("#dl-name"))) break;
    const btn = page.locator('button:not([type="submit"]):visible').first();
    if (!(await isVisible(btn))) break;
    await btn.click();
    await page.waitForTimeout(300);
  }

  if (!(await isVisible(page.locator("#dl-name")))) {
    log("Diagnostic StepPrelead", "SKIP", "#dl-name not reached after clicking quiz");
    return;
  }

  await page.locator("#dl-name").scrollIntoViewIfNeeded();
  await shot(page, "04a-diagnostic");

  await reactSet(page, "#dl-name", "Test Playwright");
  await reactSet(page, "#dl-company", "Empresa Test S.L.");
  await reactSet(page, "#dl-email", "test-playwright@yutopias-test.com");

  await page.evaluate(() => {
    document.querySelectorAll('#dl-name')
      .item(0)
      ?.closest("form")
      ?.querySelectorAll('input[type="checkbox"]')
      .forEach(cb => {
        if (!cb.checked) {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
  });

  const res = await collectApiResponse(page, () =>
    reactSubmit(page, "form:has(#dl-name)")
  );
  await shot(page, "04b-diagnostic-result");

  const s = res?.status();
  const b = (await res?.text().catch(() => ""))?.slice(0, 200);
  log("Diagnostic StepPrelead", s === 200 ? "PASS" : "FAIL", `HTTP ${s} — ${b}`);
}

// ─── 5. Newsletter (footer, home) ────────────────────────────────────────────
async function testNewsletter(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 20000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  const nameInput = page.locator('input[placeholder="Tu nombre"]').last();
  const emailInput = page.locator('input[placeholder="Tu e-mail"]').last();

  if (!(await isVisible(nameInput))) {
    log("Newsletter (footer)", "SKIP", "newsletter inputs not visible");
    return;
  }

  await nameInput.scrollIntoViewIfNeeded();
  await shot(page, "05a-newsletter");

  // Get the actual selector for last newsletter inputs
  const nameInputSel = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[placeholder="Tu nombre"]');
    const last = inputs[inputs.length - 1];
    if (!last) return null;
    if (last.id) return `#${last.id}`;
    const form = last.closest("form");
    if (form) {
      const idx = Array.from(document.querySelectorAll("form")).indexOf(form);
      return `form:nth-of-type(${idx + 1}) input[placeholder="Tu nombre"]`;
    }
    return null;
  });

  const emailInputSel = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[placeholder="Tu e-mail"]');
    const last = inputs[inputs.length - 1];
    if (!last) return null;
    if (last.id) return `#${last.id}`;
    const form = last.closest("form");
    if (form) {
      const idx = Array.from(document.querySelectorAll("form")).indexOf(form);
      return `form:nth-of-type(${idx + 1}) input[placeholder="Tu e-mail"]`;
    }
    return null;
  });

  if (nameInputSel) await reactSet(page, nameInputSel, "Test Playwright");
  if (emailInputSel) await reactSet(page, emailInputSel, "test-playwright@yutopias-test.com");

  // Check the newsletter form's checkboxes
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[placeholder="Tu nombre"]');
    const last = inputs[inputs.length - 1];
    const form = last?.closest("form");
    form?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });

  await shot(page, "05b-newsletter-filled");

  const newsletterFormSel = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[placeholder="Tu nombre"]');
    const last = inputs[inputs.length - 1];
    const form = last?.closest("form");
    if (!form) return null;
    const idx = Array.from(document.querySelectorAll("form")).indexOf(form);
    return `form:nth-of-type(${idx + 1})`;
  });

  const res = await collectApiResponse(page, () =>
    newsletterFormSel
      ? reactSubmit(page, newsletterFormSel)
      : Promise.resolve()
  );
  await shot(page, "05c-newsletter-result");

  const s = res?.status();
  const b = (await res?.text().catch(() => ""))?.slice(0, 200);
  log("Newsletter (footer)", s === 200 ? "PASS" : "FAIL", `HTTP ${s} — ${b}`);
}

// ─── 6. EbookLead (/resources/*) ─────────────────────────────────────────────
async function testEbookLead(page) {
  await page.goto(`${BASE}/resources/`, { waitUntil: "networkidle", timeout: 20000 });

  const link = page.locator('a[href*="/resources/"][href!="/es/resources/"]').first();
  if (!(await isVisible(link))) {
    log("EbookLead", "SKIP", "no resource links found");
    return;
  }
  const href = await link.getAttribute("href");
  const url = href?.startsWith("http") ? href : `${SITE}${href}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });

  const textInputs = page.locator('form input[type="text"]');
  const emailInput = page.locator('form input[type="email"]').first();

  if (!(await isVisible(textInputs.first()))) {
    log("EbookLead", "SKIP", "ebook form not visible");
    return;
  }

  await textInputs.first().scrollIntoViewIfNeeded();
  await shot(page, "06a-ebook");

  // Get selectors for each text input
  const inputSelectors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form input[type="text"]')).map((el, i) => {
      if (el.id) return `#${el.id}`;
      return `form input[type="text"]:nth-of-type(${i + 1})`;
    });
  });

  const vals = ["Test Playwright", "Empresa Test S.L.", "cargo"];
  for (let i = 0; i < Math.min(inputSelectors.length, vals.length); i++) {
    await reactSet(page, inputSelectors[i], vals[i]);
  }

  const emailSel = await page.evaluate(() => {
    const el = document.querySelector('form input[type="email"]');
    return el?.id ? `#${el.id}` : 'form input[type="email"]';
  });
  await reactSet(page, emailSel, "test-playwright@yutopias-test.com");

  await page.evaluate(() => {
    document.querySelectorAll('form input[type="checkbox"]').forEach(cb => {
      if (!cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });

  const res = await collectApiResponse(page, () =>
    reactSubmit(page, "form:has(input[type='email'])")
  );
  await shot(page, "06b-ebook-result");

  const s = res?.status();
  const b = (await res?.text().catch(() => ""))?.slice(0, 200);
  log("EbookLead (/resources/*)", s === 200 ? "PASS" : "FAIL", `HTTP ${s} — ${b}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--ignore-certificate-errors"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "es-ES",
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.dismiss().catch(() => {}));

  console.log(`\nTesting forms on ${BASE}\nScreenshots → ${SHOTS}\n${"─".repeat(60)}`);

  await testBootcampLead(page);
  await testReservaPlaza(page);
  await testOpenlabContact(page);
  await testDiagnosticPrelead(page);
  await testNewsletter(page);
  await testEbookLead(page);

  await browser.close();
} catch (e) {
  console.error("Fatal:", e.message);
  await browser?.close();
  process.exit(1);
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
results.forEach((r) => {
  const icon = r.status === "PASS" ? "✅" : r.status === "SKIP" ? "⏭️" : "❌";
  console.log(`  ${icon} ${r.form}`);
  if (r.detail) console.log(`     ${r.detail}`);
});
const p = results.filter((r) => r.status === "PASS").length;
const f = results.filter((r) => r.status === "FAIL").length;
const s = results.filter((r) => r.status === "SKIP").length;
console.log(`\n  PASS ${p}  FAIL ${f}  SKIP ${s}`);
console.log(`\nScreenshots → ${SHOTS}`);
