import { test, expect } from "@playwright/test"

/**
 * Customer order flow: browse the menu, add products to the cart, submit an
 * order, and find it again via the lookup page.
 *
 * The test creates a real order using a unique per-run email so it can find
 * exactly its own order at the lookup step. It assumes the seeded sample
 * products are present (supabase/migrations/0002_bakery_seed.sql).
 */
test("customer can place an order and look it up", async ({ page }) => {
  const stamp = Date.now()
  const email = `e2e+${stamp}@example.com`
  const phone = "0501234567"

  // 1. Open the menu and add the first two available products.
  await page.goto("/en/menu")
  await expect(page.getByRole("heading", { name: /our menu/i })).toBeVisible()

  const addButtons = page.getByRole("button", { name: /add to cart/i })
  await expect(addButtons.first()).toBeVisible()
  await addButtons.nth(0).click()
  await addButtons.nth(1).click()

  // 2. Go to the cart; expect two line items and a place-order form.
  // "Your Cart" is a styled card title (not a heading element), so match text.
  await page.goto("/en/cart")
  await expect(page.getByText(/your cart/i)).toBeVisible()

  // 3. Fill the pickup details. Pickup date must be in the future.
  const future = new Date(stamp + 7 * 24 * 60 * 60 * 1000)
  const pickup = future.toISOString().slice(0, 10)

  await page.getByLabel(/full name/i).fill("E2E Customer")
  await page.getByLabel(/phone/i).fill(phone)
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/pickup date/i).fill(pickup)

  // 4. Submit and capture the order-number confirmation.
  await page.getByRole("button", { name: /place order/i }).click()
  await expect(page.getByText(/order placed/i)).toBeVisible({ timeout: 15_000 })

  const successText = await page.getByText(/your order number is/i).innerText()
  const orderNumber = successText.match(/MB-\d{8}-[A-Z0-9]{4}/)?.[0]
  expect(orderNumber, "order number in confirmation").toBeTruthy()

  // 5. Look the order up by email and confirm it appears.
  await page.goto("/en/orders")
  await page.getByLabel(/phone or email/i).fill(email)
  await page.getByRole("button", { name: /^search$/i }).click()

  await expect(page.getByText(orderNumber!)).toBeVisible({ timeout: 15_000 })
})

test("order lookup with a non-matching email shows no results", async ({
  page,
}) => {
  await page.goto("/en/orders")
  await page
    .getByLabel(/phone or email/i)
    .fill(`nobody+${Date.now()}@example.com`)
  await page.getByRole("button", { name: /^search$/i }).click()
  await expect(page.getByText(/no orders found/i)).toBeVisible({
    timeout: 15_000,
  })
})
