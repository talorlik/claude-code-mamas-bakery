"use client"

import { Croissant, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { Product } from "@/lib/products/product-types"
import { categoryLabel } from "@/lib/products/product-formatting"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Menu product card: image (or a placeholder), name, category, description,
 * price, and an add-to-cart button. Adding dispatches into the cart context
 * and confirms with a toast.
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
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-muted">
        {product.image_url ? (
          // Plain img (not next/image): image_url is admin-supplied and arbitrary,
          // so this avoids maintaining a remote-host allowlist in next.config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Croissant className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{product.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {categoryLabel(product.category, locale)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {product.description ? (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <span className="font-semibold">{formatPrice(product.price)}</span>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="me-1 h-4 w-4" />
          {t("addToCart")}
        </Button>
      </CardFooter>
    </Card>
  )
}
