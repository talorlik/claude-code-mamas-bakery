import type { OrderStatus, OrderWithItems } from "@/lib/orders/order-types"
import type { FulfillmentMethod } from "@/lib/delivery/carriers"
import { normalizePhone } from "@/lib/orders/order-validation"

/**
 * The active admin order filters. Any field left undefined/empty is ignored.
 */
export interface OrderFilters {
  status?: OrderStatus | "all"
  pickupDate?: string
  search?: string
  fulfillment?: FulfillmentMethod | "all"
}

/**
 * Filters orders by status, exact pickup date, and a free-text search over
 * customer name, phone, and email.
 *
 * Search is case-insensitive; the term is also matched against the normalized
 * phone (digits only) so "050 123" matches a stored "0501234567". Pure and
 * order-preserving.
 */
export function filterOrders(
  orders: OrderWithItems[],
  filters: OrderFilters
): OrderWithItems[] {
  const status =
    filters.status && filters.status !== "all" ? filters.status : null
  const pickupDate = filters.pickupDate?.trim() || null
  const search = filters.search?.trim().toLowerCase() || null
  const searchDigits = search ? normalizePhone(search).replace(/\D/g, "") : ""
  const fulfillment =
    filters.fulfillment && filters.fulfillment !== "all"
      ? filters.fulfillment
      : null

  return orders.filter((order) => {
    if (status && order.status !== status) return false
    if (fulfillment && order.fulfillment_method !== fulfillment) return false
    if (pickupDate && order.pickup_date !== pickupDate) return false
    if (search) {
      const name = order.customer_name.toLowerCase()
      const email = order.customer_email.toLowerCase()
      const phoneDigits = order.customer_phone.replace(/\D/g, "")
      const matches =
        name.includes(search) ||
        email.includes(search) ||
        (searchDigits.length > 0 && phoneDigits.includes(searchDigits))
      if (!matches) return false
    }
    return true
  })
}
