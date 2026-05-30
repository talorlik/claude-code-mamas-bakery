/**
 * Admin-facing view of a registered account. Built from `auth.users` (email,
 * id, timestamps) enriched with the `profiles` display name and `user_roles`
 * admin flag. Carries no secrets - safe to pass to the client.
 */
export type Customer = {
  id: string
  email: string
  fullName: string | null
  createdAt: string
  emailConfirmed: boolean
  isAdmin: boolean
}
