import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"

import { ProductCard } from "@/components/menu/product-card"
import { CartProvider, useCart } from "@/components/cart/cart-provider"
import type { Product } from "@/lib/products/product-types"
import enMessages from "@/messages/en.json"

// sonner's toast renders into a portal and is irrelevant to these assertions.
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

const product: Product = {
  id: "p1",
  name: "Classic Challah",
  description: "Soft and sweet",
  price: 18,
  category: "challah",
  image_url: null,
  is_available: true,
  stock_quantity: 100,
  low_stock_threshold: 0,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

function renderCard() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <CartProvider>
        <ProductCard product={product} locale="en" />
        <CartCount />
      </CartProvider>
    </NextIntlClientProvider>
  )
}

// Exposes the live cart count so the test can assert add-to-cart worked.
function CartCount() {
  const { count } = useCart()
  return <div data-testid="count">{count}</div>
}

describe("ProductCard", () => {
  it("renders the product name, category, and price", () => {
    renderCard()
    expect(screen.getByText("Classic Challah")).toBeInTheDocument()
    expect(screen.getByText("Challah")).toBeInTheDocument()
    expect(screen.getByText("₪18.00")).toBeInTheDocument()
  })

  it("adds the product to the cart when the button is clicked", async () => {
    const user = userEvent.setup()
    renderCard()
    expect(screen.getByTestId("count")).toHaveTextContent("0")
    await user.click(screen.getByRole("button", { name: /add to cart/i }))
    expect(screen.getByTestId("count")).toHaveTextContent("1")
  })

  it("renders the product name in the display serif", () => {
    renderCard()
    const name = screen.getByText("Classic Challah")
    expect(name.className).toContain("font-display")
  })

  it("uses a borderless card (no border utility on the root)", () => {
    const { container } = renderCard()
    const root = container.firstElementChild as HTMLElement
    expect(root.className).not.toContain("border")
    expect(root.className).not.toContain("shadow")
  })
})
