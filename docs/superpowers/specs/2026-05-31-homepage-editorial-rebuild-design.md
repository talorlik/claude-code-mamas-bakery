# Homepage Editorial Rebuild - Atelier Bakery

## Context

"Mom's Bakery" (`mamas-bakery`) is a Next.js 16 / React 19 bilingual
(EN/HE, LTR/RTL) bakery storefront on Tailwind v4 + Base UI. This is
**Spec 2 of 5** in the Atelier Bakery redesign. Spec 1 (Design
Foundation) is merged to `main`: warm-neutral light palette + espresso
dark variant (OKLCH tokens in `app/globals.css`), self-hosted Fraunces
serif for headings (the `.font-display` utility and `h1/h2/h3` base rule)
over Inter body, a serif site-header wordmark, and a borderless
photo-forward product card (`components/menu/product-card.tsx`).

This spec rebuilds the homepage from its current single-screen hero into
the full editorial structure from `docs/design/DESIGN.md`, and adds a
stub `/about` page plus the site's first footer.

## Goals

Replace the minimal homepage (`app/[locale]/page.tsx`) with a
multi-section editorial landing page that showcases the bakery, using the
foundation's tokens and the existing product card. Add a footer (shared,
rendered in the locale layout) and a stub `/about` page. Ship fully
bilingual (EN + HE).

## Non-Goals

- Restyling the menu, cart, product detail, auth, or admin pages
  (Specs 3-5). Only the homepage, a new `/about` page, and a new footer.
- Adding an `is_featured` schema column or admin curation UI (deferred;
  signature collection uses newest-available, see Decisions).
- Real product photography or a CMS for seasonal content (Unsplash
  placeholders + hardcoded seasonal copy via i18n).
- Resolving the product-card type-hierarchy open question from Spec 1
  (that is scoped to Spec 3, the menu page).

## Decisions (from brainstorming)

- **Signature collection source**: reuse `getAvailableProducts()` and
  take the first N (newest-available), N = 3. No schema change. If fewer
  than 3 products exist, render however many are available; if zero,
  omit the section's grid and show nothing (no error).
- **Hero**: two CTAs - primary "View the Menu" -> `/menu`, secondary
  "Our Story" -> `/about`.
- **Our Story / About**: build a **stub `/about` page**
  (`app/[locale]/about/page.tsx`) with the brand statement and an
  ingredients/craft block. Both the hero secondary CTA and the homepage
  "Our Bakery" section link to `/about`.
- **Visit section**: invented placeholder Tel Aviv address, hours, and
  contact (hardcoded via i18n, since there is no settings store).
- **Hebrew**: full EN + HE this pass. Every new key is added to both
  `messages/en.json` and `messages/he.json` with real Hebrew
  translations. The homepage is the marquee public page and must not be
  half-translated.
- **Images**: plain `<img>` (the established pattern; no `next/image`,
  no `next.config` change). Hero and seasonal images use Unsplash URLs
  as swap-later placeholders.

## Page Structure (homepage)

Sections in order, matching DESIGN.md:

1. **Hero** - full-bleed pastry image, uppercase eyebrow label, serif
   display headline, supporting sentence, two CTAs (View the Menu /
   Our Story). Image is an Unsplash placeholder via plain `<img>`.
2. **Signature Collection** - eyebrow + serif section heading + sub, a
   3-up grid of `ProductCard` for the newest available products, and a
   "View full menu" underline link to `/menu`. Server-fetched.
3. **Artisan Principles** - on a Parchment (`bg-card`/`bg-muted`) band,
   three outlined craft circles (Handmade / Natural Fermentation /
   Premium Ingredients), each a title + one-line description.
4. **Seasonal Feature** - split layout: large Unsplash image on one
   side, minimal copy (eyebrow, serif heading, availability line, CTA)
   on the other. Content hardcoded via i18n.
5. **Our Bakery** - centered brand statement (serif), linking to
   `/about`.
6. **Visit Us** - three columns: Location, Hours, Contact (placeholder
   Tel Aviv details via i18n).
7. **Footer** - new shared component (see below).

## Architecture / File Structure

Each homepage section is its own focused component so the page file stays
a thin composition and each unit is independently readable. New
components live under `components/home/`.

| File | Responsibility |
| --- | --- |
| `app/[locale]/page.tsx` | Rebuilt homepage. Server component. Fetches signature products, composes the section components in order. |
| `components/home/hero-section.tsx` | Hero: image + eyebrow + headline + copy + two CTAs. Presentational; text via `next-intl`. |
| `components/home/signature-collection.tsx` | Receives `products: Product[]` and `locale`, renders the eyebrow/heading/sub, the `ProductCard` grid, and the menu link. Pure presentational (no fetching). |
| `components/home/artisan-principles.tsx` | The three craft circles on the Parchment band. Presentational. |
| `components/home/seasonal-feature.tsx` | Split image + copy block. Presentational. |
| `components/home/about-blurb.tsx` | Centered "Our Bakery" brand statement linking to `/about`. Presentational. |
| `components/home/visit-section.tsx` | Location / Hours / Contact columns. Presentational. |
| `components/shared/site-footer.tsx` | Footer: wordmark + nav links + copyright. Rendered in the locale layout below `children`. |
| `app/[locale]/about/page.tsx` | Stub About page: brand statement + ingredients/craft block. Server component, own metadata. |
| `app/[locale]/layout.tsx` | Add `<SiteFooter />` after `{children}` (inside the providers, mirroring `<SiteHeader />`). |
| `messages/en.json`, `messages/he.json` | Add `home.*` (extended), `about.*`, `footer.*` keys in both locales. |

Data flow: `page.tsx` calls `getAvailableProducts()` (already exists,
respects RLS, available-only, newest-first), slices `[0, 3]`, and passes
the array to `signature-collection.tsx`. No new query function needed.
All other sections are static (i18n text + placeholder images).

### Why presentational section components

The page server-fetches once and passes data down; sections take props
and render. This keeps the fetch in one place, makes each section unit
testable in isolation (render with fixture props, assert structure), and
keeps `page.tsx` small. Section components are server components by
default (no client interactivity except where `ProductCard`, already a
client component, is used).

## i18n Keys (added to both locales)

New/extended namespaces (illustrative key list; exact strings written
during implementation, Hebrew included):

- `home.hero.eyebrow`, `home.hero.title`, `home.hero.body`,
  `home.hero.ctaMenu`, `home.hero.ctaStory`
- `home.signature.eyebrow`, `home.signature.title`, `home.signature.sub`,
  `home.signature.viewAll`
- `home.principles.eyebrow`, and three `{title, body}` pairs
  (`handmade`, `fermentation`, `ingredients`)
- `home.seasonal.eyebrow`, `home.seasonal.title`, `home.seasonal.body`,
  `home.seasonal.cta`
- `home.about.eyebrow`, `home.about.statement`, `home.about.cta`
- `home.visit.eyebrow`, `home.visit.locationLabel`,
  `home.visit.locationValue`, `home.visit.hoursLabel`,
  `home.visit.hoursValue`, `home.visit.contactLabel`,
  `home.visit.contactValue`
- `about.*` - title, lead/statement, ingredients/craft block copy
- `footer.*` - tagline, nav link labels (reuse `nav.*` where sensible),
  copyright

Existing `home.title/description/tagline/browseMenu/getStarted` keys:
keep `browseMenu` (reused), repurpose or retain others; remove only if
unreferenced after the rebuild. Do not delete keys still referenced
elsewhere (check `home.title`/`description` are used by
`generateMetadata` in the locale layout - they ARE, so keep them).

> [!IMPORTANT]
> `app/[locale]/layout.tsx#generateMetadata` reads `home.title` and
> `home.description`. Those two keys MUST remain. New hero copy uses new
> keys (`home.hero.*`), not those, to avoid coupling page H1 to the
> `<title>` tag.

## Styling Notes

- Headings use the serif via the existing `h1/h2/h3` base rule or the
  `.font-display` utility; body stays Inter. Eyebrow labels: `text-xs`,
  `uppercase`, `tracking-[.2em]`, accent gold (`text-accent` /
  `--accent`), used sparingly per DESIGN.md.
- Sections use the warm tokens: page on `bg-background`, the Principles
  band on `bg-muted`/`bg-card` for warmth, dividers via
  `border-border`. Dark mode inherits automatically (foundation tokens).
- All spacing uses logical/centered utilities (`mx-auto`, `gap-*`,
  `px-*`, `py-*`, `ms-/me-`) so RTL mirrors correctly. No physical
  `ml-/mr-/pl-/pr-/text-left/text-right`.
- Type scale from DESIGN.md: hero headline ~48px (`text-5xl`-ish),
  section headings ~32px (`text-3xl`), body 16-18px.
- Images: `aspect-*` boxes with `object-cover`, `loading="lazy"`, the
  `eslint-disable @next/next/no-img-element` comment (matching the
  product card).

## Error Handling / Edge Cases

- **No products / empty DB / RLS or fetch error**: `getAvailableProducts`
  returns `[]` (or the page catches and treats as empty); the Signature
  Collection renders its heading but no grid, or is skipped entirely -
  the page must never crash on an empty product set. Decide in
  implementation: simplest is render the section heading + the
  "View full menu" link, omit the grid when empty.
- **Fewer than 3 products**: render the 1-2 available cards; the grid is
  responsive (1/2/3 columns) so it doesn't look broken.
- **Missing product images**: `ProductCard` already shows the warm
  Croissant fallback - no homepage-specific handling needed.
- **RTL**: hero split, seasonal split, and the principles/visit grids
  must mirror correctly; verify in `/he`.
- **Metadata**: `/about` gets its own `generateMetadata` (title via
  `about.title`), extending the locale base template.
- **Unsplash placeholder offline**: a broken hero image must not break
  layout - the `aspect-*` box reserves space and shows a background
  color (`bg-muted`) behind a failed `<img>`.

## Testing / Verification

- `npm run typecheck`, `npm run lint`, `npm run test` all pass (per
  CLAUDE.md, before claiming done).
- Unit tests (Vitest + Testing Library, jsdom) for the presentational
  sections that have logic worth asserting:
  - `signature-collection.tsx`: renders N product names given fixture
    products; renders heading + view-all link with empty `products`
    (no crash, no grid).
  - A smoke test that the rebuilt `page.tsx`'s section components render
    given mocked translations + empty products (no throw).
  - Pure-presentational sections (hero, principles, seasonal, about-blurb,
    visit, footer) do not each need a bespoke test; one render smoke test
    covering the composed page is sufficient. Do not over-test static
    markup.
- i18n parity check: every new key exists in BOTH `en.json` and
  `he.json` (a quick script/assertion or manual diff; next-intl throws
  on missing keys for a locale, so parity is also enforced at runtime by
  loading `/he`).
- Visual verification via preview: homepage in light + dark, LTR + `/he`
  RTL; `/about` in both; footer present on all pages. Capture
  screenshots. (Preview eval tooling was flaky in the Spec 1 session; if
  it fails, fall back to fetching the served HTML/CSS to confirm
  structure and that `/he` renders without missing-key errors.)

## Success Criteria

- Homepage renders all 7 sections in order, styled with the Atelier
  foundation (warm light + espresso dark), serif headings, restrained
  gold eyebrows.
- Signature Collection shows the newest available products via the
  existing `ProductCard`; empty/short product sets degrade gracefully.
- Hero CTAs go to `/menu` and `/about`; the new `/about` stub renders.
- Footer appears site-wide (added once in the locale layout).
- Fully bilingual: `/en` and `/he` both render with no missing-key
  errors; RTL layout mirrors correctly.
- No regression: typecheck, lint, tests green.
