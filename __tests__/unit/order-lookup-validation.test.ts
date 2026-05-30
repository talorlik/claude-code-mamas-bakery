import { describe, expect, it } from "vitest"
import { validateLookup } from "@/lib/orders/order-validation"

describe("validateLookup", () => {
  it("classifies and lowercases an email", () => {
    const r = validateLookup("  Dana@Example.com ")
    expect(r.ok).toBe(true)
    if (r.ok)
      expect(r.data).toEqual({ kind: "email", value: "dana@example.com" })
  })

  it("rejects a malformed email", () => {
    expect(validateLookup("dana@").ok).toBe(false)
  })

  it("classifies and normalizes a phone", () => {
    const r = validateLookup("050-123-4567")
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data).toEqual({ kind: "phone", value: "0501234567" })
  })

  it("keeps a leading plus on an international phone", () => {
    const r = validateLookup("+972 50 123 4567")
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.value).toBe("+972501234567")
  })

  it("rejects a phone with too few digits", () => {
    expect(validateLookup("12345").ok).toBe(false)
  })

  it("rejects blank input", () => {
    expect(validateLookup("   ").ok).toBe(false)
  })
})
