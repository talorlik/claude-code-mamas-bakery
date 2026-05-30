import { describe, expect, it, vi, beforeEach } from "vitest"

/**
 * Integration test for admin product mutations, focused on authorization and
 * validation. requireAdmin and the Supabase client are faked so we can assert
 * that a non-admin caller is rejected before any write, that valid admin
 * mutations reach the database, and that invalid input is rejected.
 */

const requireAdmin = vi.fn()
let lastOp: {
  table: string
  kind: string
  row?: Record<string, unknown>
} | null = null

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdmin(),
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            lastOp = { table, kind: "insert", row }
            return { data: { id: "new", ...row }, error: null }
          },
        }),
      }),
      update: (row: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            single: async () => {
              lastOp = { table, kind: "update", row }
              return { data: { id: "p1", ...row }, error: null }
            },
          }),
        }),
      }),
      delete: () => ({
        eq: async () => {
          lastOp = { table, kind: "delete" }
          return { error: null }
        },
      }),
    }),
  }),
}))

import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductAvailability,
} from "@/lib/products/product-actions"

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
  lastOp = null
})

describe("product mutations: authorization", () => {
  it("createProduct does not write when requireAdmin rejects", async () => {
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(createProduct(validInput)).rejects.toThrow()
    expect(lastOp).toBeNull()
  })

  it("updateProduct does not write when requireAdmin rejects", async () => {
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(updateProduct("p1", validInput)).rejects.toThrow()
    expect(lastOp).toBeNull()
  })

  it("deleteProduct does not write when requireAdmin rejects", async () => {
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(deleteProduct("p1")).rejects.toThrow()
    expect(lastOp).toBeNull()
  })

  it("setProductAvailability does not write when requireAdmin rejects", async () => {
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(setProductAvailability("p1", false)).rejects.toThrow()
    expect(lastOp).toBeNull()
  })
})

describe("product mutations: admin happy path", () => {
  beforeEach(() => requireAdmin.mockResolvedValue("admin-id"))

  it("creates a product with normalized values", async () => {
    const result = await createProduct(validInput)
    expect(result.ok).toBe(true)
    expect(lastOp).toMatchObject({
      table: "products",
      kind: "insert",
      row: {
        name: "Olive Bread",
        price: 24,
        category: "other",
        image_url: null,
      },
    })
  })

  it("updates a product", async () => {
    const result = await updateProduct("p1", validInput)
    expect(result.ok).toBe(true)
    expect(lastOp?.kind).toBe("update")
  })

  it("deletes a product", async () => {
    const result = await deleteProduct("p1")
    expect(result.ok).toBe(true)
    expect(lastOp).toMatchObject({ table: "products", kind: "delete" })
  })

  it("toggles availability", async () => {
    const result = await setProductAvailability("p1", false)
    expect(result.ok).toBe(true)
    expect(lastOp).toMatchObject({
      kind: "update",
      row: { is_available: false },
    })
  })
})

describe("product mutations: validation", () => {
  beforeEach(() => requireAdmin.mockResolvedValue("admin-id"))

  it("rejects a negative price", async () => {
    const result = await createProduct({ ...validInput, price: "-5" })
    expect(result.ok).toBe(false)
    expect(lastOp).toBeNull()
  })

  it("rejects an unsupported category on update", async () => {
    const result = await updateProduct("p1", {
      ...validInput,
      category: "bread",
    })
    expect(result.ok).toBe(false)
    expect(lastOp).toBeNull()
  })
})
