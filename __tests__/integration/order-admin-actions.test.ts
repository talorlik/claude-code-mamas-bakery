import { describe, expect, it, vi, beforeEach } from "vitest"

/**
 * Integration test for admin order updates, focused on authorization and
 * status validation. requireAdmin and the Supabase client are faked.
 */

const requireAdmin = vi.fn()
let updated: Record<string, unknown> | null = null

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: () => requireAdmin(),
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      update: (row: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            single: async () => {
              updated = row
              return { data: { id: "o1", ...row }, error: null }
            },
          }),
        }),
      }),
    }),
  }),
}))

import {
  updateOrderStatus,
  setOrderPaid,
} from "@/lib/orders/order-admin-actions"

beforeEach(() => {
  requireAdmin.mockReset()
  updated = null
})

describe("admin order updates", () => {
  it("rejects status update when requireAdmin rejects (non-admin)", async () => {
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(updateOrderStatus("o1", "Completed")).rejects.toThrow()
    expect(updated).toBeNull()
  })

  it("updates status for an admin", async () => {
    requireAdmin.mockResolvedValue("admin-id")
    const result = await updateOrderStatus("o1", "Ready for Pickup")
    expect(result.ok).toBe(true)
    expect(updated).toEqual({ status: "Ready for Pickup" })
  })

  it("rejects an invalid status", async () => {
    requireAdmin.mockResolvedValue("admin-id")
    // @ts-expect-error testing runtime guard with a bad value
    const result = await updateOrderStatus("o1", "Bogus")
    expect(result.ok).toBe(false)
    expect(updated).toBeNull()
  })

  it("rejects paid update when requireAdmin rejects", async () => {
    requireAdmin.mockRejectedValue(new Error("redirect"))
    await expect(setOrderPaid("o1", true)).rejects.toThrow()
    expect(updated).toBeNull()
  })

  it("marks an order paid for an admin", async () => {
    requireAdmin.mockResolvedValue("admin-id")
    const result = await setOrderPaid("o1", true)
    expect(result.ok).toBe(true)
    expect(updated).toEqual({ is_paid: true })
  })
})
