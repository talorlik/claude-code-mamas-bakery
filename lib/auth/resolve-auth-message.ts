/**
 * Resolves an auth notice/error code carried in a URL query param to a
 * localized, user-facing string.
 *
 * Auth server actions redirect with stable codes (e.g. `invalidCredentials`,
 * `resetLinkSent`) rather than literal English, so the message can be rendered
 * in the active locale. Only codes that exist as `auth.*` translation keys are
 * rendered; anything else (an unknown or hand-crafted query param) yields
 * `null` and renders nothing. The query param is never echoed back verbatim, so
 * a forged `?error=...` cannot reflect arbitrary text into the page.
 *
 * `t` must be the `auth`-namespaced translator (`getTranslations("auth")` or
 * `useTranslations("auth")`); both expose the `has` guard used here.
 */
type AuthTranslator = {
  (key: string): string
  has: (key: string) => boolean
}

export function resolveAuthMessage(
  t: AuthTranslator,
  code: string | undefined
): string | null {
  if (!code || !t.has(code)) return null
  return t(code)
}
