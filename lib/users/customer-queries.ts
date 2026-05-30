import { createAdminClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/require-admin"
import type { Customer } from "@/lib/users/customer-types"

// Single-page cap for the user list. Sufficient for this bakery's scale; a
// fuller result is logged rather than silently truncated.
const PER_PAGE = 1000

/**
 * Lists every registered account for the admin customers page, newest-first.
 *
 * Emails live only in `auth.users`, so the list is sourced from the privileged
 * `auth.admin.listUsers` (service-role) and enriched with the display name from
 * `profiles` and the admin flag from `user_roles`. Admin-guarded; the service
 * role bypasses RLS, so the guard is the authoritative access check.
 */
export async function listCustomers(): Promise<Customer[]> {
  await requireAdmin()

  const admin = await createAdminClient()

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: PER_PAGE,
  })
  if (error || !data) return []

  if (data.users.length === PER_PAGE) {
    // No pagination UI yet; surface the truncation instead of hiding it.
    console.warn(
      `listCustomers: hit the ${PER_PAGE}-user page cap; some customers are not shown.`
    )
  }

  const ids = data.users.map((u) => u.id)

  const [{ data: profiles }, { data: roles }] = await Promise.all([
    admin.from("profiles").select("user_id, full_name").in("user_id", ids),
    admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .in("user_id", ids),
  ])

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name])
  )
  const adminIds = new Set((roles ?? []).map((r) => r.user_id))

  return data.users
    .map((u) => ({
      id: u.id,
      email: u.email ?? "",
      fullName: nameById.get(u.id) ?? null,
      createdAt: u.created_at,
      emailConfirmed: Boolean(u.email_confirmed_at),
      isAdmin: adminIds.has(u.id),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
