"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"
import type { Order, OrderStatus } from "@/lib/orders/order-types"
import { ORDER_STATUSES } from "@/lib/orders/order-types"

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
    .select()
    .single()

  if (error || !data) return fail("Could not update the order status.")

  revalidatePath("/admin/orders")
  return ok(data)
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
