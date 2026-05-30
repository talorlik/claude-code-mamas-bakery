import { describe, expect, it } from "vitest"
import {
  CLOSED_WEEKDAYS,
  isPickupDateAllowed,
  nextAllowedPickupDate,
  pickupDisabledMatcher,
} from "@/lib/orders/pickup-rules"

// Fixed reference points (UTC):
//   2026-06-01 Mon, 06-02 Tue, 06-04 Thu, 06-05 Fri, 06-06 Sat, 06-07 Sun
const MON = new Date("2026-06-01T12:00:00Z")
const THU = new Date("2026-06-04T12:00:00Z")

describe("pickup-rules", () => {
  it("closes Friday and Saturday", () => {
    expect(CLOSED_WEEKDAYS).toEqual([5, 6])
  })

  describe("nextAllowedPickupDate", () => {
    it("is tomorrow when tomorrow is an open day", () => {
      expect(nextAllowedPickupDate(MON)).toBe("2026-06-02")
    })

    it("skips closed days to the next open day", () => {
      // Thu + 1 = Fri (closed) -> Sat (closed) -> Sun 06-07.
      expect(nextAllowedPickupDate(THU)).toBe("2026-06-07")
    })
  })

  describe("isPickupDateAllowed", () => {
    it("allows an open weekday at or after the lead-time minimum", () => {
      expect(isPickupDateAllowed("2026-06-02", MON)).toBe(true)
      expect(isPickupDateAllowed("2026-06-03", MON)).toBe(true)
    })

    it("rejects today and earlier (lead time)", () => {
      expect(isPickupDateAllowed("2026-06-01", MON)).toBe(false)
      expect(isPickupDateAllowed("2026-05-30", MON)).toBe(false)
    })

    it("rejects Friday and Saturday", () => {
      expect(isPickupDateAllowed("2026-06-05", MON)).toBe(false) // Fri
      expect(isPickupDateAllowed("2026-06-06", MON)).toBe(false) // Sat
    })

    it("rejects malformed input", () => {
      expect(isPickupDateAllowed("", MON)).toBe(false)
      expect(isPickupDateAllowed("2026-6-2", MON)).toBe(false)
      expect(isPickupDateAllowed("not-a-date", MON)).toBe(false)
    })
  })

  describe("pickupDisabledMatcher", () => {
    it("disables closed weekdays", () => {
      // Build local-time dates; the matcher normalizes to a date string.
      expect(pickupDisabledMatcher(new Date(2026, 5, 6))).toBe(true) // Sat
      expect(pickupDisabledMatcher(new Date(2026, 5, 5))).toBe(true) // Fri
    })
  })
})
