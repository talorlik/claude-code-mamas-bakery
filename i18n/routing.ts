import { defineRouting } from "next-intl/routing"

/**
 * App routing configuration for next-intl.
 *
 * Two locales: Hebrew (default, RTL) and English (LTR). `localeDetection` lets
 * the middleware pick a locale from the `Accept-Language` header on a visitor's
 * first request, after which the choice is persisted in a cookie. Locale is
 * carried in the URL via the `[locale]` segment (e.g. `/he/menu`, `/en/menu`).
 */
export const routing = defineRouting({
  locales: ["he", "en"],
  defaultLocale: "he",
  localeDetection: true,
})

export type AppLocale = (typeof routing.locales)[number]

/**
 * Text direction for each locale, applied to the `<html dir>` attribute.
 */
export const LOCALE_DIRECTION: Record<AppLocale, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
}
