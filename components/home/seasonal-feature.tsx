import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"

/**
 * Seasonal feature: large placeholder image beside minimal serif copy.
 * Split two-column on desktop, stacked on mobile; mirrors correctly in RTL
 * because column order follows document flow.
 */
export function SeasonalFeature() {
  const t = useTranslations("home.seasonal")

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-0 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=70"
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center px-4 py-12 md:ps-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight">{t("title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("body")}</p>
          <div className="mt-6">
            <Link href="/menu" className={buttonVariants()}>
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
