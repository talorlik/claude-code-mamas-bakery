import { createClient } from "@/lib/supabase/server"
import type { OrderWithItems } from "@/lib/orders/order-types"

/**
 * Returns the signed-in user's orders, newest first, each with its line items.
 *
 * Relies on the request-scoped server client and RLS: the "Users can read own
 * orders" / "own order items" policies restrict the result to `user_id =
 * auth.uid()`. Returns an empty array when the user has no orders or is not
 * signed in.
 */
export async function getOrdersForUser(
  userId: string
): Promise<OrderWithItems[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  // Normalize the embedded relation name to the `items` view-model field.
  return data.map((row) => {
    const { order_items, ...order } = row as typeof row & {
      order_items: OrderWithItems["items"]
    }
    return { ...order, items: order_items ?? [] }
  })
}
