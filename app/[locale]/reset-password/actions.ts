"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { updatePassword } from "@/lib/profile/profile-actions"

/**
 * Sets a new password during the recovery flow. Runs on the recovery session
 * established by `/auth/confirm`, reusing `updatePassword` (which calls
 * `supabase.auth.updateUser`). On success the user is signed out and sent to
 * the login page, forcing a fresh sign-in with the new password.
 *
 * Validation is server-side and authoritative: the native form `minLength` and
 * `required` attributes are client-only hints a request can bypass, so the
 * length and confirmation-match checks are re-run here. Errors are surfaced as
 * stable codes (not literal strings) so the page can render them in the active
 * locale; see the `auth.*` keys consumed by `reset-password/page.tsx`.
 */
export async function setNewPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  // Confirmation must match before we touch Supabase. Checked first so a
  // mismatch is reported even when the password itself is otherwise valid.
  if (password !== confirmPassword) {
    redirect(`/reset-password?error=passwordsDoNotMatch`)
  }

  const result = await updatePassword(password)
  if (!result.ok) {
    // `updatePassword` enforces the 8-char minimum; map its only field error to
    // the corresponding locale key, falling back to a generic update failure.
    const code = result.fieldErrors?.password
      ? "passwordTooShort"
      : "updateFailed"
    redirect(`/reset-password?error=${code}`)
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")

  // `auth.passwordUpdated` translation key resolved on the login page.
  redirect(`/login?notice=passwordUpdated`)
}
