import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

/**
 * Vitest configuration for unit and integration tests.
 *
 * Uses the jsdom environment for component tests and mirrors the `@/*`
 * path alias from tsconfig so imports resolve identically to the app build.
 * E2E specs live under `e2e/` and are owned by Playwright, so they are
 * excluded here.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
})
