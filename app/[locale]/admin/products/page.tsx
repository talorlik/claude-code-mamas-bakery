import { getTranslations, setRequestLocale } from "next-intl/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getAllProducts } from "@/lib/products/product-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { ProductsManager } from "./products-manager"

/**
 * Admin product management page. Guarded by requireAdmin (the admin layout
 * also guards the subtree); fetches all products including unavailable ones.
 */
export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireAdmin()
  const t = await getTranslations("adminProducts")

  const products = await getAllProducts()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>
      <ProductsManager products={products} locale={locale as Locale} />
    </div>
  )
}
