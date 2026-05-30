import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type {
  DeliveryAddressInput,
  OrderCustomerInput,
} from "@/lib/orders/order-types"
import { isPickupDateAllowed } from "@/lib/orders/pickup-rules"
import { getCarrier } from "@/lib/delivery/carriers"

/**
 * Validates and normalizes a delivery address. line1, city, and postalCode are
 * required; line2 is optional. Field errors are keyed to the address inputs so
 * the form can highlight them. Returns the trimmed address on success.
 */
export function validateAddress(
  input: DeliveryAddressInput
): ActionResult<DeliveryAddressInput> {
  const fieldErrors: Record<string, string> = {}

  const addressLine1 = input.addressLine1?.trim() ?? ""
  if (addressLine1.length < 3 || addressLine1.length > 200) {
    fieldErrors.addressLine1 = "Enter a street address."
  }

  const addressLine2 = input.addressLine2?.trim() ?? ""
  if (addressLine2.length > 200) {
    fieldErrors.addressLine2 = "Address line 2 is too long."
  }

  const city = input.city?.trim() ?? ""
  if (city.length < 2 || city.length > 120) {
    fieldErrors.city = "Enter a city."
  }

  const postalCode = input.postalCode?.trim() ?? ""
  if (postalCode.length < 2 || postalCode.length > 20) {
    fieldErrors.postalCode = "Enter a postal code."
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fail("Please correct the highlighted fields.", fieldErrors)
  }

  return ok({ addressLine1, addressLine2, city, postalCode })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates an email address with a pragmatic single-`@` pattern. Not a full
 * RFC 5322 implementation; sufficient for form-level rejection of malformed
 * input. Authoritative confirmation happens via the verification email.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

/**
 * Normalizes a phone number for storage and lookup: keeps a single leading
 * `+` if present and strips every other non-digit character.
 */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim()
  const hasPlus = trimmed.startsWith("+")
  const digits = trimmed.replace(/\D/g, "")
  return hasPlus ? `+${digits}` : digits
}

/**
 * Validates and normalizes customer-supplied order fields per the order
 * validation rules (name length, email, phone digit count, pickup date not in
 * the past, notes length). On success returns the normalized values; on
 * failure returns a user-safe message and per-field errors.
 */
export function validateOrderCustomer(
  input: OrderCustomerInput
): ActionResult<OrderCustomerInput> {
  const fieldErrors: Record<string, string> = {}

  const fullName = input.fullName.trim()
  if (fullName.length < 2 || fullName.length > 120) {
    fieldErrors.fullName = "Name must be between 2 and 120 characters."
  }

  if (!isValidEmail(input.email)) {
    fieldErrors.email = "Enter a valid email address."
  }

  const phone = normalizePhone(input.phone)
  const phoneDigits = phone.replace(/\D/g, "")
  if (phoneDigits.length < 7 || phoneDigits.length > 20) {
    fieldErrors.phone = "Enter a valid phone number."
  }

  const pickupDate = input.pickupDate.trim()
  if (!pickupDate) {
    fieldErrors.pickupDate = "Choose a pickup date."
  } else if (!isPickupDateAllowed(pickupDate)) {
    // Closed weekday (Fri/Sat), in the past, or inside the lead-time window.
    fieldErrors.pickupDate = "That pickup date is not available."
  }

  const notes = input.notes?.trim() ?? ""
  if (notes.length > 1000) {
    fieldErrors.notes = "Notes must be 1000 characters or fewer."
  }

  // Fulfillment: pickup needs nothing extra; delivery requires a known carrier
  // and a valid address. The fee itself is derived in createOrder, not here.
  const fulfillmentMethod =
    input.fulfillmentMethod === "delivery" ? "delivery" : "pickup"
  let carrierId: string | null = null
  let address: DeliveryAddressInput | null = null

  if (fulfillmentMethod === "delivery") {
    if (!getCarrier(input.carrierId)) {
      fieldErrors.carrierId = "Choose a delivery option."
    } else {
      carrierId = input.carrierId as string
    }

    const addressResult = validateAddress(
      input.address ?? { addressLine1: "", city: "", postalCode: "" }
    )
    if (!addressResult.ok) {
      Object.assign(fieldErrors, addressResult.fieldErrors)
    } else {
      address = addressResult.data
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return fail("Please correct the highlighted fields.", fieldErrors)
  }

  return ok({
    fullName,
    phone,
    email: input.email.trim().toLowerCase(),
    pickupDate,
    notes,
    fulfillmentMethod,
    carrierId,
    address,
  })
}
