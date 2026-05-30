import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import type { Locale } from "@/lib/orders/order-formatting"
import { OrdersLookup } from "./orders-lookup"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "orders" })
  // Lookup page is private-by-nature; keep it out of the index.
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  }
}

/**
 * Public order-lookup page. Customers find their orders by exact phone or
 * email; the search runs server-side and returns only matching orders.
 */
export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("orders")

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <OrdersLookup locale={locale as Locale} />
    </main>
  )
}
