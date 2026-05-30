"use client"

import * as React from "react"

import type { Cart, CartItem } from "@/lib/cart/cart-types"
import {
  addItem,
  removeItem,
  setQuantity,
  increaseQuantity,
  decreaseQuantity,
  cartTotal,
  cartItemCount,
} from "@/lib/cart/cart-utils"

const STORAGE_KEY = "mb-cart-v1"

type CartContextValue = {
  cart: Cart
  /** True once the cart has been read from localStorage on the client. */
  hydrated: boolean
  add: (item: CartItem, quantity?: number) => void
  remove: (productId: string) => void
  setItemQuantity: (productId: string, quantity: number) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = React.createContext<CartContextValue | null>(null)

/**
 * Reads the persisted cart from localStorage, tolerating malformed data.
 */
function readStoredCart(): Cart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Cart) : []
  } catch {
    return []
  }
}

/**
 * Provides cart state to client components, persisted to localStorage.
 *
 * The cart starts empty on the server and during the first client render to
 * avoid a hydration mismatch; it is populated from localStorage in an effect
 * after mount (`hydrated` flips true). All mutations go through the pure cart
 * utilities and are written back to localStorage.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<Cart>([])
  const [hydrated, setHydrated] = React.useState(false)

  // Load once on mount. Reading localStorage must happen after mount to avoid a
  // hydration mismatch, so the synchronous sets here are intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setCart(readStoredCart())
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist after hydration so the empty initial state does not clobber storage.
  React.useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // Ignore quota or availability errors; the cart still works in-memory.
    }
  }, [cart, hydrated])

  const value = React.useMemo<CartContextValue>(
    () => ({
      cart,
      hydrated,
      add: (item, quantity = 1) => setCart((c) => addItem(c, item, quantity)),
      remove: (productId) => setCart((c) => removeItem(c, productId)),
      setItemQuantity: (productId, quantity) =>
        setCart((c) => setQuantity(c, productId, quantity)),
      increment: (productId) => setCart((c) => increaseQuantity(c, productId)),
      decrement: (productId) => setCart((c) => decreaseQuantity(c, productId)),
      clear: () => setCart([]),
      total: cartTotal(cart),
      count: cartItemCount(cart),
    }),
    [cart, hydrated]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * Accesses the cart context. Must be used within a {@link CartProvider}.
 */
export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return ctx
}
