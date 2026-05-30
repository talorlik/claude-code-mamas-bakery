import type { Database, Tables } from "@/lib/supabase/database.types"

/**
 * A product row exactly as stored in the database.
 */
export type Product = Tables<"products">

/**
 * The bakery product categories, mirroring the `product_category` enum.
 */
export type ProductCategory = Database["public"]["Enums"]["product_category"]

/**
 * The ordered list of supported product categories. Source of truth for
 * category select inputs and validation.
 */
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  "challah",
  "cake",
  "sweets",
  "other",
] as const

/**
 * Input accepted by product create/update actions, before server-side
 * validation. Strings model raw form values; `price` is parsed downstream.
 */
export interface ProductInput {
  name: string
  description: string
  price: string | number
  category: string
  imageUrl?: string | null
  isAvailable: boolean
}
