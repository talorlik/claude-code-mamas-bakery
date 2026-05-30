"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import type { CartItem } from "@/lib/cart/cart-types"
import { lineTotal } from "@/lib/cart/cart-utils"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"

/**
 * A single editable cart line: name, unit price, quantity stepper, remove
 * button, and line total. All mutations go through the cart context.
 */
export function CartItemRow({ item }: { item: CartItem }) {
  const t = useTranslations("cart")
  const { increment, decrement, remove } = useCart()

  return (
    <div className="flex items-center gap-4 border-b py-4 last:border-b-0">
      <div className="hidden size-14 shrink-0 items-center justify-center overflow-hidden rounded bg-muted sm:flex">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={t("decrease")}
          onClick={() => decrement(item.productId)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span
          className="w-8 text-center tabular-nums"
          aria-label={t("quantity")}
        >
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label={t("increase")}
          onClick={() => increment(item.productId)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-20 text-end font-medium tabular-nums">
        {formatPrice(lineTotal(item))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        aria-label={t("remove")}
        onClick={() => remove(item.productId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
