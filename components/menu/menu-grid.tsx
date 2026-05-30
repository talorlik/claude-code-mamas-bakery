"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { Search } from "lucide-react"

import type { Product, ProductCategory } from "@/lib/products/product-types"
import { categoryLabel } from "@/lib/products/product-formatting"
import { searchProducts } from "@/lib/products/product-filters"
import type { Locale } from "@/lib/orders/order-formatting"
import { ProductCard } from "@/components/menu/product-card"
import { EmptyState } from "@/components/shared/states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Client-side menu grid with category filtering. Receives the available
 * products and the distinct categories from the server and filters in memory,
 * so switching categories is instant and needs no refetch.
 */
export function MenuGrid({
  products,
  categories,
  locale,
}: {
  products: Product[]
  categories: ProductCategory[]
  locale: Locale
}) {
  const t = useTranslations("menu")
  const [active, setActive] = React.useState<ProductCategory | "all">("all")
  const [query, setQuery] = React.useState("")

  // Combine category and text filters (AND): narrow by category first, then by
  // the search query over name + description. Both run in memory, no refetch.
  const byCategory =
    active === "all" ? products : products.filter((p) => p.category === active)
  const filtered = searchProducts(byCategory, query)

  if (products.length === 0) {
    return <EmptyState title={t("empty")} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="ps-8"
        />
      </div>

      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={active === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActive("all")}
          >
            {t("allCategories")}
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={active === c ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(c)}
            >
              {categoryLabel(c, locale)}
            </Button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title={t("noResults")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
