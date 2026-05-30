"use server"

import { createAdminClient } from "@/lib/supabase/server"
import type { RenderedEmail } from "@/lib/email/templates/types"

/**
 * Sends a pre-rendered transactional email.
 *
 * Delivery goes through the `send-order-email` Supabase Edge Function, which
 * holds the SMTP credentials as function secrets and does the actual SMTP send
 * (the same SMTP account configured for Supabase Auth). Rendering happens in the
 * app (see lib/email/templates) so this layer only transmits.
 *
 * When the email path is not configured (local dev without secrets), this falls
 * back to logging the message so the rest of the order flow works offline. All
 * failures are swallowed and returned as a boolean: a failed notification must
 * never fail the order that triggered it.
 */
export async function sendEmail(
  to: string,
  email: RenderedEmail
): Promise<boolean> {
  // Treat the email path as unconfigured unless explicitly enabled. This keeps
  // local dev and tests from attempting a real send.
  if (process.env.EMAIL_ENABLED !== "true") {
    console.info(
      `[email:stub] to=${to} subject=${JSON.stringify(email.subject)} (set EMAIL_ENABLED=true to send)`
    )
    return false
  }

  try {
    const admin = await createAdminClient()
    const { error } = await admin.functions.invoke("send-order-email", {
      body: {
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      },
    })
    if (error) {
      console.error("[email] send-order-email failed:", error.message)
      return false
    }
    return true
  } catch (err) {
    console.error("[email] send threw:", err)
    return false
  }
}
