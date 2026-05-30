import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { resolveAuthMessage } from "@/lib/auth/resolve-auth-message"
import { requestPasswordReset } from "./actions"
import { CaptchaField } from "@/components/shared/captcha-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; notice?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, sp] = await Promise.all([
    getTranslations("auth"),
    searchParams,
  ])

  // Actions redirect with `auth.*` codes; resolve to localized text for display.
  const errorMessage = resolveAuthMessage(t, sp.error)
  const noticeMessage = resolveAuthMessage(t, sp.notice)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("resetTitle")}</CardTitle>
          <CardDescription>{t("resetSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={requestPasswordReset}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <CaptchaField />

            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}
            {noticeMessage ? (
              <p className="text-sm text-muted-foreground">{noticeMessage}</p>
            ) : null}

            <Button type="submit" className="w-full">
              {t("sendResetLink")}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/login" className="hover:underline">
              {t("backToSignIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
