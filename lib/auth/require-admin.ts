import { redirect } from "@/i18n/navigation"
import { getLocale } from "next-intl/server"

import { getCurrentUserRole } from "@/lib/auth/roles"

/**
 * Server-side admin guard for use in admin layouts, pages, and actions.
 *
 * Redirects unauthenticated users to the login page and authenticated
 * non-admins to the home page. Returns the admin user's id when access is
 * granted. Because it `redirect()`s, callers can treat a normal return as
 * proof of admin access.
 *
 * This is the authoritative check. RLS on the data tables is a second layer;
 * never rely on RLS alone to gate admin UI.
 */
export async function requireAdmin(): Promise<string> {
  const { userId, isAdmin } = await getCurrentUserRole()
  const locale = await getLocale()

  if (!userId) {
    redirect({ href: "/login", locale })
    throw new Error("unreachable") // redirect() halts; satisfies control flow.
  }
  if (!isAdmin) {
    redirect({ href: "/", locale })
    throw new Error("unreachable")
  }

  return userId
}
