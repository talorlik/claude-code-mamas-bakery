import { test, expect } from "@playwright/test"

import { customerCredentials, loginAsCustomer } from "./helpers/auth"

/**
 * Customer order flow.
 *
 * Ordering now requires an account: a signed-out visitor can browse and build a
 * cart but is prompted to sign in at checkout. The full place-order path needs
 * a confirmed customer account, supplied via E2E_CUSTOMER_EMAIL /
 * E2E_CUSTOMER_PASSWORD; that test skips when they are unset. Both assume the
 * seeded sample products exist (supabase/migrations/0002_bakery_seed.sql).
 */

test("signed-out checkout is gated behind sign-in", async ({ page }) => {
  await page.goto("/en/menu")
  await expect(page.getByRole("heading", { name: /our menu/i })).toBeVisible()
  // The My Orders link is hidden until the visitor signs in.
  await expect(page.getByRole("link", { name: /my orders/i })).toHaveCount(0)

  const addButtons = page.getByRole("button", { name: /add to cart/i })
  await expect(addButtons.first()).toBeVisible()
  await addButtons.nth(0).click()

  await page.goto("/en/cart")
  // The order form is replaced by a sign-in CTA for signed-out visitors.
  const signIn = page.getByRole("link", { name: /sign in to order/i })
  await expect(signIn).toBeVisible()
  await signIn.click()
  await expect(page).toHaveURL(/\/en\/login/, { timeout: 15_000 })
})

test.describe("authenticated order", () => {
  test.skip(
    !customerCredentials.email || !customerCredentials.password,
    "set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD to run the order flow"
  )

  test("customer can place a pickup order and see it in their history", async ({
    page,
  }) => {
    await loginAsCustomer(page)

    // Build a cart.
    await page.goto("/en/menu")
    const addButtons = page.getByRole("button", { name: /add to cart/i })
    await expect(addButtons.first()).toBeVisible()
    await addButtons.nth(0).click()
    await addButtons.nth(1).click()

    // Checkout: name/phone prefill from the profile; email is read-only. The
    // pickup date defaults to the next allowed day, so no date entry is needed.
    await page.goto("/en/cart")
    await expect(page.getByText(/your cart/i)).toBeVisible()

    const fullName = page.getByLabel(/full name/i)
    await fullName.fill("E2E Customer")
    await page.getByLabel(/phone/i).fill("0501234567")

    await page.getByRole("button", { name: /place order/i }).click()
    await expect(page.getByText(/order placed/i)).toBeVisible({
      timeout: 15_000,
    })

    const successText = await page
      .getByText(/your order number is/i)
      .innerText()
    const orderNumber = successText.match(/MB-\d{8}-[A-Z0-9]{4}/)?.[0]
    expect(orderNumber, "order number in confirmation").toBeTruthy()

    // The order shows up in the customer's own order history.
    await page.goto("/en/profile")
    await expect(page.getByText(orderNumber!)).toBeVisible({ timeout: 15_000 })

    // The order also appears on the dedicated My Orders page.
    await page.goto("/en/orders")
    await expect(page.getByText(orderNumber!)).toBeVisible({ timeout: 15_000 })
  })
})

test("signed-out visit to /orders redirects to login", async ({ page }) => {
  await page.goto("/en/orders")
  await expect(page).toHaveURL(/\/en\/login/, { timeout: 15_000 })
})
