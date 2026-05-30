"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import type { OrderStatus, OrderWithItems } from "@/lib/orders/order-types"
import { ORDER_STATUSES } from "@/lib/orders/order-types"
import { filterOrders } from "@/lib/orders/order-filters"
import { orderStatusLabel, type Locale } from "@/lib/orders/order-formatting"
import { formatDate, formatPrice } from "@/lib/utils/format"
import { OrderDetail } from "@/components/admin/order-detail"
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/order-badges"
import { EmptyState } from "@/components/shared/states"
import { Button, buttonVariants } from "@/components/ui/button"
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

  // Keep the list in sync when the detail panel mutates an order.
  function patchOrder(updated: { id: string } & Partial<OrderWithItems>) {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
    )
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
                  <div className="flex justify-end gap-1">
                    {/* Desktop: open the drawer in place. */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex"
                      onClick={() => setSelectedId(order.id)}
                    >
                      {t("details")}
                    </Button>
                    {/* Mobile/deep-link: the full-page detail route. */}
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "sm:hidden",
                      })}
                    >
                      {t("details")}
                    </Link>
                  </div>
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
              <div className="px-4 pb-8">
                <OrderDetail
                  order={selected}
                  locale={locale}
                  onChange={patchOrder}
                />
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
