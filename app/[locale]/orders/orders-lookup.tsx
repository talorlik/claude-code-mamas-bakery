"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import type { OrderWithItems } from "@/lib/orders/order-types"
import { lookupOrders } from "@/lib/orders/order-lookup"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatDate, formatPrice } from "@/lib/utils/format"
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/order-badges"
import { EmptyState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Customer order-lookup form and results.
 *
 * Submits a phone or email to the server action, which validates and runs an
 * exact-match query. Results render with status and payment badges; an empty
 * search shows a helpful message and never reveals unrelated orders.
 */
export function OrdersLookup({ locale }: { locale: Locale }) {
  const t = useTranslations("orders")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [results, setResults] = React.useState<OrderWithItems[] | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = String(new FormData(e.currentTarget).get("query") ?? "")

    setPending(true)
    setError(undefined)
    const result = await lookupOrders(value)
    setPending(false)

    if (result.ok) {
      setResults(result.data)
    } else {
      setResults(null)
      setError(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid gap-2">
          <Label htmlFor="query">{t("lookupLabel")}</Label>
          <Input
            id="query"
            name="query"
            placeholder={t("lookupPlaceholder")}
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? t("searching") : t("search")}
        </Button>
      </form>

      {results !== null ? (
        results.length === 0 ? (
          <EmptyState title={t("noResults")} />
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      {order.order_number}
                    </CardTitle>
                    <div className="flex gap-2">
                      <OrderStatusBadge status={order.status} locale={locale} />
                      <PaymentStatusBadge
                        isPaid={order.is_paid}
                        locale={locale}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <p className="text-muted-foreground">
                    {t("orderedOn")} {formatDate(order.created_at)} ·{" "}
                    {t("pickupOn")} {formatDate(order.pickup_date)}
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
        )
      ) : null}
    </div>
  )
}
