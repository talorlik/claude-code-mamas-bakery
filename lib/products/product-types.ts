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
  stockQuantity: string | number
  lowStockThreshold: string | number
}

/**
 * Whether a product is at or below its low-stock threshold. A threshold of 0
 * means "never flag", so a product is only low when the threshold is positive.
 */
export function isLowStock(product: Product): boolean {
  return (
    product.low_stock_threshold > 0 &&
    product.stock_quantity <= product.low_stock_threshold
  )
}
