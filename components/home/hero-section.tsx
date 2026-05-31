import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { buttonVariants } from "@/components/ui/button"

/**
 * Homepage hero (Atelier Bakery): full-bleed pastry photo, uppercase gold
 * eyebrow, serif display headline, supporting copy, and two CTAs (menu +
 * story). Image is an Unsplash placeholder via plain <img> (the project
 * pattern), swapped for real photography later.
 */
export function HeroSection() {
  const t = useTranslations("home.hero")

  return (
    <section className="border-b border-border">
      <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=70"
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 max-w-[16ch] text-4xl leading-[1.02] font-light tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[46ch] text-lg text-muted-foreground">
          {t("body")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/menu" className={buttonVariants({ size: "lg" })}>
            {t("ctaMenu")}
          </Link>
          <Link
            href="/about"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("ctaStory")}
          </Link>
        </div>
      </div>
    </section>
  )
}
