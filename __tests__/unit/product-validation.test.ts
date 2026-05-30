import { describe, expect, it } from "vitest"
import { validateProduct } from "@/lib/products/product-validation"
import type { ProductInput } from "@/lib/products/product-types"

function validInput(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    name: "Classic Challah",
    description: "Soft and sweet",
    price: "18.00",
    category: "challah",
    imageUrl: "",
    isAvailable: true,
    ...overrides,
  }
}

describe("validateProduct", () => {
  it("passes a valid input and parses the price to a number", () => {
    const result = validateProduct(validInput())
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.price).toBe(18)
  })

  it("requires a name of at least 2 chars", () => {
    const result = validateProduct(validInput({ name: "A" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.name).toBeTruthy()
  })

  it("rejects a name over 120 chars", () => {
    const result = validateProduct(validInput({ name: "x".repeat(121) }))
    expect(result.ok).toBe(false)
  })

  it("rejects a negative price", () => {
    const result = validateProduct(validInput({ price: "-1" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.price).toBeTruthy()
  })

  it("rejects a non-numeric price", () => {
    const result = validateProduct(validInput({ price: "abc" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.price).toBeTruthy()
  })

  it("rejects an unsupported category", () => {
    const result = validateProduct(validInput({ category: "bread" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.category).toBeTruthy()
  })

  it("rejects an invalid image URL when provided", () => {
    const result = validateProduct(validInput({ imageUrl: "not a url" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.imageUrl).toBeTruthy()
  })

  it("allows an empty image URL", () => {
    const result = validateProduct(validInput({ imageUrl: "" }))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.image_url).toBeNull()
  })
})
