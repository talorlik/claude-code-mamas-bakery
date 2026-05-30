import { getTranslations, setRequestLocale } from "next-intl/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getAllOrders } from "@/lib/orders/order-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { OrdersManager } from "./orders-manager"

/**
 * Admin order management page. Guarded by requireAdmin; fetches all orders
 * newest-first with their items and hands them to the manager for filtering,
 * detail view, and status/payment updates.
 */
export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireAdmin()
  const t = await getTranslations("adminOrders")

  const orders = await getAllOrders()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>
      <OrdersManager orders={orders} locale={locale as Locale} />
    </div>
  )
}
