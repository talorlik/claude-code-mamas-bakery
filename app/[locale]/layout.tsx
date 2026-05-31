import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import localFont from "next/font/local"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale, getTranslations } from "next-intl/server"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/components/cart/cart-provider"
import { SiteHeader } from "@/components/shared/site-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { Toaster } from "@/components/ui/sonner"
import { routing, LOCALE_DIRECTION, type AppLocale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

// Fraunces: high-contrast serif for editorial display/headings (Atelier
// Bakery). Body and UI stay on Inter. Self-hosted (next/font/local) rather
// than next/font/google: under Next 16 + Turbopack the Google loader emitted
// no CSS for this face, leaving headings on the Inter fallback. The variable
// woff2 (full 300-600 weight + opsz axes, latin) lives in app/fonts and has
// no build-time network dependency.
const fraunces = localFont({
  src: [
    {
      path: "../fonts/fraunces-latin.woff2",
      style: "normal",
      weight: "300 600",
    },
  ],
  display: "swap",
  variable: "--font-fraunces",
})

/**
 * Pre-render both locales at build time.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/**
 * Localized base metadata. Per-route pages extend this with their own titles.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "home" })
  return {
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering for this request.
  setRequestLocale(locale)

  const dir = LOCALE_DIRECTION[locale as AppLocale]

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fraunces.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <CartProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
              <Toaster
                richColors
                position={dir === "rtl" ? "top-left" : "top-right"}
              />
            </CartProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
