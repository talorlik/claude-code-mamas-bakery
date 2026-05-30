import { defineRouting } from "next-intl/routing"

/**
 * App routing configuration for next-intl.
 *
 * Two locales: English (default, LTR) and Hebrew (RTL). `localeDetection` lets
 * the middleware pick a locale from the `Accept-Language` header on a visitor's
 * first request, after which the choice is persisted in a cookie; only when no
 * language preference is signalled does the default (English) apply. Locale is
 * carried in the URL via the `[locale]` segment (e.g. `/en/menu`, `/he/menu`).
 */
export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
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
