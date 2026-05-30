import { describe, expect, it } from "vitest"
import {
  addItem,
  removeItem,
  setQuantity,
  increaseQuantity,
  decreaseQuantity,
  cartTotal,
  cartItemCount,
  lineTotal,
} from "@/lib/cart/cart-utils"
import type { Cart, CartItem } from "@/lib/cart/cart-types"

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    name: "Classic Challah",
    price: 18,
    imageUrl: null,
    category: "challah",
    quantity: 1,
    ...overrides,
  }
}

describe("addItem", () => {
  it("adds a new product to an empty cart with quantity 1", () => {
    const cart = addItem([], makeItem())
    expect(cart).toHaveLength(1)
    expect(cart[0]).toMatchObject({ productId: "p1", quantity: 1 })
  })

  it("increments quantity when the product is already in the cart", () => {
    const start: Cart = [makeItem({ quantity: 2 })]
    const cart = addItem(start, makeItem(), 3)
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(5)
  })

  it("does not mutate the input cart", () => {
    const start: Cart = [makeItem({ quantity: 1 })]
    addItem(start, makeItem())
    expect(start[0].quantity).toBe(1)
  })

  it("defaults the added quantity to 1", () => {
    const cart = addItem([], makeItem({ quantity: 9 }))
    expect(cart[0].quantity).toBe(1)
  })
})

describe("removeItem", () => {
  it("removes the matching product", () => {
    const start: Cart = [makeItem(), makeItem({ productId: "p2" })]
    const cart = removeItem(start, "p1")
    expect(cart).toHaveLength(1)
    expect(cart[0].productId).toBe("p2")
  })

  it("returns an equivalent cart when the product is absent", () => {
    const start: Cart = [makeItem()]
    expect(removeItem(start, "missing")).toEqual(start)
  })
})

describe("setQuantity", () => {
  it("sets an explicit quantity", () => {
    const start: Cart = [makeItem({ quantity: 1 })]
    expect(setQuantity(start, "p1", 4)[0].quantity).toBe(4)
  })

  it("removes the item when quantity drops to zero or below", () => {
    const start: Cart = [makeItem({ quantity: 1 })]
    expect(setQuantity(start, "p1", 0)).toHaveLength(0)
    expect(setQuantity(start, "p1", -2)).toHaveLength(0)
  })
})

describe("increaseQuantity / decreaseQuantity", () => {
  it("increases by one", () => {
    const start: Cart = [makeItem({ quantity: 2 })]
    expect(increaseQuantity(start, "p1")[0].quantity).toBe(3)
  })

  it("decreases by one", () => {
    const start: Cart = [makeItem({ quantity: 2 })]
    expect(decreaseQuantity(start, "p1")[0].quantity).toBe(1)
  })

  it("removes the item when decreased below one", () => {
    const start: Cart = [makeItem({ quantity: 1 })]
    expect(decreaseQuantity(start, "p1")).toHaveLength(0)
  })
})

describe("lineTotal / cartTotal / cartItemCount", () => {
  it("computes a line total from price and quantity", () => {
    expect(lineTotal(makeItem({ price: 18, quantity: 3 }))).toBe(54)
  })

  it("sums all line totals", () => {
    const cart: Cart = [
      makeItem({ price: 18, quantity: 2 }),
      makeItem({ productId: "p2", price: 45, quantity: 1 }),
    ]
    expect(cartTotal(cart)).toBe(81)
  })

  it("rounds the total to two decimals", () => {
    const cart: Cart = [makeItem({ price: 0.1, quantity: 3 })]
    expect(cartTotal(cart)).toBe(0.3)
  })

  it("counts total units across items", () => {
    const cart: Cart = [
      makeItem({ quantity: 2 }),
      makeItem({ productId: "p2", quantity: 3 }),
    ]
    expect(cartItemCount(cart)).toBe(5)
  })

  it("returns zero for an empty cart", () => {
    expect(cartTotal([])).toBe(0)
    expect(cartItemCount([])).toBe(0)
  })
})
