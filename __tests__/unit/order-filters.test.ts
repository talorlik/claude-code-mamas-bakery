import { describe, expect, it } from "vitest"
import { filterOrders } from "@/lib/orders/order-filters"
import type { OrderWithItems } from "@/lib/orders/order-types"

function order(overrides: Partial<OrderWithItems>): OrderWithItems {
  return {
    id: "o1",
    order_number: "MB-1",
    user_id: null,
    customer_name: "Dana Levi",
    customer_phone: "0501234567",
    customer_email: "dana@example.com",
    pickup_date: "2026-06-01",
    notes: null,
    total_amount: 50,
    status: "New",
    is_paid: false,
    created_at: "2026-05-30T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
    items: [],
    ...overrides,
  }
}

const orders: OrderWithItems[] = [
  order({ id: "a", customer_name: "Dana Levi", status: "New" }),
  order({
    id: "b",
    customer_name: "Yossi Cohen",
    customer_email: "yossi@example.com",
    customer_phone: "0529998888",
    status: "Completed",
    pickup_date: "2026-06-02",
    is_paid: true,
  }),
]

describe("filterOrders", () => {
  it("returns all orders when no filters are set", () => {
    expect(filterOrders(orders, {})).toHaveLength(2)
    expect(filterOrders(orders, { status: "all" })).toHaveLength(2)
  })

  it("filters by status", () => {
    const r = filterOrders(orders, { status: "Completed" })
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe("b")
  })

  it("filters by exact pickup date", () => {
    expect(filterOrders(orders, { pickupDate: "2026-06-02" })).toHaveLength(1)
  })

  it("searches by name, case-insensitively", () => {
    const r = filterOrders(orders, { search: "yossi" })
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe("b")
  })

  it("searches by email", () => {
    expect(filterOrders(orders, { search: "dana@example" })).toHaveLength(1)
  })

  it("searches by phone digits, ignoring formatting", () => {
    const r = filterOrders(orders, { search: "052-999" })
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe("b")
  })

  it("combines filters", () => {
    expect(
      filterOrders(orders, { status: "New", search: "dana" })
    ).toHaveLength(1)
    expect(
      filterOrders(orders, { status: "New", search: "yossi" })
    ).toHaveLength(0)
  })
})
