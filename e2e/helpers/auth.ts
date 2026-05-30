import { type Page, expect } from "@playwright/test"

/**
 * Admin credentials for the admin-flow E2E test, read from the environment so
 * no secret is committed. When unset, the admin test should skip.
 */
export const adminCredentials = {
  email: process.env.E2E_ADMIN_EMAIL,
  password: process.env.E2E_ADMIN_PASSWORD,
}

/**
 * Logs in through the sign-in form and waits for the post-login redirect.
 * Admins land on /admin; the helper navigates to a known admin page after.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const { email, password } = adminCredentials
  if (!email || !password) {
    throw new Error("E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are required")
  }

  await page.goto("/en/login")
  await page.getByRole("tab", { name: /sign in/i }).click()
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole("button", { name: /^sign in$/i }).click()

  // Post-login, admins are routed to /admin.
  await expect(page).toHaveURL(/\/en\/admin/, { timeout: 15_000 })
}
