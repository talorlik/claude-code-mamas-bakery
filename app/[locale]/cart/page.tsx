import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { CartView } from "./cart-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "cart" })
  return { title: t("title"), robots: { index: false, follow: false } }
}

/**
 * Cart page. The interactive body is a client component reading the cart
 * context; this server page only sets metadata and the heading.
 */
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <CartView />
    </main>
  )
}
