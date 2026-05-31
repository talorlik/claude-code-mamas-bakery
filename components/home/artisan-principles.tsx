import { useTranslations } from "next-intl"

/**
 * Three artisan-principle "craft circles" on a warm Parchment band. Static
 * copy; outlined circles echo the DESIGN.md craft-circle component.
 */
export function ArtisanPrinciples() {
  const t = useTranslations("home.principles")

  const items = [
    { title: t("handmadeTitle"), body: t("handmadeBody") },
    { title: t("fermentationTitle"), body: t("fermentationBody") },
    { title: t("ingredientsTitle"), body: t("ingredientsBody") },
  ]

  return (
    <section className="border-b border-border bg-muted">
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center"
            >
              <div className="flex aspect-square w-44 flex-col items-center justify-center rounded-full border border-border bg-background p-6">
                <h3 className="font-display text-lg">{item.title}</h3>
                <p className="mt-2 max-w-[18ch] text-sm text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
