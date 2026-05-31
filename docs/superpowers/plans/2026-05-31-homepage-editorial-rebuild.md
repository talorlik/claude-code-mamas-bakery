# Homepage Editorial Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage into a 7-section editorial landing page (hero, signature collection, artisan principles, seasonal feature, about blurb, visit, footer), add a stub `/about` page, and add the site's first footer - all fully bilingual (EN/HE) on the Atelier Bakery foundation.

**Architecture:** A slim server `page.tsx` fetches the newest available products once via the existing `getAvailableProducts()` and composes focused presentational section components under `components/home/`. A new `SiteFooter` is rendered once in the locale layout. A new stub `/about` route reuses the brand statement. All copy lives in `messages/{en,he}.json`; headings use the Fraunces serif from the foundation; images are plain `<img>` Unsplash placeholders; spacing is logical for RTL.

**Tech Stack:** Next.js 16 App Router (server components), React 19, Tailwind v4 + Base UI, next-intl (`@/i18n/navigation` Link, `getTranslations`/`useTranslations`), Vitest 4 + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-05-31-homepage-editorial-rebuild-design.md` (Spec 2 of 5).

---

## Reference: established patterns (use verbatim)

- Product query: `getAvailableProducts(): Promise<Product[]>` from
  `@/lib/products/product-queries` (available-only, newest-first).
- Card: `ProductCard({ product: Product, locale: Locale })` from
  `@/components/menu/product-card` (client component, borderless).
- `Product` from `@/lib/products/product-types`; `Locale = "en" | "he"`
  from `@/lib/orders/order-formatting`.
- Locale-aware nav: `import { Link } from "@/i18n/navigation"`.
- Server page shape:
  ```tsx
  export default async function X({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)            // from "next-intl/server"
    const t = await getTranslations("home")
    ...
  }
  ```
- Component test shape (Vitest, jsdom):
  ```tsx
  import { render, screen } from "@testing-library/react"
  import { NextIntlClientProvider } from "next-intl"
  import enMessages from "@/messages/en.json"
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <Component .../>
    </NextIntlClientProvider>
  )
  ```
- Foundation styling: serif headings via `h1/h2/h3` (automatic) or
  `.font-display`; eyebrow = `text-xs uppercase tracking-[0.2em] text-accent font-semibold`;
  warm bands via `bg-muted`; plain `<img>` with
  `// eslint-disable-next-line @next/next/no-img-element`, `object-cover`,
  `loading="lazy"`.

Unsplash placeholder URLs (stable, swap-later):
- Hero: `https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=70` (bread/pastry)
- Seasonal: `https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=70` (tart/berries)

---

## Task 1: Add EN i18n keys

Add all new homepage/about/footer copy to English first, so every later
component has real keys to read.

**Files:**
- Modify: `messages/en.json`

- [ ] **Step 1: Extend the `home` object and add `about` + `footer`**

In `messages/en.json`, replace the existing `"home": { ... }` object with
the following (keeps `title`, `description`, `browseMenu`; drops the
now-unused `tagline`/`getStarted` from the homepage but they may remain -
leaving them is harmless, so keep them):

```json
  "home": {
    "title": "Mom's Bread - Boutique Bakery Orders",
    "description": "Order fresh challah, cakes, and sweets from Mom's Bread.",
    "tagline": "Fresh from the oven, made to order.",
    "browseMenu": "Browse the menu",
    "getStarted": "Get started",
    "hero": {
      "eyebrow": "Artisan Baking",
      "title": "Fresh pastries, crafted every morning.",
      "body": "French technique, neighborhood warmth. Challah, cakes, and sweets, made to order.",
      "ctaMenu": "View the Menu",
      "ctaStory": "Our Story"
    },
    "signature": {
      "eyebrow": "Signature Collection",
      "title": "This week from the oven",
      "sub": "Our newest bakes, available now.",
      "viewAll": "View full menu"
    },
    "principles": {
      "eyebrow": "Artisan Principles",
      "handmadeTitle": "Handmade",
      "handmadeBody": "Shaped by hand, every day.",
      "fermentationTitle": "Natural Fermentation",
      "fermentationBody": "Slow-proofed for depth of flavor.",
      "ingredientsTitle": "Premium Ingredients",
      "ingredientsBody": "Butter, stone-milled flour, seasonal fruit."
    },
    "seasonal": {
      "eyebrow": "Seasonal Selection",
      "title": "Strawberry Mille-Feuille",
      "body": "Available through June.",
      "cta": "Order now"
    },
    "about": {
      "eyebrow": "Our Bakery",
      "statement": "Contemporary artisan baking, presented with the precision of a design studio and the warmth of a neighborhood bakery.",
      "cta": "Read our story"
    },
    "visit": {
      "eyebrow": "Visit Us",
      "locationLabel": "Location",
      "locationValue": "14 Levontin Street, Tel Aviv",
      "hoursLabel": "Hours",
      "hoursValue": "Sun-Fri 7:00-19:00, Sat closed",
      "contactLabel": "Contact",
      "contactValue": "hello@atelierbakery.co.il"
    }
  },
```

Then add two new top-level namespaces (place them after the `home`
object, before the next existing key, valid JSON commas):

```json
  "about": {
    "title": "Our Story",
    "lead": "The Architecture of Artisan Baking.",
    "body": "Atelier Bakery is contemporary artisan baking, presented with the precision of a design studio and the warmth of a neighborhood bakery. We bake in small batches every morning - challah, cakes, and sweets - using French technique and patient fermentation.",
    "ingredientsEyebrow": "Ingredients & Craft",
    "ingredientsBody": "French butter. Stone-milled flour. Seasonal fruit. Nothing unnecessary."
  },
  "footer": {
    "tagline": "Crafted daily. Presented with precision.",
    "menu": "Menu",
    "about": "Our Story",
    "order": "Order",
    "visit": "Visit",
    "rights": "All rights reserved."
  },
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('en ok')"`
Expected: `en ok`

- [ ] **Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat(home): add English copy for editorial homepage, about, footer"
```

---

## Task 2: Add HE i18n keys (parity)

Mirror every new key into Hebrew. next-intl throws on missing keys for a
locale, so parity is mandatory.

**Files:**
- Modify: `messages/he.json`

- [ ] **Step 1: Extend the `home` object and add `about` + `footer` (Hebrew)**

In `messages/he.json`, replace the existing `"home": { ... }` object with:

```json
  "home": {
    "title": "הלחם של אמא - הזמנות ממאפייה בוטיק",
    "description": "הזמינו חלות, עוגות וקינוחים טריים מהלחם של אמא.",
    "tagline": "טרי מהתנור, מוכן בהזמנה.",
    "browseMenu": "לתפריט",
    "getStarted": "התחילו כאן",
    "hero": {
      "eyebrow": "אפייה אומנותית",
      "title": "מאפים טריים, נאפים כל בוקר.",
      "body": "טכניקה צרפתית, חמימות שכונתית. חלות, עוגות וקינוחים, מוכנים בהזמנה.",
      "ctaMenu": "לתפריט",
      "ctaStory": "הסיפור שלנו"
    },
    "signature": {
      "eyebrow": "הקולקציה החתומה",
      "title": "השבוע מהתנור",
      "sub": "המאפים החדשים שלנו, זמינים עכשיו.",
      "viewAll": "לתפריט המלא"
    },
    "principles": {
      "eyebrow": "עקרונות האומנות",
      "handmadeTitle": "עבודת יד",
      "handmadeBody": "מעוצב ביד, כל יום.",
      "fermentationTitle": "תסיסה טבעית",
      "fermentationBody": "התפחה איטית לעומק טעם.",
      "ingredientsTitle": "חומרי גלם מובחרים",
      "ingredientsBody": "חמאה, קמח טחון באבן, פירות העונה."
    },
    "seasonal": {
      "eyebrow": "מבחר העונה",
      "title": "מיל-פיי תות",
      "body": "זמין עד סוף יוני.",
      "cta": "להזמנה"
    },
    "about": {
      "eyebrow": "המאפייה שלנו",
      "statement": "אפייה אומנותית עכשווית, המוגשת בדיוק של סטודיו עיצוב ובחמימות של מאפיית שכונה.",
      "cta": "לסיפור המלא"
    },
    "visit": {
      "eyebrow": "בקרו אותנו",
      "locationLabel": "מיקום",
      "locationValue": "רחוב לבונטין 14, תל אביב",
      "hoursLabel": "שעות",
      "hoursValue": "א'-ו' 7:00-19:00, שבת סגור",
      "contactLabel": "יצירת קשר",
      "contactValue": "hello@atelierbakery.co.il"
    }
  },
```

Then add the two new namespaces (Hebrew):

```json
  "about": {
    "title": "הסיפור שלנו",
    "lead": "הארכיטקטורה של אפייה אומנותית.",
    "body": "מאפיית אטלייה היא אפייה אומנותית עכשווית, המוגשת בדיוק של סטודיו עיצוב ובחמימות של מאפיית שכונה. אנו אופים במנות קטנות כל בוקר - חלות, עוגות וקינוחים - בטכניקה צרפתית ובתסיסה סבלנית.",
    "ingredientsEyebrow": "חומרי גלם ואומנות",
    "ingredientsBody": "חמאה צרפתית. קמח טחון באבן. פירות העונה. שום דבר מיותר."
  },
  "footer": {
    "tagline": "נאפה מדי יום. מוגש בדיוק.",
    "menu": "תפריט",
    "about": "הסיפור שלנו",
    "order": "הזמנה",
    "visit": "ביקור",
    "rights": "כל הזכויות שמורות."
  },
```

- [ ] **Step 2: Verify JSON valid and key parity**

Run:

```bash
node -e "
const en=require('./messages/en.json'), he=require('./messages/he.json');
const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?flat(v,p+k+'.'):[p+k]);
const e=new Set(flat(en)), h=new Set(flat(he));
const missing=[...e].filter(k=>!h.has(k)), extra=[...h].filter(k=>!e.has(k));
console.log('missing in he:', missing.length?missing:'none');
console.log('extra in he:', extra.length?extra:'none');
"
```

Expected: `missing in he: none` and `extra in he: none`.

- [ ] **Step 3: Commit**

```bash
git add messages/he.json
git commit -m "feat(home): add Hebrew copy parity for editorial homepage, about, footer"
```

---

## Task 3: SiteFooter component + wire into layout

**Files:**
- Create: `components/shared/site-footer.tsx`
- Modify: `app/[locale]/layout.tsx`
- Test: `__tests__/unit/site-footer.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/unit/site-footer.test.tsx`:

```tsx
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { SiteFooter } from "@/components/shared/site-footer"
import enMessages from "@/messages/en.json"

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <SiteFooter />
    </NextIntlClientProvider>
  )
}

describe("SiteFooter", () => {
  it("renders the footer tagline and a menu link", () => {
    renderFooter()
    expect(screen.getByText("Crafted daily. Presented with precision.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Menu" })).toBeInTheDocument()
  })

  it("renders inside a contentinfo landmark", () => {
    renderFooter()
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/unit/site-footer.test.tsx`
Expected: FAIL - cannot find module `@/components/shared/site-footer`.

- [ ] **Step 3: Create the component**

Create `components/shared/site-footer.tsx`:

```tsx
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"

/**
 * Site-wide footer (Atelier Bakery). Rendered once in the locale layout
 * below the page content. Wordmark + primary nav links + copyright, on the
 * dark Oven-Black band. Copy is localized; spacing uses logical utilities
 * so the layout mirrors correctly in RTL.
 */
export function SiteFooter() {
  const t = useTranslations("footer")
  const nav = useTranslations("nav")

  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl font-medium">{nav("home")}</p>
          <p className="mt-2 text-sm text-background/70">{t("tagline")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/menu" className="hover:underline">
            {t("menu")}
          </Link>
          <Link href="/about" className="hover:underline">
            {t("about")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-background/15">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-background/60">
          &copy; 2026 {nav("home")}. {t("rights")}
        </div>
      </div>
    </footer>
  )
}
```

> Uses `nav("home")` for the wordmark (the localized app name, e.g.
> "Home"/"בית"). `bg-foreground text-background` gives the dark band in
> light mode and inverts cleanly in dark mode (foundation tokens).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/unit/site-footer.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 5: Wire the footer into the locale layout**

In `app/[locale]/layout.tsx`, add the import near the other shared
imports (after the `SiteHeader` import):

```tsx
import { SiteFooter } from "@/components/shared/site-footer"
```

Then in the JSX, change:

```tsx
              <SiteHeader />
              {children}
              <Toaster
```

to:

```tsx
              <SiteHeader />
              {children}
              <SiteFooter />
              <Toaster
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add components/shared/site-footer.tsx __tests__/unit/site-footer.test.tsx "app/[locale]/layout.tsx"
git commit -m "feat(home): add site footer and render it in the locale layout"
```

---

## Task 4: Presentational section components (hero, principles, seasonal, about-blurb, visit)

These five are static (i18n text + placeholder images), no data. Build
them together; one smoke test covers them via the composed page in Task 6.

**Files:**
- Create: `components/home/hero-section.tsx`
- Create: `components/home/artisan-principles.tsx`
- Create: `components/home/seasonal-feature.tsx`
- Create: `components/home/about-blurb.tsx`
- Create: `components/home/visit-section.tsx`

- [ ] **Step 1: Create `hero-section.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `artisan-principles.tsx`**

```tsx
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
            <div key={item.title} className="flex flex-col items-center text-center">
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
```

- [ ] **Step 3: Create `seasonal-feature.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `about-blurb.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `visit-section.tsx`**

```tsx
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
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: exit 0 (these are unused until Task 6 imports them, but must compile).

- [ ] **Step 7: Commit**

```bash
git add components/home/hero-section.tsx components/home/artisan-principles.tsx components/home/seasonal-feature.tsx components/home/about-blurb.tsx components/home/visit-section.tsx
git commit -m "feat(home): add hero, principles, seasonal, about-blurb, visit sections"
```

---

## Task 5: SignatureCollection component (data-driven, tested)

This is the one section with logic (renders a product grid, degrades on
empty), so it gets its own test.

**Files:**
- Create: `components/home/signature-collection.tsx`
- Test: `__tests__/unit/signature-collection.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/unit/signature-collection.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { SignatureCollection } from "@/components/home/signature-collection"
import { CartProvider } from "@/components/cart/cart-provider"
import type { Product } from "@/lib/products/product-types"
import enMessages from "@/messages/en.json"

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

const products: Product[] = [
  {
    id: "p1",
    name: "Classic Challah",
    description: "Soft and sweet",
    price: 18,
    category: "challah",
    image_url: null,
    is_available: true,
    stock_quantity: 100,
    low_stock_threshold: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
]

function renderSection(items: Product[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <CartProvider>
        <SignatureCollection products={items} locale="en" />
      </CartProvider>
    </NextIntlClientProvider>
  )
}

describe("SignatureCollection", () => {
  it("renders the heading and the given products", () => {
    renderSection(products)
    expect(screen.getByText("This week from the oven")).toBeInTheDocument()
    expect(screen.getByText("Classic Challah")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /view full menu/i })).toBeInTheDocument()
  })

  it("renders the heading and link but no products when empty", () => {
    renderSection([])
    expect(screen.getByText("This week from the oven")).toBeInTheDocument()
    expect(screen.queryByText("Classic Challah")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /view full menu/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/unit/signature-collection.test.tsx`
Expected: FAIL - cannot find module `@/components/home/signature-collection`.

- [ ] **Step 3: Create the component**

Create `components/home/signature-collection.tsx`:

```tsx
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import type { Locale } from "@/lib/orders/order-formatting"
import type { Product } from "@/lib/products/product-types"
import { ProductCard } from "@/components/menu/product-card"

/**
 * Signature Collection: the newest available products, shown with the
 * shared ProductCard. Presentational - the page fetches and slices the
 * list, this renders it. Degrades gracefully: with no products it still
 * shows the heading and the "view full menu" link, just no grid.
 */
export function SignatureCollection({
  products,
  locale,
}: {
  products: Product[]
  locale: Locale
}) {
  const t = useTranslations("home.signature")

  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight">{t("title")}</h2>
        <p className="mt-2 text-muted-foreground">{t("sub")}</p>

        {products.length > 0 ? (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <Link
            href="/menu"
            className="inline-block border-b border-foreground pb-0.5 text-sm font-semibold"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/unit/signature-collection.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add components/home/signature-collection.tsx __tests__/unit/signature-collection.test.tsx
git commit -m "feat(home): add signature collection section (newest available products)"
```

---

## Task 6: Rebuild the homepage to compose the sections

**Files:**
- Modify: `app/[locale]/page.tsx`
- Test: `__tests__/unit/home-page-sections.test.tsx`

- [ ] **Step 1: Write the failing smoke test**

This test renders the composed section set (not the async server page
itself) with empty products to prove the composition does not throw and
the hero headline appears. Create
`__tests__/unit/home-page-sections.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"

import { HeroSection } from "@/components/home/hero-section"
import { SignatureCollection } from "@/components/home/signature-collection"
import { ArtisanPrinciples } from "@/components/home/artisan-principles"
import { SeasonalFeature } from "@/components/home/seasonal-feature"
import { AboutBlurb } from "@/components/home/about-blurb"
import { VisitSection } from "@/components/home/visit-section"
import { CartProvider } from "@/components/cart/cart-provider"
import enMessages from "@/messages/en.json"

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

describe("home page sections compose without error", () => {
  it("renders hero, signature (empty), principles, seasonal, about, visit", () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <CartProvider>
          <HeroSection />
          <SignatureCollection products={[]} locale="en" />
          <ArtisanPrinciples />
          <SeasonalFeature />
          <AboutBlurb />
          <VisitSection />
        </CartProvider>
      </NextIntlClientProvider>
    )
    expect(screen.getByText("Fresh pastries, crafted every morning.")).toBeInTheDocument()
    expect(screen.getByText("Handmade")).toBeInTheDocument()
    expect(screen.getByText("Strawberry Mille-Feuille")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/unit/home-page-sections.test.tsx`
Expected: FAIL at this point only if a section import is missing; if
Tasks 4-5 are done it may already pass. Either way, proceed - the real
gate is the rebuilt page in Step 3. (If it passes already, that confirms
the sections compose; continue.)

- [ ] **Step 3: Rebuild `app/[locale]/page.tsx`**

Replace the entire file with:

```tsx
import { setRequestLocale } from "next-intl/server"

import type { Locale } from "@/lib/orders/order-formatting"
import { getAvailableProducts } from "@/lib/products/product-queries"
import { HeroSection } from "@/components/home/hero-section"
import { SignatureCollection } from "@/components/home/signature-collection"
import { ArtisanPrinciples } from "@/components/home/artisan-principles"
import { SeasonalFeature } from "@/components/home/seasonal-feature"
import { AboutBlurb } from "@/components/home/about-blurb"
import { VisitSection } from "@/components/home/visit-section"

/**
 * Atelier Bakery homepage: an editorial landing page. Server-fetches the
 * newest available products for the Signature Collection and composes the
 * section components in order. Shared header/footer live in the locale
 * layout. All copy is localized; the page itself holds no marketing strings.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const products = await getAvailableProducts()
  const signature = products.slice(0, 3)

  return (
    <main className="flex-1">
      <HeroSection />
      <SignatureCollection products={signature} locale={locale as Locale} />
      <ArtisanPrinciples />
      <SeasonalFeature />
      <AboutBlurb />
      <VisitSection />
    </main>
  )
}
```

- [ ] **Step 4: Run the smoke test (now must pass)**

Run: `npx vitest run __tests__/unit/home-page-sections.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/page.tsx" __tests__/unit/home-page-sections.test.tsx
git commit -m "feat(home): rebuild homepage as composed editorial sections"
```

---

## Task 7: Stub `/about` page

**Files:**
- Create: `app/[locale]/about/page.tsx`

- [ ] **Step 1: Create the about page**

Create `app/[locale]/about/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/about/page.tsx"
git commit -m "feat(about): add stub Our Story page"
```

---

## Task 8: Full verification and visual proof

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: clean, no errors (the `eslint-disable` comments suppress the
`no-img-element` warnings on hero and seasonal).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 3: Full test suite**

Run: `npm run test`
Expected: all green (the prior 133 + the new footer/signature/sections
tests).

- [ ] **Step 4: i18n parity re-check**

Run:

```bash
node -e "
const en=require('./messages/en.json'), he=require('./messages/he.json');
const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?flat(v,p+k+'.'):[p+k]);
const e=new Set(flat(en)), h=new Set(flat(he));
console.log('missing in he:', [...e].filter(k=>!h.has(k)));
console.log('extra in he:', [...h].filter(k=>!e.has(k)));
"
```

Expected: both arrays empty.

- [ ] **Step 5: Format**

Run: `npm run format`
Expected: Prettier writes; `git status` shows only files we touched. If
unrelated files are reformatted, `git checkout --` them and keep only
ours.

- [ ] **Step 6: Visual verification via preview**

Start the dev server (preview tooling, or `npm run dev` + curl fallback)
and confirm:

- `/en` renders all 7 sections in order: hero photo + serif headline +
  two CTAs; signature grid (or graceful empty); principles circles on the
  warm band; seasonal split; centered about statement; visit columns;
  dark footer.
- Toggle dark: espresso background, footer inverts (cream-on-espresso),
  gold eyebrows readable.
- `/he`: layout mirrors (RTL), Hebrew copy throughout, no missing-key
  console errors.
- `/en/about` and `/he/about` render the stub; hero "Our Story" CTA and
  the about-blurb link both reach it; footer "Our Story" link works.

If the preview eval channel is unreliable (as in the Spec 1 session),
fall back to:

```bash
curl -s http://localhost:3000/he -o /tmp/he.html
node -e "const h=require('fs').readFileSync('/tmp/he.html','utf8'); console.log('he renders, has hero he title:', h.includes('מאפים טריים'))"
```

Expected: `true`, confirming `/he` renders new keys without throwing.

Capture light, dark, and RTL screenshots of the homepage as proof.

- [ ] **Step 7: Commit any formatting changes**

```bash
git add -A
git commit -m "chore(home): apply Prettier formatting to homepage rebuild"
```

(Skip if `git status` is clean after Step 5.)

---

## Self-Review Notes

**Spec coverage:**
- 7-section homepage -> Tasks 4 (hero/principles/seasonal/about-blurb/visit),
  5 (signature), 6 (compose), 3 (footer).
- Signature = newest 3 available via `getAvailableProducts().slice(0,3)`
  -> Task 6 fetch + Task 5 render; empty/short degrade -> Task 5 test.
- Hero two CTAs -> `/menu` and `/about` -> Task 4 hero.
- Stub `/about` page, both CTA + blurb link to it -> Task 7 + Task 4
  (hero ctaStory) + Task 4 about-blurb.
- Footer site-wide via layout -> Task 3.
- Visit placeholder Tel Aviv details -> Tasks 1/2 i18n + Task 4 visit.
- Full EN+HE parity -> Tasks 1, 2, parity checks in Tasks 2 & 8.
- Plain `<img>` Unsplash placeholders -> Task 4 hero/seasonal.
- Logical properties / RTL -> all components use `mx-auto`, `gap`, `ps-`,
  `text-center`; no physical `ml/mr/pl/pr`. Verified in Task 8 `/he`.
- `home.title`/`home.description` retained for `generateMetadata` ->
  Tasks 1/2 keep them.
- Foundation tokens, serif headings, gold eyebrows -> all components.
- Testing (typecheck/lint/test/visual) -> Task 8.
- Non-goals respected: no menu/cart/admin restyle, no schema change, no
  resolving the Spec-1 card type-hierarchy question.

**Placeholder scan:** No TBD/TODO; every code step shows complete code;
every command shows expected output.

**Type/name consistency:** `SignatureCollection({ products: Product[],
locale: Locale })` defined in Task 5, called identically in Task 6.
`SiteFooter` (no props) defined Task 3, imported Task 3. Section
components are prop-less and named consistently between Task 4, the Task 6
page, and the Task 6 smoke test. `Locale` cast (`locale as Locale`)
matches the menu page's existing handling. i18n namespaces
(`home.hero`, `home.signature`, `home.principles`, `home.seasonal`,
`home.about`, `home.visit`, `about`, `footer`) are defined in Tasks 1/2
and consumed by the matching `useTranslations(...)` calls.
