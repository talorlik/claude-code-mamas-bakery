import { describe, expect, it } from "vitest"
import { searchProducts } from "@/lib/products/product-filters"
import type { Product } from "@/lib/products/product-types"

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Classic Challah",
    description: "Soft and sweet braided loaf",
    price: 18,
    category: "challah",
    image_url: null,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as Product
}

describe("searchProducts", () => {
  const items = [
    product({ id: "1", name: "Classic Challah", description: "Braided loaf" }),
    product({ id: "2", name: "Chocolate Cake", description: "Rich and moist" }),
    product({ id: "3", name: "Rugelach", description: "Cinnamon sweets" }),
  ]

  it("returns all products for an empty query", () => {
    expect(searchProducts(items, "")).toHaveLength(3)
    expect(searchProducts(items, "   ")).toHaveLength(3)
  })

  it("matches on the product name, case-insensitively", () => {
    const result = searchProducts(items, "chocolate")
    expect(result.map((p) => p.id)).toEqual(["2"])
  })

  it("matches on the description", () => {
    const result = searchProducts(items, "cinnamon")
    expect(result.map((p) => p.id)).toEqual(["3"])
  })

  it("matches a substring spanning neither field fully", () => {
    const result = searchProducts(items, "loaf")
    expect(result.map((p) => p.id)).toEqual(["1"])
  })

  it("returns an empty list when nothing matches", () => {
    expect(searchProducts(items, "zzz")).toEqual([])
  })
})
