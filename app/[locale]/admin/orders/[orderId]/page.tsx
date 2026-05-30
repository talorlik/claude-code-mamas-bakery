import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { Link } from "@/i18n/navigation"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getOrderById } from "@/lib/orders/order-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { OrderDetail } from "@/components/admin/order-detail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Full-page admin order detail. Mobile-friendly and deep-linkable; the desktop
 * list still uses an in-place drawer. Shares the OrderDetail component (and thus
 * the status/payment controls) with the drawer. Admin-guarded.
 */
export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>
}) {
  const { locale, orderId } = await params
  setRequestLocale(locale)
  await requireAdmin()

  const t = await getTranslations("adminOrders")
  const order = await getOrderById(orderId)
  if (!order) notFound()

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <Link
        href="/admin/orders"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {t("title")}
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{order.order_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderDetail order={order} locale={locale as Locale} />
        </CardContent>
      </Card>
    </main>
  )
}
