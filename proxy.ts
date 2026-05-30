import createMiddleware from "next-intl/middleware"
import { type NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { updateSession } from "@/lib/supabase/middleware"

const handleI18nRouting = createMiddleware(routing)

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
