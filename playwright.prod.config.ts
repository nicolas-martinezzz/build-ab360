import { defineConfig, devices } from "@playwright/test";

// Target site for the production suite. Override with PROD_BASE_URL to run the
// same tests against staging or a preview deployment.
const PROD_BASE_URL = process.env.PROD_BASE_URL ?? "https://yutopias.com";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/diagnostic-prod.spec.ts",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [["html", { open: "never" }], ["line"]],
  timeout: 120000,
  use: {
    baseURL: PROD_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "on",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
