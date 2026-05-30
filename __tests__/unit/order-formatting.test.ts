import { describe, expect, it } from "vitest"
import {
  orderStatusLabel,
  paymentStatusLabel,
  paymentStatusOf,
} from "@/lib/orders/order-formatting"

describe("orderStatusLabel", () => {
  it("maps each status to an English label", () => {
    expect(orderStatusLabel("New", "en")).toBe("New")
    expect(orderStatusLabel("Ready for Pickup", "en")).toBe("Ready for Pickup")
  })

  it("maps each status to a Hebrew label", () => {
    expect(orderStatusLabel("New", "he")).toBe("חדשה")
    expect(orderStatusLabel("Completed", "he")).toBe("הושלמה")
  })
})

describe("paymentStatusOf", () => {
  it("derives paid/unpaid from a boolean", () => {
    expect(paymentStatusOf(true)).toBe("paid")
    expect(paymentStatusOf(false)).toBe("unpaid")
  })
})

describe("paymentStatusLabel", () => {
  it("labels paid and unpaid in English", () => {
    expect(paymentStatusLabel("paid", "en")).toBe("Paid")
    expect(paymentStatusLabel("unpaid", "en")).toBe("Unpaid")
  })

  it("labels paid and unpaid in Hebrew", () => {
    expect(paymentStatusLabel("paid", "he")).toBe("שולם")
    expect(paymentStatusLabel("unpaid", "he")).toBe("לא שולם")
  })
})
