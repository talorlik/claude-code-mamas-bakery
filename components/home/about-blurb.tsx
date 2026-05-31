import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

/**
 * Centered brand statement ("Our Bakery") linking to the about page.
 */
export function AboutBlurb() {
  const t = useTranslations("home.about")

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <p className="mt-6 font-display text-2xl leading-relaxed font-light">
          {t("statement")}
        </p>
        <Link
          href="/about"
          className="mt-8 inline-block border-b border-foreground pb-0.5 text-sm font-semibold"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  )
}
