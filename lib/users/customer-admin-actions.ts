"use server"

import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import { isValidEmail } from "@/lib/orders/order-validation"
import { resolveOrigin } from "@/lib/utils/site-origin"
import type { ActionResult } from "@/lib/types/action-result"
import { fail, ok } from "@/lib/types/action-result"

/**
 * Sends a customer a password-reset email on the admin's behalf.
 *
 * Admin-guarded. Uses the same `resetPasswordForEmail` path as the
 * self-service forgot-password flow, so the customer receives the standard
 * recovery email and sets their own new password via `/reset-password`. The
 * admin never sees or sets the password.
 */
export async function sendCustomerPasswordReset(
  email: string
): Promise<ActionResult<null>> {
  await requireAdmin()

  const normalized = email.trim().toLowerCase()
  if (!isValidEmail(normalized)) {
    return fail("Enter a valid email address.")
  }

  const origin = await resolveOrigin()
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })
  if (error) return fail("Could not send the reset link.")

  return ok(null)
}
