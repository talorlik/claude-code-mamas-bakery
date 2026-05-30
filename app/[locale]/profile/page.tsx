import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOrdersForUser } from "@/lib/orders/order-queries"
import { ensureProfile } from "@/lib/profile/profile-actions"
import {
  orderStatusLabel,
  paymentStatusLabel,
  paymentStatusOf,
  type Locale,
} from "@/lib/orders/order-formatting"
import { formatDate, formatPrice } from "@/lib/utils/format"
import { AccountForms } from "./account-forms"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
}

/**
 * Customer account page: a read-only list of the user's past orders plus
 * editable account forms. Redirects unauthenticated visitors to login.
 */
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("profile")
  const tOrders = await getTranslations("orders")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/login", locale })
    throw new Error("unreachable") // redirect() halts; narrows `user` below.
  }

  // Guarantee a profile row exists for users created before this flow.
  await ensureProfile(user.id)

  const [{ data: profile }, orders] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, phone, address_line1, address_line2, city, postal_code"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    getOrdersForUser(user.id),
  ])

  const lang = locale as Locale

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">{t("pastOrders")}</h2>
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              {t("noOrders")}
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {order.order_number}
                </CardTitle>
                <CardDescription>
                  {tOrders("orderedOnDate", {
                    date: formatDate(order.created_at),
                  })}{" "}
                  ·{" "}
                  {tOrders("pickupOnDate", {
                    date: formatDate(order.pickup_date),
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {orderStatusLabel(order.status, lang)}
                  </Badge>
                  <Badge variant={order.is_paid ? "default" : "outline"}>
                    {paymentStatusLabel(paymentStatusOf(order.is_paid), lang)}
                  </Badge>
                </div>
                <ul className="text-sm">
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
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">{t("accountSettings")}</h2>
        <AccountForms
          initialFullName={profile?.full_name ?? ""}
          initialPhone={profile?.phone ?? ""}
          initialAddress={{
            addressLine1: profile?.address_line1 ?? "",
            addressLine2: profile?.address_line2 ?? "",
            city: profile?.city ?? "",
            postalCode: profile?.postal_code ?? "",
          }}
          email={user.email ?? ""}
        />
      </section>
    </div>
  )
}
