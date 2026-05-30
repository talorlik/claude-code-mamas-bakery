import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOrdersForUser } from "@/lib/orders/order-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatDate, formatPrice } from "@/lib/utils/format"
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/order-badges"
import { EmptyState } from "@/components/shared/states"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "orders" })
  // Private account view; keep it out of the index.
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  }
}

/**
 * Authenticated "My Orders" page. Shows only the signed-in user's own orders,
 * read through the RLS-respecting server client. The route is gated in
 * middleware; this re-check redirects a guest who reaches the page directly.
 */
export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("orders")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/login", locale })
    throw new Error("unreachable") // redirect() halts; narrows `user` below.
  }

  const orders = await getOrdersForUser(user.id)
  const lang = locale as Locale

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {order.order_number}
                  </CardTitle>
                  <div className="flex gap-2">
                    <OrderStatusBadge status={order.status} locale={lang} />
                    <PaymentStatusBadge isPaid={order.is_paid} locale={lang} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="text-muted-foreground">
                  {t("orderedOnDate", { date: formatDate(order.created_at) })}{" "}
                  · {t("pickupOnDate", { date: formatDate(order.pickup_date) })}
                </p>
                <ul>
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between border-b py-1 last:border-b-0"
                    >
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
