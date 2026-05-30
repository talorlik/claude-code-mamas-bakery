"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import {
  updateProfile,
  updateAddress,
  updateEmail,
  updatePassword,
} from "@/lib/profile/profile-actions"
import type { DeliveryAddressInput } from "@/lib/orders/order-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Feedback = { ok: boolean; message: string } | null

/**
 * Editable account forms: saved contact details, email change, and password
 * change. Each form submits to its server action and shows inline feedback.
 * The orders list is rendered read-only by the page, not here.
 */
export function AccountForms({
  initialFullName,
  initialPhone,
  initialAddress,
  email,
}: {
  initialFullName: string
  initialPhone: string
  initialAddress: DeliveryAddressInput
  email: string
}) {
  return (
    <div className="grid gap-6">
      <ContactDetailsForm
        initialFullName={initialFullName}
        initialPhone={initialPhone}
      />
      <AddressForm initialAddress={initialAddress} />
      <EmailForm currentEmail={email} />
      <PasswordForm />
    </div>
  )
}

function AddressForm({
  initialAddress,
}: {
  initialAddress: DeliveryAddressInput
}) {
  const t = useTranslations("profile")
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    const result = await updateAddress({
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      city: String(formData.get("city") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
    })
    setPending(false)
    setFeedback(
      result.ok
        ? { ok: true, message: t("addressSaved") }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("addressSection")}</CardTitle>
        <CardDescription>{t("addressDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="addressLine1">{t("addressLine1")}</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              defaultValue={initialAddress.addressLine1}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="addressLine2">{t("addressLine2")}</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              defaultValue={initialAddress.addressLine2 ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="city">{t("city")}</Label>
              <Input id="city" name="city" defaultValue={initialAddress.city} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postalCode">{t("postalCode")}</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={initialAddress.postalCode}
              />
            </div>
          </div>
          <FormFeedback feedback={feedback} />
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? t("saving") : t("saveAddress")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function FormFeedback({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null
  return (
    <p
      className={
        feedback.ok ? "text-sm text-green-600" : "text-sm text-destructive"
      }
      role={feedback.ok ? "status" : "alert"}
    >
      {feedback.message}
    </p>
  )
}

function ContactDetailsForm({
  initialFullName,
  initialPhone,
}: {
  initialFullName: string
  initialPhone: string
}) {
  const t = useTranslations("profile")
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    const result = await updateProfile({
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    })
    setPending(false)
    setFeedback(
      result.ok
        ? { ok: true, message: t("detailsSaved") }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contactDetails")}</CardTitle>
        <CardDescription>{t("contactDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={initialFullName}
              required
              minLength={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialPhone}
              inputMode="tel"
            />
          </div>
          <FormFeedback feedback={feedback} />
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? t("saving") : t("saveDetails")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EmailForm({ currentEmail }: { currentEmail: string }) {
  const t = useTranslations("profile")
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    const result = await updateEmail(String(formData.get("email") ?? ""))
    setPending(false)
    setFeedback(
      result.ok
        ? { ok: true, message: t("emailCheckInbox") }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("emailSection")}</CardTitle>
        <CardDescription>{t("emailDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("emailAddress")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={currentEmail}
              required
            />
          </div>
          <FormFeedback feedback={feedback} />
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? t("updating") : t("updateEmail")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordForm() {
  const t = useTranslations("profile")
  const tAuth = useTranslations("auth")
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(formData: FormData) {
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    // Confirmation is a paired-input concern, so it is checked client-side
    // before hitting the server; the action still enforces the length minimum.
    if (password !== confirmPassword) {
      setFeedback({ ok: false, message: tAuth("passwordsDoNotMatch") })
      return
    }

    setPending(true)
    const result = await updatePassword(password)
    setPending(false)
    setFeedback(
      result.ok
        ? { ok: true, message: t("passwordUpdated") }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("passwordSection")}</CardTitle>
        <CardDescription>{t("passwordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={tAuth("passwordHint")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{tAuth("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={tAuth("passwordHint")}
            />
          </div>
          <FormFeedback feedback={feedback} />
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? t("updating") : t("updatePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
