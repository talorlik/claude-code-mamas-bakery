import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import type { Locale } from "@/lib/orders/order-formatting"
import type { Product } from "@/lib/products/product-types"
import { ProductCard } from "@/components/menu/product-card"

/**
 * Signature Collection: the newest available products, shown with the
 * shared ProductCard. Presentational - the page fetches and slices the
 * list, this renders it. Degrades gracefully: with no products it still
 * shows the heading and the "view full menu" link, just no grid.
 */
export function SignatureCollection({
  products,
  locale,
}: {
  products: Product[]
  locale: Locale
}) {
  const t = useTranslations("home.signature")

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("sub")}</p>

        {products.length > 0 ? (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <Link
            href="/menu"
            className="inline-block border-b border-foreground pb-0.5 text-sm font-semibold"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}
