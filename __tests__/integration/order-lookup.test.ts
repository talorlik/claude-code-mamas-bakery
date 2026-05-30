import { describe, expect, it, vi, beforeEach } from "vitest"

/**
 * Integration test for the lookupOrders action. The admin client is faked to
 * record which column/operator the query used and to return canned rows, so
 * the test verifies email-vs-phone routing, item mapping, and that invalid
 * input never reaches the database.
 */

let lastFilter: { op: string; col: string; value: string } | null = null
let rows: Record<string, unknown>[] = []

function makeQuery() {
  const query = {
    select: () => query,
    order: () => query,
    ilike: (col: string, value: string) => {
      lastFilter = { op: "ilike", col, value }
      return query
    },
    eq: (col: string, value: string) => {
      lastFilter = { op: "eq", col, value }
      return query
    },
    then: (resolve: (r: { data: unknown; error: null }) => void) =>
      resolve({ data: rows, error: null }),
  }
  return query
}

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: async () => ({ from: () => makeQuery() }),
}))

import { lookupOrders } from "@/lib/orders/order-lookup"

beforeEach(() => {
  lastFilter = null
  rows = []
})

describe("lookupOrders", () => {
  it("queries by lowercased email with ilike", async () => {
    rows = [
      {
        id: "o1",
        order_number: "MB-1",
        order_items: [{ id: "i1", product_name: "Challah" }],
      },
    ]
    const result = await lookupOrders("Dana@Example.com")
    expect(result.ok).toBe(true)
    expect(lastFilter).toEqual({
      op: "ilike",
      col: "customer_email",
      value: "dana@example.com",
    })
    if (result.ok) {
      expect(result.data[0].items).toHaveLength(1)
    }
  })

  it("queries by normalized phone with eq", async () => {
    await lookupOrders("050-123-4567")
    expect(lastFilter).toEqual({
      op: "eq",
      col: "customer_phone",
      value: "0501234567",
    })
  })

  it("returns an empty list when nothing matches", async () => {
    rows = []
    const result = await lookupOrders("nobody@example.com")
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual([])
  })

  it("rejects invalid input without querying", async () => {
    const result = await lookupOrders("   ")
    expect(result.ok).toBe(false)
    expect(lastFilter).toBeNull()
  })
})
