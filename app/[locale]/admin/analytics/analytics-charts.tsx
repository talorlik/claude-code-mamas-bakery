"use client"

import { useTranslations } from "next-intl"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { AnalyticsSummary } from "@/lib/analytics/analytics-queries"
import { orderStatusLabel, type Locale } from "@/lib/orders/order-formatting"
import { formatPrice } from "@/lib/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PIE_COLORS = ["#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d"]

/**
 * Client-side analytics charts. Receives pre-aggregated data from the server
 * page and renders revenue over time, order status mix, top products, and the
 * pickup/delivery split with recharts.
 */
export function AnalyticsCharts({
  data,
  locale,
}: {
  data: AnalyticsSummary
  locale: Locale
}) {
  const t = useTranslations("adminAnalytics")

  const statusData = data.ordersByStatus.map((s) => ({
    name: orderStatusLabel(s.status, locale),
    orders: s.orders,
  }))
  const topData = data.topProducts.map((p) => ({
    name: p.productName,
    quantity: p.quantity,
  }))
  const fulfillmentData = data.fulfillmentSplit.map((f) => ({
    name: f.method === "delivery" ? t("delivery") : t("pickup"),
    value: f.orders,
  }))

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label={t("totalRevenue")} value={formatPrice(data.totalRevenue)} />
        <StatCard label={t("totalOrders")} value={String(data.totalOrders)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("revenueOverTime")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.revenueByDay.length === 0 ? (
            <Empty label={t("noData")} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ddd0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value) => formatPrice(Number(value))}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b45309"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("ordersByStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <Empty label={t("noData")} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7ddd0" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#b45309" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("fulfillmentSplit")}</CardTitle>
          </CardHeader>
          <CardContent>
            {fulfillmentData.length === 0 ? (
              <Empty label={t("noData")} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={fulfillmentData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {fulfillmentData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("topProducts")}</CardTitle>
        </CardHeader>
        <CardContent>
          {topData.length === 0 ? (
            <Empty label={t("noData")} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ddd0" />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  fontSize={11}
                />
                <Tooltip />
                <Bar dataKey="quantity" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">{label}</p>
  )
}
