import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import {
  getAvailableProducts,
  categoriesOf,
} from "@/lib/products/product-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { MenuGrid } from "@/components/menu/menu-grid"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "menu" })
  return { title: t("title"), description: t("description") }
}

/**
 * Public menu page. Server-fetches available products (RLS-filtered) and hands
 * them to the client grid for category filtering and add-to-cart.
 */
export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("menu")

  const products = await getAvailableProducts()
  const categories = categoriesOf(products)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">{t("heading")}</h1>
      <MenuGrid
        products={products}
        categories={categories}
        locale={locale as Locale}
      />
    </main>
  )
}
