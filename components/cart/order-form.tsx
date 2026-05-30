"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import type {
  DeliveryAddressInput,
  OrderCustomerInput,
} from "@/lib/orders/order-types"
import {
  nextAllowedPickupDate,
  pickupDisabledMatcher,
} from "@/lib/orders/pickup-rules"
import { DELIVERY_CARRIERS } from "@/lib/delivery/carriers"
import { formatPrice } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"

/** Prefillable defaults for the order form (e.g. from the customer profile). */
export interface OrderFormDefaults {
  fullName?: string
  phone?: string
  email?: string
  address?: DeliveryAddressInput | null
}

/** Parses a `YYYY-MM-DD` string to a local Date at midnight for the calendar. */
function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Formats a local Date as `YYYY-MM-DD` for submission and validation. */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Pickup-details form for placing an order.
 *
 * Submission is delegated to the `onSubmit` callback so the same form serves
 * both the UI (this batch) and the wired server action (next batch). It surfaces
 * per-field errors returned by the caller and a busy state while submitting.
 */
export function OrderForm({
  onSubmit,
  pending,
  fieldErrors,
  defaults,
  emailReadOnly = false,
  onDeliveryFeeChange,
}: {
  onSubmit: (input: OrderCustomerInput) => void
  pending: boolean
  fieldErrors?: Record<string, string>
  defaults?: OrderFormDefaults
  emailReadOnly?: boolean
  /**
   * Reports the currently-selected delivery fee (0 for pickup) so the cart
   * summary can show the same total the server will compute and charge.
   */
  onDeliveryFeeChange?: (fee: number) => void
}) {
  const t = useTranslations("cart")
  // Default to the first selectable pickup date so the customer never lands on
  // a closed or too-soon day. The calendar disables the rest via the matcher.
  const [pickupDate, setPickupDate] = React.useState<Date>(() =>
    parseLocalDate(nextAllowedPickupDate())
  )
  const [method, setMethod] = React.useState<"pickup" | "delivery">("pickup")
  const [carrierId, setCarrierId] = React.useState<string>(
    DELIVERY_CARRIERS[0]?.id ?? ""
  )

  const selectedCarrier = DELIVERY_CARRIERS.find((c) => c.id === carrierId)

  // Keep the parent's total in sync with the chosen fulfillment + carrier.
  const deliveryFee =
    method === "delivery" ? (selectedCarrier?.flatFee ?? 0) : 0
  React.useEffect(() => {
    onDeliveryFeeChange?.(deliveryFee)
  }, [deliveryFee, onDeliveryFeeChange])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const isDelivery = method === "delivery"
    onSubmit({
      fullName: String(data.get("fullName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      pickupDate: formatLocalDate(pickupDate),
      notes: String(data.get("notes") ?? ""),
      fulfillmentMethod: method,
      carrierId: isDelivery ? carrierId : null,
      address: isDelivery
        ? {
            addressLine1: String(data.get("addressLine1") ?? ""),
            addressLine2: String(data.get("addressLine2") ?? ""),
            city: String(data.get("city") ?? ""),
            postalCode: String(data.get("postalCode") ?? ""),
          }
        : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        name="fullName"
        label={t("fullName")}
        defaultValue={defaults?.fullName}
        error={fieldErrors?.fullName}
        required
      />
      <Field
        name="phone"
        label={t("phone")}
        type="tel"
        defaultValue={defaults?.phone}
        error={fieldErrors?.phone}
        required
      />
      <Field
        name="email"
        label={t("email")}
        type="email"
        defaultValue={defaults?.email}
        error={fieldErrors?.email}
        required
        readOnly={emailReadOnly}
      />

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">
          {t("fulfillment")}
        </legend>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={method === "pickup" ? "default" : "outline"}
            size="sm"
            onClick={() => setMethod("pickup")}
          >
            {t("methodPickup")}
          </Button>
          <Button
            type="button"
            variant={method === "delivery" ? "default" : "outline"}
            size="sm"
            onClick={() => setMethod("delivery")}
          >
            {t("methodDelivery")}
          </Button>
        </div>
      </fieldset>

      {method === "delivery" ? (
        <div className="grid gap-4 rounded-md border p-3">
          <Field
            name="addressLine1"
            label={t("addressLine1")}
            defaultValue={defaults?.address?.addressLine1}
            error={fieldErrors?.addressLine1}
            required
          />
          <Field
            name="addressLine2"
            label={t("addressLine2")}
            defaultValue={defaults?.address?.addressLine2}
            error={fieldErrors?.addressLine2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="city"
              label={t("city")}
              defaultValue={defaults?.address?.city}
              error={fieldErrors?.city}
              required
            />
            <Field
              name="postalCode"
              label={t("postalCode")}
              defaultValue={defaults?.address?.postalCode}
              error={fieldErrors?.postalCode}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="carrierId">{t("carrier")}</Label>
            <NativeSelect
              id="carrierId"
              name="carrierId"
              value={carrierId}
              onChange={(e) => setCarrierId(e.target.value)}
            >
              {DELIVERY_CARRIERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {formatPrice(c.flatFee)} ({c.etaLabel})
                </option>
              ))}
            </NativeSelect>
            {fieldErrors?.carrierId ? (
              <p className="text-sm text-destructive">
                {fieldErrors.carrierId}
              </p>
            ) : null}
            {selectedCarrier ? (
              <p className="text-sm text-muted-foreground">
                {t("deliveryFee", {
                  fee: formatPrice(selectedCarrier.flatFee),
                })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label>{method === "delivery" ? t("deliveryDate") : t("pickupDate")}</Label>
        <Calendar
          mode="single"
          required
          selected={pickupDate}
          onSelect={(date) => date && setPickupDate(date)}
          disabled={pickupDisabledMatcher}
          startMonth={pickupDate}
          className="rounded-md border"
        />
        <p className="text-sm text-muted-foreground">
          {t("pickupClosedNote")}
        </p>
        {fieldErrors?.pickupDate ? (
          <p className="text-sm text-destructive">{fieldErrors.pickupDate}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder={t("notesPlaceholder")}
          rows={3}
        />
        {fieldErrors?.notes ? (
          <p className="text-sm text-destructive">{fieldErrors.notes}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("placing") : t("placeOrder")}
      </Button>
    </form>
  )
}

function Field({
  name,
  label,
  type = "text",
  error,
  required,
  defaultValue,
  readOnly,
}: {
  name: string
  label: string
  type?: string
  error?: string
  required?: boolean
  defaultValue?: string
  readOnly?: boolean
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
