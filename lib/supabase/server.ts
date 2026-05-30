import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import {
  REMEMBER_FLAG,
  SESSION_ONLY,
  isAuthCookie,
  stripPersistence,
} from "@/lib/supabase/cookie-persistence"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            // When the user opted out of persistent login, force the auth
            // cookies to session scope on every write so they vanish on
            // browser close. The flag is read fresh each call so a choice made
            // earlier in the same request is honored.
            const sessionOnly =
              cookieStore.get(REMEMBER_FLAG)?.value === SESSION_ONLY
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                sessionOnly && isAuthCookie(name)
                  ? stripPersistence(options)
                  : options
              )
            )
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Admin client does not persist sessions.
        },
      },
    }
  )
}
