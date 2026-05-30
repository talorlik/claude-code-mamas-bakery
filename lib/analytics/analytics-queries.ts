import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import type { OrderStatus } from "@/lib/orders/order-types"
import type { FulfillmentMethod } from "@/lib/delivery/carriers"

/**
 * Admin analytics, aggregated in Postgres via SECURITY DEFINER RPCs (see
 * migration 0012). Each call is admin-guarded here and the RPC re-checks
 * is_admin internally, so non-admins get empty results either way. Aggregation
 * stays in the database rather than pulling every order into the app.
 */

export interface RevenuePoint {
  day: string
  revenue: number
  orders: number
}

export interface StatusCount {
  status: OrderStatus
  orders: number
}

export interface TopProduct {
  productName: string
  quantity: number
  revenue: number
}

export interface FulfillmentCount {
  method: FulfillmentMethod
  orders: number
}

export interface AnalyticsSummary {
  revenueByDay: RevenuePoint[]
  ordersByStatus: StatusCount[]
  topProducts: TopProduct[]
  fulfillmentSplit: FulfillmentCount[]
  totalRevenue: number
  totalOrders: number
}

/**
 * Loads every analytics aggregate in parallel for the dashboard. Guards on
 * admin, then runs the four RPCs concurrently. Returns zeroed/empty data on
 * any individual failure so a single bad query never blanks the page.
 */
export async function getAnalyticsSummary(
  days = 30,
  topN = 10
): Promise<AnalyticsSummary> {
  await requireAdmin()
  const supabase = await createClient()

  const [revenueRes, statusRes, topRes, fulfillmentRes] = await Promise.all([
    supabase.rpc("analytics_revenue_by_day", { p_days: days }),
    supabase.rpc("analytics_orders_by_status"),
    supabase.rpc("analytics_top_products", { p_limit: topN }),
    supabase.rpc("analytics_fulfillment_split"),
  ])

  // The analytics RPCs are typed with `Args: never`, which collapses the
  // generated row type; annotate the rows explicitly as we normalize them.
  type RevenueRow = { day: string; revenue: number; orders: number }
  type StatusRow = { status: OrderStatus; orders: number }
  type TopRow = { product_name: string; quantity: number; revenue: number }
  type FulfillmentRow = {
    fulfillment_method: FulfillmentMethod
    orders: number
  }

  const revenueByDay: RevenuePoint[] = (
    (revenueRes.data ?? []) as RevenueRow[]
  ).map((r) => ({
    day: r.day,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }))

  const ordersByStatus: StatusCount[] = (
    (statusRes.data ?? []) as StatusRow[]
  ).map((r) => ({
    status: r.status,
    orders: Number(r.orders),
  }))

  const topProducts: TopProduct[] = ((topRes.data ?? []) as TopRow[]).map(
    (r) => ({
      productName: r.product_name,
      quantity: Number(r.quantity),
      revenue: Number(r.revenue),
    })
  )

  const fulfillmentSplit: FulfillmentCount[] = (
    (fulfillmentRes.data ?? []) as FulfillmentRow[]
  ).map((r) => ({ method: r.fulfillment_method, orders: Number(r.orders) }))

  const totalRevenue = revenueByDay.reduce((sum, p) => sum + p.revenue, 0)
  const totalOrders = ordersByStatus.reduce((sum, s) => sum + s.orders, 0)

  return {
    revenueByDay,
    ordersByStatus,
    topProducts,
    fulfillmentSplit,
    totalRevenue,
    totalOrders,
  }
}
