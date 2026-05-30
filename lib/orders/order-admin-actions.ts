"use server"

import { revalidatePath } from "next/cache"

import { getLocale } from "next-intl/server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type { Order, OrderItem, OrderStatus } from "@/lib/orders/order-types"
import { ORDER_STATUSES } from "@/lib/orders/order-types"
import type { Locale } from "@/lib/orders/order-formatting"
import { sendEmail } from "@/lib/email/send"
import { renderStatusUpdate } from "@/lib/email/templates/order-emails"

/**
 * Updates an order's status. Admin-guarded; the value is checked against the
 * allowed statuses before the write. RLS ("Admins can update orders") is the
 * second layer. Revalidates the admin order list.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<ActionResult<Order>> {
  await requireAdmin()

  if (!ORDER_STATUSES.includes(status)) {
    return fail("Invalid status.")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*, items:order_items(*)")
    .single()

  if (error || !data) return fail("Could not update the order status.")

  // Notify the customer of the new status. Fire-and-forget and fully guarded:
  // the status change is already committed, so an email (or locale-resolution)
  // failure must not surface as an error.
  if (data.customer_email) {
    try {
      const locale = ((await getLocale()) as Locale) ?? "en"
      const email = renderStatusUpdate(
        {
          orderNumber: data.order_number,
          customerName: data.customer_name,
          status: data.status,
          fulfillmentMethod: data.fulfillment_method,
          date: data.pickup_date,
          items: ((data.items ?? []) as OrderItem[]).map((i) => ({
            productName: i.product_name,
            quantity: i.quantity,
            lineTotal: i.line_total,
          })),
          deliveryFee: data.delivery_fee,
          total: data.total_amount,
        },
        locale
      )
      await sendEmail(data.customer_email, email)
    } catch (err) {
      console.error("[order] status email failed:", err)
    }
  }

  revalidatePath("/admin/orders")
  // Strip the joined items so the result matches the ActionResult<Order>
  // contract callers expect.
  const order = { ...data } as Record<string, unknown>
  delete order.items
  return ok(order as unknown as Order)
}

/**
 * Marks an order paid or unpaid. Admin-guarded; revalidates the admin list.
 */
export async function setOrderPaid(
  id: string,
  isPaid: boolean
): Promise<ActionResult<Order>> {
  await requireAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .update({ is_paid: isPaid })
    .eq("id", id)
    .select()
    .single()

  if (error || !data) return fail("Could not update the payment status.")

  revalidatePath("/admin/orders")
  return ok(data)
}
