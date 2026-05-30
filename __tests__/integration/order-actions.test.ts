import { describe, expect, it, vi, beforeEach } from "vitest"

/**
 * Integration test for the createOrder server action.
 *
 * Supabase clients are faked so the test exercises the action's real logic -
 * server-side pricing, availability rejection, snapshots, total calculation,
 * and the order/order_items inserts - without a live database.
 */

// --- Fake admin client -------------------------------------------------------

type Product = {
  id: string
  name: string
  price: number
  is_available: boolean
}

let products: Product[] = []
let insertedOrder: Record<string, unknown> | null = null
let insertedItems: Record<string, unknown>[] | null = null

// The products query awaits `.in(...)` directly, so it returns a Promise.
function makeAdminClient() {
  return {
    from(table: string) {
      if (table === "products") {
        return {
          select: () => ({
            in: (_col: string, ids: string[]) =>
              Promise.resolve({
                data: products.filter((p) => ids.includes(p.id)),
                error: null,
              }),
          }),
        }
      }
      if (table === "orders") {
        return {
          insert: (row: Record<string, unknown>) => ({
            select: () => ({
              single: async () => {
                insertedOrder = row
                return { data: { id: "order-1" }, error: null }
              },
            }),
          }),
          delete: () => ({ eq: async () => ({ error: null }) }),
        }
      }
      if (table === "order_items") {
        return {
          insert: async (rows: Record<string, unknown>[]) => {
            insertedItems = rows
            return { error: null }
          },
        }
      }
      throw new Error(`unexpected table ${table}`)
    },
  }
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
  createAdminClient: async () => makeAdminClient(),
}))

import { createOrder } from "@/lib/orders/order-actions"

const customer = {
  fullName: "Dana Levi",
  phone: "050-123-4567",
  email: "dana@example.com",
  pickupDate: "2999-12-31",
  notes: "",
}

beforeEach(() => {
  products = [
    { id: "a", name: "Challah", price: 18, is_available: true },
    { id: "b", name: "Babka", price: 45, is_available: true },
    { id: "c", name: "Tart", price: 55, is_available: false },
  ]
  insertedOrder = null
  insertedItems = null
})

describe("createOrder", () => {
  it("creates an order with server-side totals and snapshots", async () => {
    const result = await createOrder(customer, [
      { productId: "a", quantity: 2 },
      { productId: "b", quantity: 1 },
    ])

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.orderNumber).toMatch(/^MB-\d{8}-/)

    // 18*2 + 45*1 = 81, computed server-side.
    expect(insertedOrder?.total_amount).toBe(81)
    expect(insertedItems).toHaveLength(2)
    const challah = insertedItems?.find((i) => i.product_id === "a")
    expect(challah).toMatchObject({
      product_name: "Challah",
      unit_price: 18,
      quantity: 2,
      line_total: 36,
    })
  })

  it("ignores client-sent prices and uses the database price", async () => {
    // The action takes only id + quantity; prices come from the DB regardless.
    const result = await createOrder(customer, [
      { productId: "a", quantity: 1 },
    ])
    expect(result.ok).toBe(true)
    expect(insertedOrder?.total_amount).toBe(18)
  })

  it("rejects an unavailable product", async () => {
    const result = await createOrder(customer, [
      { productId: "c", quantity: 1 },
    ])
    expect(result.ok).toBe(false)
    expect(insertedOrder).toBeNull()
  })

  it("rejects an empty cart", async () => {
    const result = await createOrder(customer, [])
    expect(result.ok).toBe(false)
  })

  it("rejects an invalid quantity", async () => {
    const result = await createOrder(customer, [
      { productId: "a", quantity: 0 },
    ])
    expect(result.ok).toBe(false)
  })

  it("rejects invalid customer details", async () => {
    const result = await createOrder({ ...customer, email: "nope" }, [
      { productId: "a", quantity: 1 },
    ])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.email).toBeTruthy()
  })
})
