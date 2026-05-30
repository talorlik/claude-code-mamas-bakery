import { describe, expect, it, vi, beforeEach } from "vitest"

/**
 * Integration test for admin product mutations, focused on authorization and
 * validation. requireAdmin and the Supabase client are faked so we can assert
 * that a non-admin caller is rejected before any write, and that a valid admin
 * create reaches the database.
 */

const requireAdmin = vi.fn()
let inserted: Record<string, unknown> | null = null

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdmin(),
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            inserted = row
            return { data: { id: "new", ...row }, error: null }
          },
        }),
      }),
    }),
  }),
}))

import { createProduct } from "@/lib/products/product-actions"

const validInput = {
  name: "Olive Bread",
  description: "Savory",
  price: "24",
  category: "other",
  imageUrl: "",
  isAvailable: true,
}

beforeEach(() => {
  requireAdmin.mockReset()
  inserted = null
})

describe("createProduct authorization", () => {
  it("does not write when requireAdmin rejects (non-admin)", async () => {
    // requireAdmin redirects non-admins; simulate by throwing.
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(createProduct(validInput)).rejects.toThrow()
    expect(inserted).toBeNull()
  })

  it("creates a product for an admin with valid input", async () => {
    requireAdmin.mockResolvedValue("admin-id")
    const result = await createProduct(validInput)
    expect(result.ok).toBe(true)
    expect(inserted).toMatchObject({
      name: "Olive Bread",
      price: 24,
      category: "other",
      image_url: null,
    })
  })

  it("rejects invalid input even for an admin", async () => {
    requireAdmin.mockResolvedValue("admin-id")
    const result = await createProduct({ ...validInput, price: "-5" })
    expect(result.ok).toBe(false)
    expect(inserted).toBeNull()
  })
})
