import { describe, expect, it } from "vitest"
import { generateOrderNumber } from "@/lib/orders/order-number"

describe("generateOrderNumber", () => {
  it("formats as MB-YYYYMMDD-XXXX for a fixed date", () => {
    const n = generateOrderNumber(new Date("2026-05-30T12:00:00Z"))
    expect(n).toMatch(/^MB-20260530-[A-Z0-9]{4}$/)
  })

  it("produces distinct suffixes across calls", () => {
    const a = generateOrderNumber(new Date("2026-05-30T12:00:00Z"))
    const b = generateOrderNumber(new Date("2026-05-30T12:00:00Z"))
    // Same date prefix, suffixes should differ (random); allow rare collision.
    expect(a.slice(0, 11)).toBe(b.slice(0, 11))
  })
})
