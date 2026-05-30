import type { Database, Tables } from "@/lib/supabase/database.types"

/**
 * An order row exactly as stored in the database.
 */
export type Order = Tables<"orders">

/**
 * An order item row exactly as stored in the database.
 */
export type OrderItem = Tables<"order_items">

/**
 * The lifecycle states of an order, mirroring the `order_status` enum.
 */
export type OrderStatus = Database["public"]["Enums"]["order_status"]

/**
 * The ordered list of order statuses. Source of truth for status selects,
 * filters, and label maps.
 */
export const ORDER_STATUSES: readonly OrderStatus[] = [
  "New",
  "Received",
  "Ready for Pickup",
  "Completed",
] as const

/**
 * Binary payment state derived from `orders.is_paid`, modelled as a string
 * union so it can drive labels and badges directly.
 */
export type PaymentStatus = "paid" | "unpaid"

/**
 * An order together with its line items, as returned by order queries that
 * join `order_items`.
 */
export interface OrderWithItems extends Order {
  items: OrderItem[]
}

/**
 * A delivery address as captured at checkout (and saved to the profile).
 * line2 is optional; the rest are required when fulfillment is delivery.
 */
export interface DeliveryAddressInput {
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
}

/**
 * Customer-supplied fields for an order, before server-side validation.
 * Cart contents are validated and priced separately on the server.
 *
 * `fulfillmentMethod` selects pickup or delivery. For delivery, `carrierId`
 * and `address` are required; the delivery fee is derived server-side from the
 * carrier, never taken from the client.
 */
export interface OrderCustomerInput {
  fullName: string
  phone: string
  email: string
  pickupDate: string
  notes?: string
  fulfillmentMethod: "pickup" | "delivery"
  carrierId?: string | null
  address?: DeliveryAddressInput | null
}
