import type { ProductCategory } from "@/lib/products/product-types"

/**
 * A single line in the customer's local cart. Holds the minimum product data
 * needed to render the cart and submit an order; price and availability are
 * re-validated server-side at submission time.
 */
export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  category: ProductCategory
  quantity: number
}

/**
 * The full cart: an ordered list of line items.
 */
export type Cart = CartItem[]
