import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

/**
 * POST /auth/signout
 *
 * Signs the current user out and clears the session cookies, then redirects to
 * the login page. POST-only so the action cannot be triggered by a cross-site
 * navigation or prefetch. Signs out unconditionally: a missing session is a
 * no-op, and calling signOut still scrubs any stale auth cookies.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Flush server-rendered caches that read the user so no stale authed UI
  // survives the redirect.
  revalidatePath("/", "layout")
  return NextResponse.redirect(new URL("/login", req.url), { status: 302 })
}
