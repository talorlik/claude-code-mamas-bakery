import type { Product } from "@/lib/products/product-types"
import type { Order, OrderItem, OrderWithItems } from "@/lib/orders/order-types"
import type { OrderCustomerInput } from "@/lib/orders/order-types"

/**
 * Test fixtures: minimal, overridable builders for the core domain objects.
 * Shared across integration tests so each file does not redefine shapes.
 */

/** Builds a product row with sensible defaults. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Classic Challah",
    description: "Soft and sweet",
    price: 18,
    category: "challah",
    image_url: null,
    is_available: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }
}

/** Builds an order row with sensible defaults. */
export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "o1",
    order_number: "MB-20260101-AAAA",
    user_id: null,
    customer_name: "Dana Levi",
    customer_phone: "0501234567",
    customer_email: "dana@example.com",
    pickup_date: "2999-12-31",
    notes: null,
    total_amount: 18,
    status: "New",
    is_paid: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }
}

/** Builds an order_item row with sensible defaults. */
export function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: "i1",
    order_id: "o1",
    product_id: "p1",
    product_name: "Classic Challah",
    quantity: 1,
    unit_price: 18,
    line_total: 18,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }
}

/** Builds an order joined with its items. */
export function makeOrderWithItems(
  overrides: Partial<OrderWithItems> = {}
): OrderWithItems {
  const { items, ...orderOverrides } = overrides
  return {
    ...makeOrder(orderOverrides),
    items: items ?? [makeOrderItem()],
  }
}

/** Valid customer input for order submission. */
export function makeCustomerInput(
  overrides: Partial<OrderCustomerInput> = {}
): OrderCustomerInput {
  return {
    fullName: "Dana Levi",
    phone: "050-123-4567",
    email: "dana@example.com",
    pickupDate: "2999-12-31",
    notes: "",
    ...overrides,
  }
}
