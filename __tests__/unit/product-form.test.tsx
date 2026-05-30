import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"

import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/products/product-types"
import enMessages from "@/messages/en.json"

// The form imports the image server actions, which transitively pull in
// server-only modules (require-admin -> next-intl navigation) that do not load
// under jsdom. This is a UI test; stub the actions so only the form renders.
// vi.mock is hoisted above the imports, so ProductForm picks up the stub.
vi.mock("@/lib/products/product-image-actions", () => ({
  uploadProductImage: vi.fn(),
  removeProductImage: vi.fn(),
}))

const product: Product = {
  id: "p1",
  name: "Classic Challah",
  description: "Soft and sweet",
  price: 18,
  category: "challah",
  image_url: null,
  is_available: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

function renderForm(onSubmit = vi.fn(), withProduct = true) {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ProductForm
        product={withProduct ? product : undefined}
        locale="en"
        onSubmit={onSubmit}
        pending={false}
      />
    </NextIntlClientProvider>
  )
  return onSubmit
}

describe("ProductForm", () => {
  it("pre-fills fields when editing", () => {
    renderForm()
    expect(screen.getByLabelText(/name/i)).toHaveValue("Classic Challah")
    expect(screen.getByLabelText(/price/i)).toHaveValue(18)
  })

  it("submits the entered values", async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn(), false)

    await user.type(screen.getByLabelText(/name/i), "New Cake")
    await user.type(screen.getByLabelText(/price/i), "25")
    await user.click(screen.getByRole("button", { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const arg = onSubmit.mock.calls[0][0]
    expect(arg).toMatchObject({ name: "New Cake", price: "25" })
  })
})
