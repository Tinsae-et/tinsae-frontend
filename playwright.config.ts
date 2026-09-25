import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests for the critical user journeys.
 *
 * They run against an already running app and backend — the same way a
 * deployed environment is checked — so start both first:
 *
 *   E2E_BASE_URL=http://localhost:3000 npm run test:e2e
 *
 * The merchant journeys need an account on that backend and are skipped
 * unless E2E_USER and E2E_PASSWORD are set. Point them at a seeded test
 * backend, never production: they sign in and change dashboard state.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Most buyers are on phones: every journey also runs at phone size.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
