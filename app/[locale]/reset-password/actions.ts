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
 */
export async function setNewPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "")

  const result = await updatePassword(password)
  if (!result.ok) {
    redirect(`/reset-password?error=${encodeURIComponent(result.error)}`)
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")

  redirect(
    `/login?notice=${encodeURIComponent("Password updated, please sign in.")}`
  )
}
