import { test, expect } from "@playwright/test"

import { adminCredentials, loginAsAdmin } from "./helpers/auth"

/**
 * Admin order-management flow: sign in as admin, open the orders list, open an
 * order's details, change its status, and mark it paid.
 *
 * Requires E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD for an account that has been
 * granted the admin role (see docs/ADMIN_SETUP.md). The test skips when these
 * are not provided, so the suite still runs locally without admin secrets.
 * It also assumes at least one order exists (run the customer flow first, or
 * seed one).
 */
test.describe("admin access control", () => {
  test("non-admin is redirected away from admin", async ({ page }) => {
    // Without a session, /admin must redirect to login.
    await page.goto("/en/admin/orders")
    await expect(page).toHaveURL(/\/en\/login/, { timeout: 15_000 })
  })
})

test.describe("admin order management", () => {
  test.skip(
    !adminCredentials.email || !adminCredentials.password,
    "set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin flow"
  )

  test("admin can update an order's status and payment", async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto("/en/admin/orders")
    await expect(
      page.getByRole("heading", { name: /order management/i })
    ).toBeVisible()

    // Open the first order's details.
    const detailsButton = page.getByRole("button", { name: /details/i }).first()
    await expect(detailsButton).toBeVisible({ timeout: 15_000 })
    await detailsButton.click()

    // Change status to "Ready for Pickup".
    await page
      .getByLabel(/update status/i)
      .selectOption({ label: "Ready for Pickup" })

    // Mark the order paid (button label toggles to "Mark unpaid" after).
    const payButton = page.getByRole("button", { name: /mark paid/i })
    if (await payButton.isVisible()) {
      await payButton.click()
      await expect(
        page.getByRole("button", { name: /mark unpaid/i })
      ).toBeVisible({ timeout: 10_000 })
    }
  })
})
