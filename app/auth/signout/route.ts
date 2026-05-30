import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

import { routing } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"

/**
 * Signs the current user out, clears the session cookies, flushes the
 * server-rendered caches that read the user, and redirects to the login page.
 *
 * Signs out unconditionally: a missing session is a no-op, and calling signOut
 * still scrubs any stale auth cookies.
 */
async function signOutAndRedirect(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Flush server-rendered caches that read the user so no stale authed UI
  // survives the redirect.
  revalidatePath("/", "layout")

  // Redirect to an explicitly locale-prefixed login so the response never
  // re-enters next-intl's locale-redirect (which would add a hop and could land
  // on the wrong locale). The sign-out form supplies `?locale=` with the user's
  // active locale; a typed URL omits it (or sends junk), so fall back to the
  // routing default. Validating against `routing.locales` keeps a bad param from
  // producing a broken path.
  const param = req.nextUrl.searchParams.get("locale")
  const locale = routing.locales.includes(
    param as (typeof routing.locales)[number]
  )
    ? param
    : routing.defaultLocale
  return NextResponse.redirect(new URL(`/${locale}/login`, req.url), {
    status: 302,
  })
}

/**
 * POST /auth/signout - the primary path, used by the sign-out form. POST means
 * the action cannot be triggered by a cross-site navigation or prefetch.
 */
export async function POST(req: NextRequest) {
  return signOutAndRedirect(req)
}

/**
 * GET /auth/signout - convenience path so typing the URL signs the user out
 * instead of dead-ending on a 404. Browsers do not prefetch top-level
 * navigations to this path, and signing out is idempotent, so the CSRF surface
 * is limited to a benign forced logout.
 */
export async function GET(req: NextRequest) {
  return signOutAndRedirect(req)
}
