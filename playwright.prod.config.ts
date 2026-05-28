import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/diagnostic-prod.spec.ts",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [["html", { open: "never" }], ["line"]],
  timeout: 120000,
  use: {
    baseURL: "https://yutopias.com",
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
