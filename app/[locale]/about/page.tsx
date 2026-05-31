import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

/**
 * About / Our Story (Atelier Bakery). Stub editorial page: brand statement
 * plus an ingredients-and-craft block. Copy is localized; the page extends
 * the locale base metadata with its own title.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "about" })
  return { title: t("title") }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("about")

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20">
      <h1 className="font-display text-4xl font-light tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-6 font-display text-2xl font-light text-muted-foreground">
        {t("lead")}
      </p>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {t("body")}
      </p>

      <div className="mt-16 border-t border-border pt-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("ingredientsEyebrow")}
        </p>
        <p className="mt-4 font-display text-xl font-light leading-relaxed">
          {t("ingredientsBody")}
        </p>
      </div>
    </main>
  )
}
