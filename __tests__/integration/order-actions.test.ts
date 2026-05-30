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
  stock_quantity: number
}

let products: Product[] = []
let insertedOrder: Record<string, unknown> | null = null
let insertedItems: Record<string, unknown>[] | null = null
let orderInsertAttempts = 0
let orderDeleteCalled = false
let decrementCalls: { product_id: string; quantity: number }[] = []
let incrementCalls: { product_id: string; quantity: number }[] = []

// Per-test controls for the resilience paths.
let orderInsertFailUntilAttempt = 0 // simulate N order_number collisions
let itemInsertFails = false // simulate an order_items insert failure
let soldOutProductId: string | null = null // simulate a concurrent stock-out

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
                orderInsertAttempts += 1
                if (orderInsertAttempts <= orderInsertFailUntilAttempt) {
                  // 23505 = unique_violation on order_number; action retries.
                  return { data: null, error: { code: "23505" } }
                }
                insertedOrder = row
                return { data: { id: "order-1" }, error: null }
              },
            }),
          }),
          delete: () => ({
            eq: async () => {
              orderDeleteCalled = true
              return { error: null }
            },
          }),
        }
      }
      if (table === "order_items") {
        return {
          insert: async (rows: Record<string, unknown>[]) => {
            if (itemInsertFails) return { error: { message: "boom" } }
            insertedItems = rows
            return { error: null }
          },
          delete: () => ({ eq: async () => ({ error: null }) }),
        }
      }
      throw new Error(`unexpected table ${table}`)
    },
    // Stock RPCs: decrement_stock returns false when the product is flagged
    // sold out for the test, mirroring the guarded UPDATE returning no rows.
    rpc(
      fn: string,
      args: { p_product_id: string; p_quantity: number }
    ): Promise<{ data: boolean | null; error: null }> {
      if (fn === "decrement_stock") {
        decrementCalls.push({
          product_id: args.p_product_id,
          quantity: args.p_quantity,
        })
        const ok = args.p_product_id !== soldOutProductId
        return Promise.resolve({ data: ok, error: null })
      }
      if (fn === "increment_stock") {
        incrementCalls.push({
          product_id: args.p_product_id,
          quantity: args.p_quantity,
        })
        return Promise.resolve({ data: null, error: null })
      }
      throw new Error(`unexpected rpc ${fn}`)
    },
  }
}

// A signed-in user is required now that accounts are mandatory to order. The
// authed client also exposes profiles for the post-order address save.
let currentUser: { id: string; email: string } | null = {
  id: "user-1",
  email: "dana@example.com",
}
let profileUpdate: Record<string, unknown> | null = null

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: currentUser } }) },
    from(table: string) {
      if (table === "profiles") {
        return {
          update: (row: Record<string, unknown>) => ({
            eq: async () => {
              profileUpdate = row
              return { error: null }
            },
          }),
        }
      }
      throw new Error(`unexpected authed table ${table}`)
    },
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
  fulfillmentMethod: "pickup" as const,
  carrierId: null,
  address: null,
}

beforeEach(() => {
  products = [
    { id: "a", name: "Challah", price: 18, is_available: true, stock_quantity: 100 },
    { id: "b", name: "Babka", price: 45, is_available: true, stock_quantity: 100 },
    { id: "c", name: "Tart", price: 55, is_available: false, stock_quantity: 100 },
    { id: "d", name: "Roll", price: 5, is_available: true, stock_quantity: 1 },
  ]
  insertedOrder = null
  insertedItems = null
  orderInsertAttempts = 0
  orderDeleteCalled = false
  decrementCalls = []
  incrementCalls = []
  orderInsertFailUntilAttempt = 0
  itemInsertFails = false
  soldOutProductId = null
  currentUser = { id: "user-1", email: "dana@example.com" }
  profileUpdate = null
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

  it("retries the order number on a unique-violation collision", async () => {
    // First two order inserts collide on order_number; the third succeeds.
    orderInsertFailUntilAttempt = 2
    const result = await createOrder(customer, [
      { productId: "a", quantity: 1 },
    ])
    expect(result.ok).toBe(true)
    expect(orderInsertAttempts).toBe(3)
  })

  it("rolls back the order when item insert fails", async () => {
    itemInsertFails = true
    const result = await createOrder(customer, [
      { productId: "a", quantity: 1 },
    ])
    expect(result.ok).toBe(false)
    // The orphaned order must be deleted so no partial order remains.
    expect(orderDeleteCalled).toBe(true)
  })

  it("rejects a line whose quantity exceeds available stock", async () => {
    // Product d has stock 1; ordering 2 is rejected before any insert.
    const result = await createOrder(customer, [
      { productId: "d", quantity: 2 },
    ])
    expect(result.ok).toBe(false)
    expect(insertedOrder).toBeNull()
    expect(decrementCalls).toHaveLength(0)
  })

  it("decrements stock for each line on success", async () => {
    const result = await createOrder(customer, [
      { productId: "a", quantity: 2 },
      { productId: "b", quantity: 1 },
    ])
    expect(result.ok).toBe(true)
    expect(decrementCalls).toEqual([
      { product_id: "a", quantity: 2 },
      { product_id: "b", quantity: 1 },
    ])
  })

  it("adds the carrier flat fee to the total for a delivery order", async () => {
    // citywide-demo flat fee is 15; product a is 18 => total 33.
    const result = await createOrder(
      {
        ...customer,
        fulfillmentMethod: "delivery",
        carrierId: "citywide-demo",
        address: {
          addressLine1: "1 Main St",
          city: "Tel Aviv",
          postalCode: "61000",
        },
      },
      [{ productId: "a", quantity: 1 }]
    )
    expect(result.ok).toBe(true)
    expect(insertedOrder?.fulfillment_method).toBe("delivery")
    expect(insertedOrder?.delivery_fee).toBe(15)
    expect(insertedOrder?.total_amount).toBe(33)
    expect(insertedOrder?.delivery_carrier).toBe("citywide-demo")
  })

  it("rolls back and restores stock when a later line sold out concurrently", async () => {
    // Decrement of "a" succeeds; "b" returns false (sold out between read and
    // write). The order is deleted and the already-decremented "a" is restored.
    soldOutProductId = "b"
    const result = await createOrder(customer, [
      { productId: "a", quantity: 2 },
      { productId: "b", quantity: 1 },
    ])
    expect(result.ok).toBe(false)
    expect(orderDeleteCalled).toBe(true)
    expect(incrementCalls).toEqual([{ product_id: "a", quantity: 2 }])
  })

  it("rejects an unauthenticated order (accounts are mandatory)", async () => {
    currentUser = null
    const result = await createOrder(customer, [
      { productId: "a", quantity: 1 },
    ])
    expect(result.ok).toBe(false)
    expect(insertedOrder).toBeNull()
  })

  it("links the order to the user and uses the account email", async () => {
    currentUser = { id: "user-9", email: "account@example.com" }
    const result = await createOrder(
      { ...customer, email: "typed-in-form@example.com" },
      [{ productId: "a", quantity: 1 }]
    )
    expect(result.ok).toBe(true)
    expect(insertedOrder?.user_id).toBe("user-9")
    // Email comes from the session, not the submitted form value.
    expect(insertedOrder?.customer_email).toBe("account@example.com")
  })

  it("saves the delivery address to the profile for a signed-in user", async () => {
    const result = await createOrder(
      {
        ...customer,
        fulfillmentMethod: "delivery",
        carrierId: "econo-demo",
        address: {
          addressLine1: "5 Baker St",
          city: "Haifa",
          postalCode: "30000",
        },
      },
      [{ productId: "a", quantity: 1 }]
    )
    expect(result.ok).toBe(true)
    expect(profileUpdate).toMatchObject({
      address_line1: "5 Baker St",
      city: "Haifa",
      postal_code: "30000",
    })
  })
})
