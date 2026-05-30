import type { Cart, CartItem } from "@/lib/cart/cart-types"

/**
 * Rounds a monetary amount to two decimal places, avoiding floating-point
 * drift (e.g. 0.1 * 3 = 0.30000000000000004 becomes 0.3).
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Returns the line total for a single cart item (price * quantity), rounded
 * to two decimals.
 */
export function lineTotal(item: CartItem): number {
  return round2(item.price * item.quantity)
}

/**
 * Adds a product to the cart. If the product is already present its quantity
 * is incremented by `quantity`; otherwise it is appended with `quantity`.
 * The new item is always added with exactly `quantity` (default 1),
 * regardless of the quantity field on the passed item. Pure: returns a new
 * cart and does not mutate the input.
 */
export function addItem(cart: Cart, item: CartItem, quantity = 1): Cart {
  const existing = cart.find((i) => i.productId === item.productId)
  if (existing) {
    return cart.map((i) =>
      i.productId === item.productId
        ? { ...i, quantity: i.quantity + quantity }
        : i
    )
  }
  return [...cart, { ...item, quantity }]
}

/**
 * Removes a product from the cart by id. Pure.
 */
export function removeItem(cart: Cart, productId: string): Cart {
  return cart.filter((i) => i.productId !== productId)
}

/**
 * Sets an explicit quantity for a product. A quantity of zero or below
 * removes the item. Pure.
 */
export function setQuantity(
  cart: Cart,
  productId: string,
  quantity: number
): Cart {
  if (quantity <= 0) {
    return removeItem(cart, productId)
  }
  return cart.map((i) => (i.productId === productId ? { ...i, quantity } : i))
}

/**
 * Increases a product's quantity by one. Pure.
 */
export function increaseQuantity(cart: Cart, productId: string): Cart {
  const item = cart.find((i) => i.productId === productId)
  if (!item) return cart
  return setQuantity(cart, productId, item.quantity + 1)
}

/**
 * Decreases a product's quantity by one, removing it if it would drop below
 * one. Pure.
 */
export function decreaseQuantity(cart: Cart, productId: string): Cart {
  const item = cart.find((i) => i.productId === productId)
  if (!item) return cart
  return setQuantity(cart, productId, item.quantity - 1)
}

/**
 * Sums all line totals in the cart, rounded to two decimals.
 */
export function cartTotal(cart: Cart): number {
  return round2(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))
}

/**
 * Returns the total number of units across all cart items.
 */
export function cartItemCount(cart: Cart): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}
