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
 * Reads the Cloudflare Turnstile token a form carries in its hidden
 * `captchaToken` field, or `undefined` when empty. Returning `undefined` (not
 * `""`) lets it be spread into Supabase's `options` without forcing a captcha
 * when none is configured; when captcha is enabled in Supabase, an absent token
 * is rejected server-side by Supabase itself.
 */
function readCaptchaToken(formData: FormData): string | undefined {
  const token = String(formData.get("captchaToken") ?? "").trim()
  return token || undefined
}

/**
 * Returns a safe in-app redirect target from a submitted form, or null.
 *
 * Only same-site, absolute-path values (starting with a single `/`) are
 * allowed, preventing open-redirects to external hosts or protocol-relative
 * URLs. Used to return the user to checkout after a sign-in prompted there.
 */
function safeRedirect(formData: FormData): string | null {
  const raw = String(formData.get("redirect") ?? "").trim()
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw
  return null
}

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

  // Returns an `auth.*` translation key, not a literal message, so the rendering
  // page can localize it. The form pages map these codes via `t.has(code)`.
  if (!email || !password) return "credentialsRequired"
  if (!isValidEmail(email)) return "invalidEmail"
  if (password.length < MIN_PASSWORD_LENGTH) return "passwordTooShort"
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
    redirect(`/login?error=${creds}`)
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

  const captchaToken = readCaptchaToken(formData)
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
    options: { captchaToken },
  })

  if (error || !data.user) {
    // Generic message: do not reveal whether the email exists.
    redirect(`/login?error=invalidCredentials`)
  }

  await ensureProfile(data.user.id)
  const admin = await isAdmin(data.user.id)

  revalidatePath("/", "layout")
  // A safe redirect target (e.g. returning to checkout) wins over the role
  // default; admins still fall through to /admin when no target is given.
  const target = safeRedirect(formData)
  redirect(target ?? (admin ? "/admin" : "/profile"))
}

/**
 * Registers a new user. Supabase sends a confirmation email; the session is
 * created only after the user clicks the link. The profile row is created at
 * confirmation time (see /auth/confirm), once a session exists.
 */
export async function signup(formData: FormData) {
  const creds = readCredentials(formData)
  if (typeof creds === "string") {
    redirect(`/login?tab=signup&error=${creds}`)
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

  const captchaToken = readCaptchaToken(formData)
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: creds.email,
    password: creds.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      captchaToken,
    },
  })

  if (error) {
    // Supabase's message is dynamic and unbounded, so it cannot be a fixed
    // translation key. Surface a localized generic error instead; the specific
    // cause is still captured server-side in the Supabase logs.
    redirect(`/login?tab=signup&error=signupFailed`)
  }

  // When the email already belongs to an account, Supabase (with email
  // confirmation on and anti-enumeration enabled) returns success with an
  // obfuscated user whose `identities` array is empty, and sends no new
  // confirmation email. Promising "check your email" in that case strands the
  // user waiting for a mail that will never arrive. Keep the notice generic so
  // it neither confirms nor denies that the address is registered, while
  // remaining accurate when no email was sent. Both branches are translation
  // keys resolved on the login page.
  const alreadyRegistered = data.user?.identities?.length === 0
  const notice = alreadyRegistered ? "accountMaybeExists" : "checkEmailToConfirm"

  redirect(`/login?notice=${notice}`)
}
