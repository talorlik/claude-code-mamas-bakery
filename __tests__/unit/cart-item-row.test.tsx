import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { NextIntlClientProvider } from "next-intl"

import { CartItemRow } from "@/components/cart/cart-item-row"
import { CartProvider, useCart } from "@/components/cart/cart-provider"
import type { CartItem } from "@/lib/cart/cart-types"
import enMessages from "@/messages/en.json"

const item: CartItem = {
  productId: "p1",
  name: "Classic Challah",
  price: 18,
  imageUrl: null,
  category: "challah",
  quantity: 2,
}

// Seeds the cart with one item, then renders its row plus a live total readout.
// Seeding waits for `hydrated` so the provider's mount-time localStorage load
// (which runs after child effects) cannot overwrite the seeded item.
function Harness() {
  const { add, cart, total, hydrated } = useCart()
  const seeded = React.useRef(false)
  React.useEffect(() => {
    if (seeded.current || !hydrated) return
    seeded.current = true
    add(item, item.quantity)
  }, [add, hydrated])
  const current = cart[0]
  return (
    <>
      {current ? <CartItemRow item={current} /> : <div>empty</div>}
      <div data-testid="total">{total}</div>
    </>
  )
}

function renderRow() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <CartProvider>
        <Harness />
      </CartProvider>
    </NextIntlClientProvider>
  )
}

describe("CartItemRow", () => {
  it("renders the name and line total", async () => {
    renderRow()
    // The cart seeds via an effect after mount; wait for the row to appear.
    expect(await screen.findByText("Classic Challah")).toBeInTheDocument()
    // 18 * 2 = 36
    expect(screen.getByText("₪36.00")).toBeInTheDocument()
  })

  it("increases quantity and updates the total", async () => {
    const user = userEvent.setup()
    renderRow()
    await user.click(
      await screen.findByRole("button", { name: /increase quantity/i })
    )
    expect(screen.getByTestId("total")).toHaveTextContent("54")
  })

  it("removes the item", async () => {
    const user = userEvent.setup()
    renderRow()
    await user.click(await screen.findByRole("button", { name: /remove/i }))
    expect(await screen.findByText("empty")).toBeInTheDocument()
  })
})
