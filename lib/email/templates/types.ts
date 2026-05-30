import type { Locale } from "@/lib/orders/order-formatting"

/** A fully rendered email ready to send: subject plus HTML and text bodies. */
export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/** Re-exported so template callers have one import for the locale type. */
export type { Locale }

/** Line item shape used in order emails (name, quantity, line total). */
export interface EmailOrderItem {
  productName: string
  quantity: number
  lineTotal: number
}

/** Data needed to render an order-related email. */
export interface OrderEmailData {
  orderNumber: string
  customerName: string
  status: string
  fulfillmentMethod: "pickup" | "delivery"
  date: string // YYYY-MM-DD pickup/delivery date
  items: EmailOrderItem[]
  deliveryFee: number
  total: number
}
