import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { resolveAuthMessage } from "@/lib/auth/resolve-auth-message"
import { setNewPassword } from "./actions"
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

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, sp] = await Promise.all([
    getTranslations("auth"),
    searchParams,
  ])

  // The action redirects back with `?error=<code>`, where the code is an
  // `auth.*` translation key. Resolve it in the active locale.
  const errorMessage = resolveAuthMessage(t, sp.error)

  // The recovery link routes through /auth/confirm, which establishes a
  // session before redirecting here. Without one the link was invalid, expired,
  // or already used, so bounce back to the request form with an explanation.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect({
      href: `/forgot-password?error=${encodeURIComponent(t("resetLinkInvalid"))}`,
      locale,
    })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("newPassword")}</CardTitle>
          <CardDescription>{t("newPasswordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={setNewPassword} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder={t("passwordHint")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder={t("passwordHint")}
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              {t("setNewPassword")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
