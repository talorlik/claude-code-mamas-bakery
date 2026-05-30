"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { OrderStatus, OrderWithItems } from "@/lib/orders/order-types"
import { ORDER_STATUSES } from "@/lib/orders/order-types"
import { filterOrders } from "@/lib/orders/order-filters"
import {
  updateOrderStatus,
  setOrderPaid,
} from "@/lib/orders/order-admin-actions"
import { orderStatusLabel, type Locale } from "@/lib/orders/order-formatting"
import { getCarrier } from "@/lib/delivery/carriers"
import { formatDate, formatPrice } from "@/lib/utils/format"
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/order-badges"
import { EmptyState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/**
 * Admin order manager: filter/search controls, an order table sorted
 * newest-first, and a details drawer with status and payment update controls.
 * Filtering is client-side over the server-provided orders; updates call the
 * admin-guarded actions and update local state optimistically on success.
 */
export function OrdersManager({
  orders: initialOrders,
  locale,
}: {
  orders: OrderWithItems[]
  locale: Locale
}) {
  const t = useTranslations("adminOrders")
  const [orders, setOrders] = React.useState(initialOrders)
  const [status, setStatus] = React.useState<OrderStatus | "all">("all")
  const [fulfillment, setFulfillment] = React.useState<
    "pickup" | "delivery" | "all"
  >("all")
  const [pickupDate, setPickupDate] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const filtered = filterOrders(orders, {
    status,
    pickupDate,
    search,
    fulfillment,
  })
  const selected = orders.find((o) => o.id === selectedId) ?? null

  function patchOrder(updated: { id: string } & Partial<OrderWithItems>) {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
    )
  }

  async function handleStatus(order: OrderWithItems, next: OrderStatus) {
    const result = await updateOrderStatus(order.id, next)
    if (result.ok) {
      patchOrder({ id: order.id, status: next })
      toast.success(t("saved"))
    } else {
      toast.error(result.error)
    }
  }

  async function handlePaid(order: OrderWithItems, next: boolean) {
    const result = await setOrderPaid(order.id, next)
    if (result.ok) {
      patchOrder({ id: order.id, is_paid: next })
      toast.success(t("saved"))
    } else {
      toast.error(result.error)
    }
  }

  function clearFilters() {
    setStatus("all")
    setFulfillment("all")
    setPickupDate("")
    setSearch("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label htmlFor="search">{t("search")}</Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">{t("filterStatus")}</Label>
          <NativeSelect
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
          >
            <option value="all">{t("allStatuses")}</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel(s, locale)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="fulfillment">{t("filterFulfillment")}</Label>
          <NativeSelect
            id="fulfillment"
            value={fulfillment}
            onChange={(e) =>
              setFulfillment(e.target.value as "pickup" | "delivery" | "all")
            }
          >
            <option value="all">{t("allMethods")}</option>
            <option value="pickup">{t("methodPickup")}</option>
            <option value="delivery">{t("methodDelivery")}</option>
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pickup">{t("filterPickup")}</Label>
          <Input
            id="pickup"
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={clearFilters}>
            {t("clear")}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("orderNumber")}</TableHead>
              <TableHead>{t("customer")}</TableHead>
              <TableHead>{t("pickup")}</TableHead>
              <TableHead>{t("total")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("payment")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.order_number}
                </TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{formatDate(order.pickup_date)}</TableCell>
                <TableCell>{formatPrice(order.total_amount)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} locale={locale} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge isPaid={order.is_paid} locale={locale} />
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(order.id)}
                  >
                    {t("details")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Drawer
        open={selected !== null}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <DrawerContent>
          {selected ? (
            <div className="mx-auto w-full max-w-lg">
              <DrawerHeader>
                <DrawerTitle>{selected.order_number}</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-4 px-4 pb-8">
                <div className="text-sm">
                  <p className="font-medium">{selected.customer_name}</p>
                  <p className="text-muted-foreground">
                    {selected.customer_phone} · {selected.customer_email}
                  </p>
                  {selected.fulfillment_method === "delivery" ? (
                    <>
                      <p className="text-muted-foreground">
                        {t("methodDelivery")}
                        {selected.delivery_carrier
                          ? ` · ${getCarrier(selected.delivery_carrier)?.name ?? selected.delivery_carrier}`
                          : ""}
                      </p>
                      <p className="text-muted-foreground">
                        {[
                          selected.delivery_address_line1,
                          selected.delivery_address_line2,
                          selected.delivery_city,
                          selected.delivery_postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("deliveryDate")}: {formatDate(selected.pickup_date)}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("methodPickup")}: {formatDate(selected.pickup_date)}
                    </p>
                  )}
                  {selected.notes ? (
                    <p className="mt-1">{selected.notes}</p>
                  ) : null}
                </div>

                <ul className="text-sm">
                  {selected.items.map((item) => (
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
                {selected.delivery_fee > 0 ? (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("deliveryFeeLabel")}</span>
                    <span>{formatPrice(selected.delivery_fee)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatPrice(selected.total_amount)}</span>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="detail-status">{t("updateStatus")}</Label>
                  <NativeSelect
                    id="detail-status"
                    value={selected.status}
                    onChange={(e) =>
                      handleStatus(selected, e.target.value as OrderStatus)
                    }
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabel(s, locale)}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                <Button
                  variant={selected.is_paid ? "outline" : "default"}
                  onClick={() => handlePaid(selected, !selected.is_paid)}
                >
                  {selected.is_paid ? t("markUnpaid") : t("markPaid")}
                </Button>
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
