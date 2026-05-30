"use client"

import { useRef, useState } from "react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"

/**
 * Cloudflare Turnstile CAPTCHA field for auth forms.
 *
 * The widget solves a challenge in the browser and yields a short-lived token.
 * Rather than restructure the existing server-action forms (which submit via
 * `action={serverAction}` and read `FormData`), the token is mirrored into a
 * hidden `<input name="captchaToken">`, so the enclosing form carries it to the
 * server action unchanged. The action forwards it to Supabase as
 * `options.captchaToken`, which Supabase verifies against the secret key.
 *
 * Degrades gracefully: when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset (local
 * dev without captcha), nothing is rendered and no hidden input is emitted, so
 * forms keep working. This mirrors the rate limiter's no-op-when-unconfigured
 * behavior and assumes Supabase's "Enable CAPTCHA protection" is only turned on
 * once the site key is configured.
 *
 * On expiry or error the token is cleared so a stale token is never submitted;
 * Supabase would reject it anyway, but clearing keeps the submit button gating
 * honest. Tokens are single-use, so callers redirecting back on error get a
 * fresh widget on the remounted form.
 */
export function CaptchaField() {
  const t = useTranslations("auth")
  const locale = useLocale()
  const { resolvedTheme } = useTheme()
  const ref = useRef<TurnstileInstance | null>(null)
  const [token, setToken] = useState("")
  const [errored, setErrored] = useState(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) return null

  return (
    <div className="flex flex-col gap-2">
      {/* Carries the token into the form's FormData for the server action. */}
      <input type="hidden" name="captchaToken" value={token} />
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{
          // Follow the app's resolved theme; "auto" would track the OS, not
          // the in-app toggle.
          theme: resolvedTheme === "dark" ? "dark" : "light",
          // Turnstile uses "en"/"he" language codes, matching our locales.
          language: locale,
        }}
        onSuccess={(value) => {
          setToken(value)
          setErrored(false)
        }}
        onExpire={() => {
          setToken("")
          ref.current?.reset()
        }}
        onError={() => {
          setToken("")
          setErrored(true)
        }}
      />
      {errored ? (
        <p className="text-sm text-destructive" role="alert">
          {t("captchaError")}
        </p>
      ) : null}
    </div>
  )
}
