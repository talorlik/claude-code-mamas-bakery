import type { OrderStatus } from "@/lib/orders/order-types"
import {
  orderStatusLabel,
  paymentStatusLabel,
  paymentStatusOf,
  type Locale,
} from "@/lib/orders/order-formatting"
import { Badge } from "@/components/ui/badge"

/**
 * Maps each order status to a badge variant so status is distinguishable
 * without relying on color alone (the label text is always present).
 */
const STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "outline"> =
  {
    New: "secondary",
    Received: "outline",
    "Ready for Pickup": "default",
    Completed: "outline",
  }

/**
 * Localized order-status badge.
 */
export function OrderStatusBadge({
  status,
  locale,
}: {
  status: OrderStatus
  locale: Locale
}) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {orderStatusLabel(status, locale)}
    </Badge>
  )
}

/**
 * Localized payment-status badge derived from `is_paid`.
 */
export function PaymentStatusBadge({
  isPaid,
  locale,
}: {
  isPaid: boolean
  locale: Locale
}) {
  const status = paymentStatusOf(isPaid)
  return (
    <Badge variant={isPaid ? "default" : "outline"}>
      {paymentStatusLabel(status, locale)}
    </Badge>
  )
}
