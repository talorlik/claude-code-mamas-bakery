import { describe, expect, it } from "vitest"
import { DELIVERY_CARRIERS, getCarrier } from "@/lib/delivery/carriers"

describe("delivery carriers", () => {
  it("exposes at least one demo carrier with a non-negative fee", () => {
    expect(DELIVERY_CARRIERS.length).toBeGreaterThan(0)
    for (const c of DELIVERY_CARRIERS) {
      expect(c.flatFee).toBeGreaterThanOrEqual(0)
      expect(c.id).toBeTruthy()
      expect(c.name).toBeTruthy()
    }
  })

  it("looks up a carrier by id", () => {
    const carrier = getCarrier(DELIVERY_CARRIERS[0].id)
    expect(carrier).toEqual(DELIVERY_CARRIERS[0])
  })

  it("returns null for unknown or empty ids", () => {
    expect(getCarrier("does-not-exist")).toBeNull()
    expect(getCarrier(null)).toBeNull()
    expect(getCarrier(undefined)).toBeNull()
    expect(getCarrier("")).toBeNull()
  })
})
