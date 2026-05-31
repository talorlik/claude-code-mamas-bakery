import { useTranslations } from "next-intl"

/**
 * Visit Us: Location / Hours / Contact columns (placeholder details via
 * i18n). Three-column on desktop, stacked on mobile.
 */
export function VisitSection() {
  const t = useTranslations("home.visit")

  const cols = [
    { label: t("locationLabel"), value: t("locationValue") },
    { label: t("hoursLabel"), value: t("hoursValue") },
    { label: t("contactLabel"), value: t("contactValue") },
  ]

  return (
    <section>
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {cols.map((col) => (
            <div key={col.label}>
              <h3 className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                {col.label}
              </h3>
              <p className="mt-2 text-muted-foreground">{col.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
