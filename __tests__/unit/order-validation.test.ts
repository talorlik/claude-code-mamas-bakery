import { describe, expect, it } from "vitest"
import {
  validateOrderCustomer,
  normalizePhone,
  isValidEmail,
} from "@/lib/orders/order-validation"
import type { OrderCustomerInput } from "@/lib/orders/order-types"

function validInput(
  overrides: Partial<OrderCustomerInput> = {}
): OrderCustomerInput {
  return {
    fullName: "Dana Levi",
    phone: "+972 50-123-4567",
    email: "dana@example.com",
    pickupDate: "2999-12-31",
    notes: "",
    fulfillmentMethod: "pickup",
    carrierId: null,
    address: null,
    ...overrides,
  }
}

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("dana@example.com")).toBe(true)
  })

  it("rejects malformed addresses", () => {
    expect(isValidEmail("dana@")).toBe(false)
    expect(isValidEmail("dana.example.com")).toBe(false)
    expect(isValidEmail("")).toBe(false)
  })
})

describe("normalizePhone", () => {
  it("strips spaces and dashes but keeps a leading plus", () => {
    expect(normalizePhone("+972 50-123-4567")).toBe("+972501234567")
  })

  it("strips all non-digits when no plus is present", () => {
    expect(normalizePhone("(050) 123 4567")).toBe("0501234567")
  })
})

describe("validateOrderCustomer", () => {
  it("passes a valid input", () => {
    const result = validateOrderCustomer(validInput())
    expect(result.ok).toBe(true)
  })

  it("requires a full name of at least 2 chars", () => {
    const result = validateOrderCustomer(validInput({ fullName: "A" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.fullName).toBeTruthy()
  })

  it("rejects an invalid email", () => {
    const result = validateOrderCustomer(validInput({ email: "nope" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.email).toBeTruthy()
  })

  it("rejects a phone with too few digits", () => {
    const result = validateOrderCustomer(validInput({ phone: "123" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.phone).toBeTruthy()
  })

  it("rejects a pickup date in the past", () => {
    const result = validateOrderCustomer(
      validInput({ pickupDate: "2000-01-01" })
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.pickupDate).toBeTruthy()
  })

  it("rejects a missing pickup date", () => {
    const result = validateOrderCustomer(validInput({ pickupDate: "" }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.pickupDate).toBeTruthy()
  })

  it("returns normalized data on success", () => {
    const result = validateOrderCustomer(
      validInput({ fullName: "  Dana Levi  ", phone: "050-123-4567" })
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.fullName).toBe("Dana Levi")
      expect(result.data.phone).toBe("0501234567")
      expect(result.data.fulfillmentMethod).toBe("pickup")
      expect(result.data.carrierId).toBeNull()
    }
  })

  it("requires a carrier and address for delivery", () => {
    const result = validateOrderCustomer(
      validInput({ fulfillmentMethod: "delivery" })
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.fieldErrors?.carrierId).toBeTruthy()
      expect(result.fieldErrors?.addressLine1).toBeTruthy()
    }
  })

  it("rejects an unknown carrier id for delivery", () => {
    const result = validateOrderCustomer(
      validInput({
        fulfillmentMethod: "delivery",
        carrierId: "nope-carrier",
        address: {
          addressLine1: "1 Main St",
          city: "Tel Aviv",
          postalCode: "61000",
        },
      })
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors?.carrierId).toBeTruthy()
  })

  it("accepts a valid delivery order and normalizes the address", () => {
    const result = validateOrderCustomer(
      validInput({
        fulfillmentMethod: "delivery",
        carrierId: "citywide-demo",
        address: {
          addressLine1: "  1 Main St  ",
          city: "Tel Aviv",
          postalCode: "61000",
        },
      })
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.fulfillmentMethod).toBe("delivery")
      expect(result.data.carrierId).toBe("citywide-demo")
      expect(result.data.address?.addressLine1).toBe("1 Main St")
    }
  })
})
