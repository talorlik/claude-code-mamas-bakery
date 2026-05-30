import { getRequestConfig } from "next-intl/server"
import { hasLocale } from "next-intl"

import { routing } from "@/i18n/routing"

/**
 * Per-request next-intl configuration. Resolves the active locale from the
 * `[locale]` segment, falling back to the default when absent or invalid, and
 * loads the matching message dictionary.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
