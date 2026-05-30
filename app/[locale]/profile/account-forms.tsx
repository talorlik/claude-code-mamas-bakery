"use client"

import * as React from "react"

import {
  updateProfile,
  updateEmail,
  updatePassword,
} from "@/lib/profile/profile-actions"
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
  email,
}: {
  initialFullName: string
  initialPhone: string
  email: string
}) {
  return (
    <div className="grid gap-6">
      <ContactDetailsForm
        initialFullName={initialFullName}
        initialPhone={initialPhone}
      />
      <EmailForm currentEmail={email} />
      <PasswordForm />
    </div>
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
        ? { ok: true, message: "Details saved." }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact details</CardTitle>
        <CardDescription>
          Used to prefill the order form at checkout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={initialFullName}
              required
              minLength={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
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
            {pending ? "Saving…" : "Save details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    const result = await updateEmail(String(formData.get("email") ?? ""))
    setPending(false)
    setFeedback(
      result.ok
        ? {
            ok: true,
            message: "Check your inbox to confirm the new email address.",
          }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>
          Changing your email requires confirmation via a link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
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
            {pending ? "Updating…" : "Update email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordForm() {
  const [feedback, setFeedback] = React.useState<Feedback>(null)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    const result = await updatePassword(String(formData.get("password") ?? ""))
    setPending(false)
    setFeedback(
      result.ok
        ? { ok: true, message: "Password updated." }
        : { ok: false, message: result.error }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>
          <FormFeedback feedback={feedback} />
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
