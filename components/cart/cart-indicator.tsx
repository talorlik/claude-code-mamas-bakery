"use client"

import { ShoppingCart } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"

/**
 * Cart link with a live item-count badge. Renders the count only after the
 * cart hydrates from localStorage, so server and first client render agree.
 */
export function CartIndicator() {
  const t = useTranslations("nav")
  const { count, hydrated } = useCart()

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm hover:bg-accent hover:underline"
      aria-label={t("cart")}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>{t("cart")}</span>
      {hydrated && count > 0 ? (
        <Badge variant="default" className="ms-1 px-1.5 py-0 text-xs">
          {count}
        </Badge>
      ) : null}
    </Link>
  )
}
