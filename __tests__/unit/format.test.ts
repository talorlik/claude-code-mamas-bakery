import { describe, expect, it } from "vitest"
import { formatPrice, formatDate } from "@/lib/utils/format"

describe("formatPrice", () => {
  it("formats a number as ILS with two decimals by default", () => {
    expect(formatPrice(18)).toBe("₪18.00")
    expect(formatPrice(45.5)).toBe("₪45.50")
  })

  it("rounds to two decimals", () => {
    expect(formatPrice(18.005)).toBe("₪18.01")
  })

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("₪0.00")
  })
})

describe("formatDate", () => {
  it("formats an ISO date string as DD/MM/YYYY", () => {
    expect(formatDate("2026-05-30")).toBe("30/05/2026")
  })

  it("formats a Date instance", () => {
    expect(formatDate(new Date("2026-01-05T00:00:00Z"))).toBe("05/01/2026")
  })
})
