"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import type { OrderCustomerInput } from "@/lib/orders/order-types"
import { createOrder } from "@/lib/orders/order-actions"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/components/cart/cart-provider"
import { CartItemRow } from "@/components/cart/cart-item-row"
import { OrderForm } from "@/components/cart/order-form"
import { EmptyState } from "@/components/shared/states"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Interactive cart page body: line items with quantity controls, the running
 * total, an empty state, and the pickup-details form that submits the order.
 *
 * On success it shows a confirmation with the order number and clears the
 * cart; on validation failure it surfaces per-field errors from the server.
 */
export function CartView() {
  const t = useTranslations("cart")
  const { cart, hydrated, total, clear } = useCart()
  const [pending, setPending] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>()
  const [formError, setFormError] = React.useState<string>()
  const [orderNumber, setOrderNumber] = React.useState<string>()

  // Avoid rendering empty/full states until the cart hydrates from storage.
  if (!hydrated) return null

  if (orderNumber) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden />
        <h2 className="text-xl font-semibold">{t("successTitle")}</h2>
        <p className="text-muted-foreground">
          {t("successBody", { orderNumber })}
        </p>
        <Link href="/orders" className={buttonVariants()}>
          {t("viewOrders")}
        </Link>
      </div>
    )
  }

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

  async function handleSubmit(input: OrderCustomerInput) {
    setPending(true)
    setFieldErrors(undefined)
    setFormError(undefined)

    const result = await createOrder(
      input,
      cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))
    )

    setPending(false)

    if (result.ok) {
      setOrderNumber(result.data.orderNumber)
      clear()
    } else {
      setFieldErrors(result.fieldErrors)
      setFormError(result.fieldErrors ? undefined : result.error)
    }
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
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("orderDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <OrderForm
              onSubmit={handleSubmit}
              pending={pending}
              fieldErrors={fieldErrors}
            />
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
