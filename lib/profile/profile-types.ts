import type { Tables } from "@/lib/supabase/database.types"

/**
 * A customer profile row exactly as stored in the database.
 */
export type Profile = Tables<"profiles">

/**
 * Editable profile fields submitted from the account page, before validation.
 */
export interface ProfileInput {
  fullName: string
  phone: string
}
