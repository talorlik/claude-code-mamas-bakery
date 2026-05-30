"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers, cookies } from "next/headers"

import { createClient } from "@/lib/supabase/server"
import { isValidEmail } from "@/lib/orders/order-validation"
import { isAdmin } from "@/lib/auth/roles"
import { ensureProfile } from "@/lib/profile/profile-actions"
import { REMEMBER_FLAG, SESSION_ONLY } from "@/lib/supabase/cookie-persistence"

const MIN_PASSWORD_LENGTH = 8

type Credentials = { email: string; password: string }

/**
 * Reads and server-side-validates credentials from a submitted form.
 *
 * Returns the normalized credentials, or a user-safe error string. Validation
 * does not depend on the HTML form attributes, which a client can bypass.
 */
function readCredentials(formData: FormData): Credentials | string {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) return "Email and password are required."
  if (!isValidEmail(email)) return "Enter a valid email address."
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return { email, password }
}

/**
 * Signs an existing user in, then redirects by role: admins to the admin
 * dashboard, everyone else to their profile. Ensures a profile row exists so
 * the profile page always has data to render.
 */
export async function login(formData: FormData) {
  const creds = readCredentials(formData)
  if (typeof creds === "string") {
    redirect(`/login?error=${encodeURIComponent(creds)}`)
  }

  // Record the "remember me" choice BEFORE signing in, so the cookie write
  // triggered by signInWithPassword can read it in the same request. Absence of
  // the flag means the default persistent behavior; only the opt-out is stored,
  // as a session cookie so it too clears on browser close.
  const remember = formData.get("remember") !== null
  const cookieStore = await cookies()
  if (remember) {
    cookieStore.delete(REMEMBER_FLAG)
  } else {
    cookieStore.set(REMEMBER_FLAG, SESSION_ONLY, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  })

  if (error || !data.user) {
    // Generic message: do not reveal whether the email exists.
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`)
  }

  await ensureProfile(data.user.id)
  const admin = await isAdmin(data.user.id)

  revalidatePath("/", "layout")
  redirect(admin ? "/admin" : "/profile")
}

/**
 * Registers a new user. Supabase sends a confirmation email; the session is
 * created only after the user clicks the link. The profile row is created at
 * confirmation time (see /auth/confirm), once a session exists.
 */
export async function signup(formData: FormData) {
  const creds = readCredentials(formData)
  if (typeof creds === "string") {
    redirect(`/login?tab=signup&error=${encodeURIComponent(creds)}`)
  }

  // Absolute URL Supabase embeds in the confirmation email. Falls back to the
  // request host when NEXT_PUBLIC_SITE_URL is unset.
  const h = await headers()
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `https://${h.get("host") ?? "localhost:3000"}`.replace(
      /^https:\/\/localhost/,
      "http://localhost"
    )

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: creds.email,
    password: creds.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    redirect(`/login?tab=signup&error=${encodeURIComponent(error.message)}`)
  }

  redirect(
    `/login?notice=${encodeURIComponent("Check your email to confirm your account.")}`
  )
}
