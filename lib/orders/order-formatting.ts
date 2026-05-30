import type { OrderStatus, PaymentStatus } from "@/lib/orders/order-types"

/**
 * Supported UI locales for label maps.
 */
export type Locale = "en" | "he"

const ORDER_STATUS_LABELS: Record<Locale, Record<OrderStatus, string>> = {
  en: {
    New: "New",
    Received: "Received",
    "Ready for Pickup": "Ready for Pickup",
    Completed: "Completed",
  },
  he: {
    New: "חדשה",
    Received: "התקבלה",
    "Ready for Pickup": "מוכנה לאיסוף",
    Completed: "הושלמה",
  },
}

const PAYMENT_STATUS_LABELS: Record<Locale, Record<PaymentStatus, string>> = {
  en: { paid: "Paid", unpaid: "Unpaid" },
  he: { paid: "שולם", unpaid: "לא שולם" },
}

/**
 * Returns the localized label for an order status.
 */
export function orderStatusLabel(
  status: OrderStatus,
  locale: Locale = "en"
): string {
  return ORDER_STATUS_LABELS[locale][status]
}

/**
 * Derives a {@link PaymentStatus} from the `is_paid` boolean.
 */
export function paymentStatusOf(isPaid: boolean): PaymentStatus {
  return isPaid ? "paid" : "unpaid"
}

/**
 * Returns the localized label for a payment status.
 */
export function paymentStatusLabel(
  status: PaymentStatus,
  locale: Locale = "en"
): string {
  return PAYMENT_STATUS_LABELS[locale][status]
}
