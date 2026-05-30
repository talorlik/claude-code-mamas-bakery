import { ArrowRight, Croissant } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Link } from "@/i18n/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

/**
 * Bakery landing page. The shared header (nav, language, theme, auth state)
 * lives in the locale layout, so this page focuses on the hero and primary
 * call to action. All copy is localized.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("home")

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <Badge variant="secondary" className="rounded-full">
        <Croissant className="me-1 h-4 w-4" />
        {t("tagline")}
      </Badge>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
          {t("description")}
        </p>
      </div>

      <Link href="/menu" className={buttonVariants({ size: "lg" })}>
        {t("browseMenu")}
        <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
      </Link>
    </main>
  )
}
