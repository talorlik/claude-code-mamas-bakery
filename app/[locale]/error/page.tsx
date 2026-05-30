import { getTranslations, setRequestLocale } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"

/**
 * Auth error page shown when an email-confirmation link is invalid or expired.
 */
export default async function ErrorPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("errorPage")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Link href="/login" className={buttonVariants()}>
        {t("backToSignIn")}
      </Link>
    </div>
  )
}
