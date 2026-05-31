import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

/**
 * Site-wide footer (Atelier Bakery). Rendered once in the locale layout
 * below the page content. Wordmark + primary nav links + copyright, on the
 * dark Oven-Black band. Copy is localized; spacing uses logical utilities
 * so the layout mirrors correctly in RTL.
 */
export function SiteFooter() {
  const t = useTranslations("footer")
  const nav = useTranslations("nav")

  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl font-medium">{nav("home")}</p>
          <p className="mt-2 text-sm text-background/70">{t("tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/menu" className="hover:underline">
            {t("menu")}
          </Link>
          <Link href="/about" className="hover:underline">
            {t("about")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-background/15">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-background/60">
          &copy; 2026 {nav("home")}. {t("rights")}
        </div>
      </div>
    </footer>
  )
}
