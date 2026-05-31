"use client"

import { Croissant, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { Product } from "@/lib/products/product-types"
import { categoryLabel } from "@/lib/products/product-formatting"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"

/**
 * Menu product card (Atelier Bakery): photo-forward and borderless. Strong
 * 4:3 image, compact text below. Name in the display serif, description in
 * secondary text, plain-text price next to an add-to-cart button. Adding
 * dispatches into the cart context and confirms with a toast.
 *
 * The image is a plain <img> (not next/image) because image_url is
 * admin-supplied and arbitrary; this avoids maintaining a remote-host
 * allowlist in next.config.
 */
export function ProductCard({
  product,
  locale,
}: {
  product: Product
  locale: Locale
}) {
  const t = useTranslations("menu")
  const { add } = useCart()

  function handleAdd() {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      category: product.category,
      quantity: 1,
    })
    toast.success(t("added"), { description: product.name })
  }

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-card">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Croissant className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base leading-snug font-medium">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs tracking-wide text-muted-foreground uppercase">
            {categoryLabel(product.category, locale)}
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums">
          {formatPrice(product.price)}
        </span>
      </div>

      {product.description ? (
        <p className="mt-2 line-clamp-2 text-lg text-muted-foreground">
          {product.description}
        </p>
      ) : null}

      <Button
        size="sm"
        variant="outline"
        onClick={handleAdd}
        className="mt-3 self-start"
      >
        <Plus className="me-1 h-4 w-4" />
        {t("addToCart")}
      </Button>
    </div>
  )
}
