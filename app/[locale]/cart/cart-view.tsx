"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import type { OrderCustomerInput } from "@/lib/orders/order-types"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/components/cart/cart-provider"
import { CartItemRow } from "@/components/cart/cart-item-row"
import { OrderForm } from "@/components/cart/order-form"
import { EmptyState } from "@/components/shared/states"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Interactive cart page body: line items with quantity controls, the running
 * total, an empty state, and the pickup-details form.
 *
 * Order submission is wired in the next batch; for now the form reports that
 * checkout is not yet available. The cart state and totals are fully live.
 */
export function CartView() {
  const t = useTranslations("cart")
  const { cart, hydrated, total, clear } = useCart()
  const [pending, setPending] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>()

  // Avoid rendering empty/full states until the cart hydrates from storage.
  if (!hydrated) return null

  if (cart.length === 0) {
    return (
      <EmptyState
        title={t("empty")}
        action={
          <Link href="/menu" className={buttonVariants()}>
            {t("browseMenu")}
          </Link>
        }
      />
    )
  }

  function handleSubmit(input: OrderCustomerInput) {
    // Submission is wired in the order-submission batch. Keep the handler so
    // the form, validation surface, and busy state are already in place.
    setPending(true)
    setFieldErrors(undefined)
    void input
    setPending(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("heading")}</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
            <div className="flex items-center justify-between pt-4 text-lg font-semibold">
              <span>{t("total")}</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => clear()}
            >
              {t("remove")}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("orderDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderForm
              onSubmit={handleSubmit}
              pending={pending}
              fieldErrors={fieldErrors}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
