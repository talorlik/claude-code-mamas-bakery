import { describe, expect, it } from "vitest"
import {
  renderOrderConfirmation,
  renderStatusUpdate,
} from "@/lib/email/templates/order-emails"
import type { OrderEmailData } from "@/lib/email/templates/types"

function data(overrides: Partial<OrderEmailData> = {}): OrderEmailData {
  return {
    orderNumber: "MB-20260101-AAAA",
    customerName: "Dana Levi",
    status: "New",
    fulfillmentMethod: "pickup",
    date: "2026-06-02",
    items: [{ productName: "Classic Challah", quantity: 2, lineTotal: 36 }],
    deliveryFee: 0,
    total: 36,
    ...overrides,
  }
}

describe("order email templates", () => {
  it("renders a confirmation with subject, html, and text", () => {
    const email = renderOrderConfirmation(data(), "en")
    expect(email.subject).toContain("MB-20260101-AAAA")
    expect(email.html).toContain("Classic Challah")
    expect(email.html).toContain("Dana Levi")
    expect(email.text).toContain("Classic Challah")
    expect(email.text).toContain("MB-20260101-AAAA")
  })

  it("renders Hebrew with rtl direction", () => {
    const email = renderOrderConfirmation(data(), "he")
    expect(email.html).toContain('dir="rtl"')
  })

  it("escapes HTML in user-controlled fields", () => {
    const email = renderOrderConfirmation(
      data({ customerName: "<script>x</script>" }),
      "en"
    )
    expect(email.html).not.toContain("<script>x</script>")
    expect(email.html).toContain("&lt;script&gt;")
  })

  it("shows the delivery fee and date label for delivery orders", () => {
    const email = renderOrderConfirmation(
      data({ fulfillmentMethod: "delivery", deliveryFee: 15, total: 51 }),
      "en"
    )
    expect(email.html).toContain("Delivery fee")
    expect(email.text).toContain("Delivery date")
  })

  it("renders a localized status-update subject", () => {
    const email = renderStatusUpdate(
      data({ status: "Ready for Pickup" }),
      "en"
    )
    expect(email.subject).toContain("Ready for Pickup")
  })
})
