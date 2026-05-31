import { setRequestLocale } from "next-intl/server"

import type { Locale } from "@/lib/orders/order-formatting"
import { getAvailableProducts } from "@/lib/products/product-queries"
import { HeroSection } from "@/components/home/hero-section"
import { SignatureCollection } from "@/components/home/signature-collection"
import { ArtisanPrinciples } from "@/components/home/artisan-principles"
import { SeasonalFeature } from "@/components/home/seasonal-feature"
import { AboutBlurb } from "@/components/home/about-blurb"
import { VisitSection } from "@/components/home/visit-section"

/**
 * Atelier Bakery homepage: an editorial landing page. Server-fetches the
 * newest available products for the Signature Collection and composes the
 * section components in order. Shared header/footer live in the locale
 * layout. All copy is localized; the page itself holds no marketing strings.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const products = await getAvailableProducts()
  const signature = products.slice(0, 3)

  return (
    <main className="flex-1">
      <HeroSection />
      <SignatureCollection products={signature} locale={locale as Locale} />
      <ArtisanPrinciples />
      <SeasonalFeature />
      <AboutBlurb />
      <VisitSection />
    </main>
  )
}
