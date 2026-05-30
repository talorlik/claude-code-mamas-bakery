"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type { OrderCustomerInput } from "@/lib/orders/order-types"
import { getLocale } from "next-intl/server"

import { validateOrderCustomer } from "@/lib/orders/order-validation"
import { generateOrderNumber } from "@/lib/orders/order-number"
import { getCarrier } from "@/lib/delivery/carriers"
import type { Locale } from "@/lib/orders/order-formatting"
import { sendEmail } from "@/lib/email/send"
import { renderOrderConfirmation } from "@/lib/email/templates/order-emails"

/** A cart line as submitted by the client: only id and quantity are trusted. */
export interface OrderLineInput {
  productId: string
  quantity: number
}

const MAX_ORDER_NUMBER_RETRIES = 5

/**
 * Rounds to two decimals, avoiding binary floating-point drift.
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Creates an order from validated customer details and a cart.
 *
 * Security and correctness: prices and availability come from the database, not
 * the client. Products are re-fetched by id; any missing, unavailable, or
 * invalid-quantity line rejects the whole order. Line and order totals are
 * computed server-side, and `product_name`/`unit_price` are snapshotted onto
 * each order item. If a user is signed in, the order is linked to them.
 *
 * Writes use the service-role client because there is no public insert policy
 * on orders/order_items (RLS keeps that surface closed by design).
 */
export async function createOrder(
  customer: OrderCustomerInput,
  lines: OrderLineInput[]
): Promise<ActionResult<{ orderNumber: string }>> {
  // Accounts are mandatory to order. Establish the session up front and reject
  // unauthenticated submits; the UI also gates checkout, but this is the
  // authoritative check so the rule cannot be bypassed.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return fail("Please sign in to place your order.")
  }

  const validation = validateOrderCustomer(customer)
  if (!validation.ok) return validation

  if (!Array.isArray(lines) || lines.length === 0) {
    return fail("Your cart is empty.")
  }

  // Collapse duplicate ids and sanity-check quantities.
  const quantities = new Map<string, number>()
  for (const line of lines) {
    const qty = Number(line.quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return fail("Invalid item quantity.")
    }
    quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + qty)
  }

  const admin = await createAdminClient()

  // Re-fetch the products server-side; ignore client-sent prices entirely.
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, name, price, is_available, stock_quantity")
    .in("id", [...quantities.keys()])

  if (productsError || !products) {
    return fail("We couldn't verify your cart. Please try again.")
  }

  const byId = new Map(products.map((p) => [p.id, p]))

  const items: {
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    line_total: number
  }[] = []
  let total = 0

  for (const [productId, quantity] of quantities) {
    const product = byId.get(productId)
    if (!product || !product.is_available) {
      return fail("One or more items are no longer available.")
    }
    if (product.stock_quantity < quantity) {
      return fail(`Not enough stock for ${product.name}.`)
    }
    const unitPrice = Number(product.price)
    const lineTotal = round2(unitPrice * quantity)
    total = round2(total + lineTotal)
    items.push({
      product_id: productId,
      product_name: product.name,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    })
  }

  // Delivery fee is derived server-side from the chosen carrier; the client
  // never sets it. Pickup orders carry a zero fee and no carrier.
  const isDelivery = validation.data.fulfillmentMethod === "delivery"
  const carrier = isDelivery ? getCarrier(validation.data.carrierId) : null
  const deliveryFee = carrier ? carrier.flatFee : 0
  total = round2(total + deliveryFee)

  // Insert the order, retrying on the rare order-number collision.
  let orderId: string | null = null
  let orderNumber = ""
  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_RETRIES; attempt++) {
    orderNumber = generateOrderNumber()
    const { data, error } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        customer_name: validation.data.fullName,
        customer_phone: validation.data.phone,
        // Email is taken from the authenticated account, not the form.
        customer_email: user.email ?? validation.data.email,
        pickup_date: validation.data.pickupDate,
        notes: validation.data.notes || null,
        total_amount: total,
        fulfillment_method: validation.data.fulfillmentMethod,
        delivery_carrier: carrier?.id ?? null,
        delivery_fee: deliveryFee,
        delivery_address_line1: validation.data.address?.addressLine1 ?? null,
        delivery_address_line2: validation.data.address?.addressLine2 || null,
        delivery_city: validation.data.address?.city ?? null,
        delivery_postal_code: validation.data.address?.postalCode ?? null,
      })
      .select("id")
      .single()

    if (!error && data) {
      orderId = data.id
      break
    }
    // 23505 = unique_violation on order_number; retry with a new number.
    if (error && error.code !== "23505") {
      return fail("We couldn't place your order. Please try again.")
    }
  }

  if (!orderId) {
    return fail("We couldn't place your order. Please try again.")
  }

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: orderId })))

  if (itemsError) {
    // Roll back the orphaned order so a failed item insert leaves no partial.
    await admin.from("orders").delete().eq("id", orderId)
    return fail("We couldn't place your order. Please try again.")
  }

  // Decrement stock atomically per line. decrement_stock guards on availability
  // (UPDATE ... WHERE stock_quantity >= qty), so a concurrent order that drained
  // the shelf between our read and here returns false rather than overselling.
  // On any shortfall, restore the already-decremented lines and roll back the
  // order so it never half-commits.
  const decremented: typeof items = []
  for (const item of items) {
    const { data: succeeded, error: decError } = await admin.rpc(
      "decrement_stock",
      { p_product_id: item.product_id, p_quantity: item.quantity }
    )
    if (decError || !succeeded) {
      for (const done of decremented) {
        await admin.rpc("increment_stock", {
          p_product_id: done.product_id,
          p_quantity: done.quantity,
        })
      }
      await admin.from("order_items").delete().eq("order_id", orderId)
      await admin.from("orders").delete().eq("id", orderId)
      return fail("One or more items just sold out. Please review your cart.")
    }
    decremented.push(item)
  }

  // Persist the delivery address onto the signed-in user's profile so it is
  // prefilled next time. Best-effort: a failure here must not fail the order.
  if (isDelivery && validation.data.address) {
    await supabase
      .from("profiles")
      .update({
        address_line1: validation.data.address.addressLine1,
        address_line2: validation.data.address.addressLine2 || null,
        city: validation.data.address.city,
        postal_code: validation.data.address.postalCode,
      })
      .eq("user_id", user.id)
  }

  // Send the order-confirmation email. Fire-and-forget and fully guarded: an
  // email (or locale-resolution) failure must not fail an order already
  // committed to the database.
  const recipient = user.email ?? validation.data.email
  if (recipient) {
    try {
      const locale = ((await getLocale()) as Locale) ?? "en"
      const email = renderOrderConfirmation(
        {
          orderNumber,
          customerName: validation.data.fullName,
          status: "New",
          fulfillmentMethod: validation.data.fulfillmentMethod,
          date: validation.data.pickupDate,
          items: items.map((i) => ({
            productName: i.product_name,
            quantity: i.quantity,
            lineTotal: i.line_total,
          })),
          deliveryFee,
          total,
        },
        locale
      )
      await sendEmail(recipient, email)
    } catch (err) {
      console.error("[order] confirmation email failed:", err)
    }
  }

  return ok({ orderNumber })
}
