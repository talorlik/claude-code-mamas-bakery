import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import {
  REMEMBER_FLAG,
  SESSION_ONLY,
  isAuthCookie,
  stripPersistence,
} from "@/lib/supabase/cookie-persistence"

/**
 * Strips a leading locale segment (e.g. `/he/profile` -> `/profile`) so route
 * protection can be expressed against unprefixed paths. Returns `/` when the
 * path is just the locale root.
 */
function stripLocale(pathname: string): string {
  const segments = pathname.split("/")
  if (
    routing.locales.includes(segments[1] as (typeof routing.locales)[number])
  ) {
    const rest = "/" + segments.slice(2).join("/")
    return rest === "/" ? "/" : rest.replace(/\/$/, "")
  }
  return pathname
}

/**
 * Refreshes the Supabase session and enforces route protection, layering its
 * cookies onto an existing response (the one produced by the next-intl
 * middleware) so locale routing and auth cookies are emitted together.
 *
 * Protection is evaluated against the locale-stripped path: home, login, the
 * auth handlers, the error page, and API routes are public; everything else
 * requires a signed-in user and redirects to a locale-aware login otherwise.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabaseResponse = response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // When the user opted out of persistent login, strip expiry from the
          // auth cookies on the response write (the Set-Cookie the browser
          // receives). Without this, the per-request session refresh would
          // silently re-persist a session-only login.
          const sessionOnly =
            request.cookies.get(REMEMBER_FLAG)?.value === SESSION_ONLY
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              sessionOnly && isAuthCookie(name)
                ? stripPersistence(options)
                : options
            )
          )
        },
      },
    }
  )

  // IMPORTANT: do not run code between createServerClient and getUser.
  // getUser refreshes the session if expired; skipping it risks random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only a few routes require a session. Everything else - the menu, cart,
  // order lookup, login, auth handlers - is public, so guests can browse and
  // order. Expressed as a protected allowlist so new public pages are not
  // accidentally gated.
  const pathname = stripLocale(request.nextUrl.pathname)
  const isProtected =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/chat"

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone()
    // Preserve the active locale prefix when redirecting to login.
    const segments = request.nextUrl.pathname.split("/")
    const hasLocalePrefix = routing.locales.includes(
      segments[1] as (typeof routing.locales)[number]
    )
    loginUrl.pathname = hasLocalePrefix ? `/${segments[1]}/login` : "/login"
    loginUrl.search = ""
    loginUrl.searchParams.set("notice", "Please sign in to continue.")
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
