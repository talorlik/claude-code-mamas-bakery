"use client"

import { useLocale, useTranslations } from "next-intl"
import { Languages } from "lucide-react"

import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type AppLocale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"

const LOCALE_LABELS: Record<AppLocale, string> = {
  he: "עברית",
  en: "EN",
}

/**
 * Toggles between the available locales, keeping the user on the current page.
 * next-intl's router rewrites the locale prefix and persists the choice in a
 * cookie, and the middleware flips `<html dir>` on the next render.
 */
export function LanguageSwitcher() {
  const t = useTranslations("nav")
  const locale = useLocale() as AppLocale
  const pathname = usePathname()
  const router = useRouter()

  const next =
    routing.locales.find((l) => l !== locale) ?? routing.defaultLocale

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t("language")}
      onClick={() => router.replace(pathname, { locale: next })}
      className="gap-1.5"
    >
      <Languages className="h-4 w-4" />
      {LOCALE_LABELS[next]}
    </Button>
  )
}
