import { formatDate, formatPrice } from "@/lib/utils/format"
import { orderStatusLabel } from "@/lib/orders/order-formatting"
import type { OrderStatus } from "@/lib/orders/order-types"
import { esc, renderShell } from "@/lib/email/templates/layout"
import type {
  Locale,
  OrderEmailData,
  RenderedEmail,
} from "@/lib/email/templates/types"

/**
 * Localized, branded order emails (confirmation and status update). Each
 * builder returns a subject plus HTML and a plain-text fallback. Strings are
 * inlined per locale rather than read from the next-intl catalog because emails
 * render outside a request context (and may run in an Edge Function); keeping a
 * small local copy avoids a server-only dependency.
 */

type Strings = {
  confirmSubject: (n: string) => string
  confirmHeading: string
  confirmIntro: (name: string) => string
  statusSubject: (n: string, s: string) => string
  statusHeading: string
  statusIntro: (name: string, s: string) => string
  orderNumber: string
  pickup: string
  delivery: string
  items: string
  deliveryFee: string
  total: string
}

const STR: Record<Locale, Strings> = {
  en: {
    confirmSubject: (n: string) => `Order ${n} confirmed`,
    confirmHeading: "Thanks for your order!",
    confirmIntro: (name: string) =>
      `Hi ${name}, we've received your order and started getting it ready.`,
    statusSubject: (n: string, s: string) => `Order ${n} is now "${s}"`,
    statusHeading: "Order update",
    statusIntro: (name: string, s: string) =>
      `Hi ${name}, your order status is now "${s}".`,
    orderNumber: "Order number",
    pickup: "Pickup date",
    delivery: "Delivery date",
    items: "Items",
    deliveryFee: "Delivery fee",
    total: "Total",
  },
  he: {
    confirmSubject: (n: string) => `הזמנה ${n} אושרה`,
    confirmHeading: "תודה על ההזמנה!",
    confirmIntro: (name: string) =>
      `שלום ${name}, קיבלנו את ההזמנה והתחלנו להכין אותה.`,
    statusSubject: (n: string, s: string) => `הזמנה ${n} בסטטוס "${s}"`,
    statusHeading: "עדכון הזמנה",
    statusIntro: (name: string, s: string) =>
      `שלום ${name}, סטטוס ההזמנה שלך עודכן ל-"${s}".`,
    orderNumber: "מספר הזמנה",
    pickup: "תאריך איסוף",
    delivery: "תאריך משלוח",
    items: "פריטים",
    deliveryFee: "דמי משלוח",
    total: "סה״כ",
  },
}

function itemsHtml(data: OrderEmailData): string {
  const rows = data.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 0;">${esc(i.productName)} × ${i.quantity}</td>` +
        `<td style="padding:4px 0;text-align:end;">${formatPrice(i.lineTotal)}</td></tr>`
    )
    .join("")
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">${rows}</table>`
}

function itemsText(data: OrderEmailData): string {
  return data.items
    .map((i) => `- ${i.productName} x ${i.quantity}: ${formatPrice(i.lineTotal)}`)
    .join("\n")
}

function summaryHtml(data: OrderEmailData, t: Strings): string {
  const dateLabel = data.fulfillmentMethod === "delivery" ? t.delivery : t.pickup
  const feeRow =
    data.deliveryFee > 0
      ? `<p style="margin:4px 0;color:#6b7280;font-size:14px;">${t.deliveryFee}: ${formatPrice(data.deliveryFee)}</p>`
      : ""
  return `
    <p style="margin:8px 0;font-size:14px;"><strong>${t.orderNumber}:</strong> ${esc(data.orderNumber)}</p>
    <p style="margin:4px 0;font-size:14px;"><strong>${dateLabel}:</strong> ${formatDate(data.date)}</p>
    <h2 style="font-size:15px;margin:16px 0 4px;">${t.items}</h2>
    ${itemsHtml(data)}
    ${feeRow}
    <p style="margin:8px 0 0;font-size:16px;font-weight:700;">${t.total}: ${formatPrice(data.total)}</p>`
}

function summaryText(data: OrderEmailData, t: Strings): string {
  const dateLabel = data.fulfillmentMethod === "delivery" ? t.delivery : t.pickup
  const feeLine =
    data.deliveryFee > 0
      ? `\n${t.deliveryFee}: ${formatPrice(data.deliveryFee)}`
      : ""
  return (
    `${t.orderNumber}: ${data.orderNumber}\n` +
    `${dateLabel}: ${formatDate(data.date)}\n\n` +
    `${t.items}:\n${itemsText(data)}${feeLine}\n\n` +
    `${t.total}: ${formatPrice(data.total)}`
  )
}

/** Order confirmation email, sent when an order is placed. */
export function renderOrderConfirmation(
  data: OrderEmailData,
  locale: Locale
): RenderedEmail {
  const t = STR[locale] ?? STR.en
  const body = `
    <p style="margin:0 0 8px;font-size:14px;color:#374151;">${esc(t.confirmIntro(data.customerName))}</p>
    ${summaryHtml(data, t)}`
  return {
    subject: t.confirmSubject(data.orderNumber),
    html: renderShell({ locale, heading: t.confirmHeading, body }),
    text:
      `${t.confirmIntro(data.customerName)}\n\n${summaryText(data, t)}`,
  }
}

/** Status-update notification, sent when an admin changes the order status. */
export function renderStatusUpdate(
  data: OrderEmailData,
  locale: Locale
): RenderedEmail {
  const t = STR[locale] ?? STR.en
  // data.status carries the raw OrderStatus; localize it for display.
  const statusLabel = orderStatusLabel(data.status as OrderStatus, locale)
  const body = `
    <p style="margin:0 0 8px;font-size:14px;color:#374151;">${esc(t.statusIntro(data.customerName, statusLabel))}</p>
    ${summaryHtml(data, t)}`
  return {
    subject: t.statusSubject(data.orderNumber, statusLabel),
    html: renderShell({ locale, heading: t.statusHeading, body }),
    text: `${t.statusIntro(data.customerName, statusLabel)}\n\n${summaryText(data, t)}`,
  }
}
