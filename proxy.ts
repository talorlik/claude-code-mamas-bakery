import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { updateSession } from "@/lib/supabase/middleware"
import { checkRateLimit, type RateLimitBucket } from "@/lib/rate-limit/limiter"
import { clientIpFromHeaders } from "@/lib/rate-limit/client-ip"

const handleI18nRouting = createMiddleware(routing)

/**
 * Maps a request to a rate-limit bucket, or null when it should not be limited.
 *
 * Only mutating POSTs to sensitive, locale-prefixed surfaces are limited:
 * sign-in/up (cart submit and login share the page-level POST), password reset
 * requests, and order submission (a Server Action POST to /cart). The path may
 * carry a locale prefix (e.g. /he/login), so matching is suffix-based.
 */
function bucketForRequest(request: NextRequest): RateLimitBucket | null {
  if (request.method !== "POST") return null
  const path = request.nextUrl.pathname
  if (path.endsWith("/login")) return "auth"
  if (path.endsWith("/forgot-password") || path.endsWith("/reset-password")) {
    return "passwordReset"
  }
  if (path.endsWith("/cart")) return "order"
  return null
}

/**
 * Combined middleware: next-intl locale routing first, then Supabase session
 * refresh and route protection.
 *
 * next-intl resolves the locale (detecting it from Accept-Language on a first
 * visit, persisting it in a cookie) and may redirect to add a locale prefix.
 * When it redirects we return immediately - the next request runs the full
 * pipeline. Otherwise we hand its response to `updateSession`, which refreshes
 * the auth session and layers its cookies onto the same response, so locale
 * and auth cookies are emitted together.
 */
export async function proxy(request: NextRequest) {
  const i18nResponse = handleI18nRouting(request)

  // A locale redirect (e.g. `/menu` -> `/he/menu`) supersedes auth handling for
  // this request; let the redirected request run the full pipeline.
  if (i18nResponse.headers.has("location")) {
    return i18nResponse
  }

  // Rate-limit sensitive POSTs before touching the session. No-ops when Upstash
  // is unconfigured. Over the limit returns 429 with Retry-After.
  const bucket = bucketForRequest(request)
  if (bucket) {
    const ip = clientIpFromHeaders(request.headers)
    const { success, retryAfter } = await checkRateLimit(bucket, ip)
    if (!success) {
      return new NextResponse("Too many requests. Please try again shortly.", {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      })
    }
  }

  return updateSession(request, i18nResponse)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (own auth handling)
     * - auth routes (non-localized Supabase handlers: signout, confirm).
     *   Excluded so next-intl does not locale-redirect them into the
     *   `[locale]` segment, where no route exists (a 307 -> 404 on the
     *   sign-out form POST).
     * - _next/static, _next/image (Next assets)
     * - favicon.ico, public image files
     */
    "/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
