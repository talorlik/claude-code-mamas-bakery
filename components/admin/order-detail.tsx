"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { OrderStatus, OrderWithItems } from "@/lib/orders/order-types"
import { ORDER_STATUSES } from "@/lib/orders/order-types"
import {
  updateOrderStatus,
  setOrderPaid,
} from "@/lib/orders/order-admin-actions"
import { orderStatusLabel, type Locale } from "@/lib/orders/order-formatting"
import { getCarrier } from "@/lib/delivery/carriers"
import { formatDate, formatPrice } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"

/**
 * Admin order detail: customer and fulfillment info, line items, totals, and
 * status/payment update controls. Shared by the desktop drawer (in the orders
 * manager) and the full-page mobile route, so the rendering and the update
 * wiring live in one place.
 *
 * Holds local copy of the mutable fields (status, is_paid) so the controls
 * reflect changes immediately; an optional `onChange` lets a parent (the
 * manager list) stay in sync.
 */
export function OrderDetail({
  order,
  locale,
  onChange,
}: {
  order: OrderWithItems
  locale: Locale
  onChange?: (patch: { id: string } & Partial<OrderWithItems>) => void
}) {
  const t = useTranslations("adminOrders")
  const [status, setStatus] = React.useState<OrderStatus>(order.status)
  const [isPaid, setIsPaid] = React.useState(order.is_paid)

  async function handleStatus(next: OrderStatus) {
    const previous = status
    setStatus(next)
    const result = await updateOrderStatus(order.id, next)
    if (result.ok) {
      onChange?.({ id: order.id, status: next })
      toast.success(t("saved"))
    } else {
      setStatus(previous)
      toast.error(result.error)
    }
  }

  async function handlePaid(next: boolean) {
    const result = await setOrderPaid(order.id, next)
    if (result.ok) {
      setIsPaid(next)
      onChange?.({ id: order.id, is_paid: next })
      toast.success(t("saved"))
    } else {
      toast.error(result.error)
    }
  }

  const isDelivery = order.fulfillment_method === "delivery"
  const carrierName = order.delivery_carrier
    ? (getCarrier(order.delivery_carrier)?.name ?? order.delivery_carrier)
    : null
  const addressLine = [
    order.delivery_address_line1,
    order.delivery_address_line2,
    order.delivery_city,
    order.delivery_postal_code,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm">
        <p className="font-medium">{order.customer_name}</p>
        <p className="text-muted-foreground">
          {order.customer_phone} · {order.customer_email}
        </p>
        {isDelivery ? (
          <>
            <p className="text-muted-foreground">
              {t("methodDelivery")}
              {carrierName ? ` · ${carrierName}` : ""}
            </p>
            {addressLine ? (
              <p className="text-muted-foreground">{addressLine}</p>
            ) : null}
            <p className="text-muted-foreground">
              {t("deliveryDate")}: {formatDate(order.pickup_date)}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">
            {t("methodPickup")}: {formatDate(order.pickup_date)}
          </p>
        )}
        {order.notes ? <p className="mt-1">{order.notes}</p> : null}
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

      {order.delivery_fee > 0 ? (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t("deliveryFeeLabel")}</span>
          <span>{formatPrice(order.delivery_fee)}</span>
        </div>
      ) : null}
      <div className="flex justify-between font-medium">
        <span>{t("total")}</span>
        <span>{formatPrice(order.total_amount)}</span>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`status-${order.id}`}>{t("updateStatus")}</Label>
        <NativeSelect
          id={`status-${order.id}`}
          value={status}
          onChange={(e) => handleStatus(e.target.value as OrderStatus)}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabel(s, locale)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <Button
        variant={isPaid ? "outline" : "default"}
        onClick={() => handlePaid(!isPaid)}
      >
        {isPaid ? t("markUnpaid") : t("markPaid")}
      </Button>
    </div>
  )
}
