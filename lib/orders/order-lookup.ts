"use server"

import { createAdminClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type { OrderWithItems } from "@/lib/orders/order-types"
import { validateLookup } from "@/lib/orders/order-validation"

/**
 * Looks up a customer's orders by an exact phone number or email address.
 *
 * The input is validated and classified first, so the query is always an exact
 * match on a normalized phone or lowercased email - never an open-ended scan.
 * This is the only way customers read orders, so it must not expose unrelated
 * orders. Returns matching orders newest-first, each with its line items.
 */
export async function lookupOrders(
  raw: string
): Promise<ActionResult<OrderWithItems[]>> {
  const parsed = validateLookup(raw)
  if (!parsed.ok) return parsed

  const admin = await createAdminClient()
  let query = admin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })

  if (parsed.data.kind === "email") {
    query = query.ilike("customer_email", parsed.data.value)
  } else {
    query = query.eq("customer_phone", parsed.data.value)
  }

  const { data, error } = await query
  if (error || !data) {
    return fail("We couldn't complete the lookup. Please try again.")
  }

  const orders: OrderWithItems[] = data.map((row) => {
    const { order_items, ...order } = row as typeof row & {
      order_items: OrderWithItems["items"]
    }
    return { ...order, items: order_items ?? [] }
  })

  return ok(orders)
}
