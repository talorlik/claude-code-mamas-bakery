import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { SignatureCollection } from "@/components/home/signature-collection"
import { CartProvider } from "@/components/cart/cart-provider"
import type { Product } from "@/lib/products/product-types"
import enMessages from "@/messages/en.json"

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

// next-intl's navigation primitives depend on next/navigation which doesn't
// resolve cleanly under jsdom. Stub locale-aware Link so tests render without
// a Next.js runtime (same pattern as site-footer.test.tsx).
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => <a href={href} className={className}>{children}</a>,
}))

const products: Product[] = [
  {
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
  },
]

function renderSection(items: Product[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <CartProvider>
        <SignatureCollection products={items} locale="en" />
      </CartProvider>
    </NextIntlClientProvider>
  )
}

describe("SignatureCollection", () => {
  it("renders the heading and the given products", () => {
    renderSection(products)
    expect(screen.getByText("This week from the oven")).toBeInTheDocument()
    expect(screen.getByText("Classic Challah")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /view full menu/i })).toBeInTheDocument()
  })

  it("renders the heading and link but no products when empty", () => {
    renderSection([])
    expect(screen.getByText("This week from the oven")).toBeInTheDocument()
    expect(screen.queryByText("Classic Challah")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /view full menu/i })).toBeInTheDocument()
  })
})
