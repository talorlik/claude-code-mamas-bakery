import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { LoginTabs } from "./login-tabs"
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

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    error?: string
    notice?: string
    tab?: string
    redirect?: string
  }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, tCommon, sp] = await Promise.all([
    getTranslations("auth"),
    getTranslations("common"),
    searchParams,
  ])

  // Honor ?tab=signup so links from the landing page land on the right tab.
  const defaultTab = sp.tab === "signup" ? "signup" : "signin"
  // Only a same-site path is forwarded as the post-login redirect target.
  const redirectTo =
    sp.redirect && sp.redirect.startsWith("/") && !sp.redirect.startsWith("//")
      ? sp.redirect
      : undefined

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("welcome")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginTabs
            error={sp.error}
            notice={sp.notice}
            defaultTab={defaultTab}
            redirectTo={redirectTo}
          />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              {tCommon("backToHome")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
