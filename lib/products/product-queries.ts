import { createClient } from "@/lib/supabase/server"
import type { Product, ProductCategory } from "@/lib/products/product-types"

/**
 * Returns available products for the public menu, newest first.
 *
 * Reads through the request-scoped server client. The "Anyone can read
 * available products" RLS policy already restricts anon/authenticated reads to
 * `is_available = true`, but the filter is also applied explicitly so the query
 * is correct regardless of who calls it (an admin would otherwise see all).
 */
export async function getAvailableProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return data
}

/**
 * Returns every product, available or not, newest first, for the admin list.
 *
 * The "Admins can read all products" RLS policy permits this for admin callers;
 * the page is already guarded by `requireAdmin`, so non-admins never reach it.
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return data
}

/**
 * Returns the distinct categories present among available products, in the
 * canonical category order, for building menu filters.
 */
export function categoriesOf(products: Product[]): ProductCategory[] {
  const present = new Set(products.map((p) => p.category))
  const order: ProductCategory[] = ["challah", "cake", "sweets", "other"]
  return order.filter((c) => present.has(c))
}
