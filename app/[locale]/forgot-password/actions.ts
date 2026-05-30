"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { isValidEmail } from "@/lib/orders/order-validation"
import { resolveOrigin } from "@/lib/utils/site-origin"

/**
 * Sends a password-reset email via Supabase. The link routes through
 * `/auth/confirm`, which exchanges the recovery token for a session and then
 * redirects to `/reset-password`.
 *
 * Always reports the same generic notice regardless of whether the email
 * belongs to an account, so the response cannot be used to enumerate users.
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()

  if (!isValidEmail(email)) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("Enter a valid email address.")}`
    )
  }

  const origin = await resolveOrigin()
  const supabase = await createClient()

  // Intentionally ignore the result: surfacing success/failure per-email would
  // leak account existence.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })

  redirect(
    `/forgot-password?notice=${encodeURIComponent(
      "If an account exists for that email, we've sent a reset link."
    )}`
  )
}
