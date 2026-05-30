import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright configuration for the bakery E2E suite.
 *
 * Starts the app via `webServer` (reusing an already-running dev server if one
 * is up) and drives it through a Chromium browser. Tests run against the
 * English locale (`/en/...`) for clearer assertions. The base URL and admin
 * credentials can be overridden via environment variables.
 */
const PORT = Number(process.env.E2E_PORT ?? 3000)
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "dot" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    locale: "en-US",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
