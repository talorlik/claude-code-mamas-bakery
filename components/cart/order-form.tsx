"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import type { OrderCustomerInput } from "@/lib/orders/order-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
}: {
  onSubmit: (input: OrderCustomerInput) => void
  pending: boolean
  fieldErrors?: Record<string, string>
}) {
  const t = useTranslations("cart")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    onSubmit({
      fullName: String(data.get("fullName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      pickupDate: String(data.get("pickupDate") ?? ""),
      notes: String(data.get("notes") ?? ""),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        name="fullName"
        label={t("fullName")}
        error={fieldErrors?.fullName}
        required
      />
      <Field
        name="phone"
        label={t("phone")}
        type="tel"
        error={fieldErrors?.phone}
        required
      />
      <Field
        name="email"
        label={t("email")}
        type="email"
        error={fieldErrors?.email}
        required
      />
      <Field
        name="pickupDate"
        label={t("pickupDate")}
        type="date"
        error={fieldErrors?.pickupDate}
        required
      />

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
}: {
  name: string
  label: string
  type?: string
  error?: string
  required?: boolean
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
