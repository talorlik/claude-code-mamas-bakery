import type { Product } from "@/lib/products/product-types"

/**
 * Filters products by a free-text query, matched case-insensitively against the
 * product name and description. An empty or whitespace-only query returns the
 * list unchanged. Pure and synchronous so the menu can filter in memory without
 * a server round-trip, matching the existing client-side category filtering.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return products
  return products.filter((p) => {
    const haystack = `${p.name} ${p.description}`.toLowerCase()
    return haystack.includes(needle)
  })
}
