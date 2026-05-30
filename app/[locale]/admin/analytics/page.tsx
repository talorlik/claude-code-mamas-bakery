import { getTranslations, setRequestLocale } from "next-intl/server"

import { getAnalyticsSummary } from "@/lib/analytics/analytics-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { AnalyticsCharts } from "./analytics-charts"

/**
 * Admin analytics dashboard. Aggregates are computed in Postgres (admin-guarded
 * RPCs) and rendered with recharts in the client child. The /admin layout
 * already enforces admin access; getAnalyticsSummary guards again.
 */
export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("adminAnalytics")

  const data = await getAnalyticsSummary()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-medium">{t("heading")}</h2>
      <AnalyticsCharts data={data} locale={locale as Locale} />
    </div>
  )
}
