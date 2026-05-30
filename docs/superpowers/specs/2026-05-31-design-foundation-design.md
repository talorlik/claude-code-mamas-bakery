# Design Foundation - Atelier Bakery

## Context

"Mom's Bakery" (`mamas-bakery`) is a Next.js 16 / React 19 bilingual
(EN/HE, LTR/RTL) bakery storefront on Tailwind v4 + Base UI, with a
working `next-themes` dark mode. `docs/design/DESIGN.md` defines an
"Atelier Bakery" visual language: warm minimalism, editorial patisserie,
typography-led, photography-forward.

This is **Spec 1 of 5** in a decomposed redesign. The full redesign was
deemed too large for a single spec and split into sequential
design->plan->build cycles:

1. **Design Foundation** (this spec) - the shared visual system every
   page depends on.
2. Homepage editorial rebuild.
3. Menu + cart + product detail.
4. Auth / profile / orders pages.
5. Admin back office.

Build order follows that dependency chain; the foundation unblocks all
page work. Only this spec is in scope now.

## Goals

Establish the Atelier Bakery design system inside the existing
Tailwind v4 / Base UI token plumbing, and prove it on two surfaces (the
site header/nav and the product card). After this spec, every page
inherits the new look through the shared tokens without per-page work,
even though pages are not individually reworked until their own spec.

## Non-Goals

- Rebuilding the homepage or any page layout (deferred to Specs 2-5).
- Translating new marketing copy to Hebrew (EN-first; HE follows in
  later specs). No new marketing copy is introduced in this spec.
- Sourcing real Mom's Bakery photography (placeholders only, later).
- Touching business logic, data, auth, or i18n routing.

## Decisions (from brainstorming)

- **Imagery**: Unsplash stock placeholders now, treated as swap-later.
  The product card renders a **plain `<img>`** (not `next/image`) by
  design - `image_url` is admin-supplied and arbitrary, so the existing
  code deliberately avoids maintaining a remote-host allowlist in
  `next.config.ts` (which currently has no image config). This spec keeps
  that approach; no `next.config.ts` change. When Unsplash placeholders
  are wired into pages (Specs 2-3), they use the same plain-`<img>` path.
- **Bilingual**: EN-first, HE follows. All new/changed styling uses
  logical CSS properties (Tailwind logical utilities: `ms-`/`me-`,
  `ps-`/`pe-`, `start-`/`end-`, `text-start`/`text-end`) so RTL is
  structurally correct even before Hebrew copy lands.
- **Dark mode**: kept. An on-brand dark variant of the Atelier palette
  is defined (deep espresso ground, warm cream text, gold accent
  preserved).
- **Fonts**: free Google Fonts via `next/font`. Display/headlines in
  **Fraunces** (high-contrast serif, editorial patisserie feel); body
  and UI in **Inter** (already present).

## Color System

DESIGN.md palette, expressed as OKLCH (matching the file's existing
convention). Light values are the canonical brand colors; dark values
are derived to preserve the same relationships (gold accent unchanged,
warm neutral relationships inverted onto an espresso ground).

| Token name (brand) | Light hex | Role |
| --- | --- | --- |
| Flour White | `#faf9f7` | Page background |
| Oven Black | `#111111` | Headlines / primary text |
| Parchment | `#f3efe8` | Cards / subtle section backgrounds |
| Stone Divider | `#d8d3cc` | Borders / separators |
| Cocoa Gray | `#6e675f` | Secondary text |
| Warm Taupe | `#9d9488` | Tertiary text |
| Butter Cream | `#f7e7c6` | Subtle highlight surfaces |
| Bakery Gold | `#b9853b` | Single accent, used sparingly |
| Berry Accent | `#8c4b5f` | Limited seasonal accents only |

### Mapping to existing semantic tokens

The app's components reference semantic tokens (`--background`,
`--foreground`, `--primary`, `--card`, `--muted`, `--accent`,
`--border`, etc.) defined in `app/globals.css`. We remap those semantic
tokens to the brand palette rather than renaming them, so all 52 Base UI
components inherit the new look with zero component edits.

Light (`:root`):

- `--background` -> Flour White `#faf9f7`
- `--foreground` -> Oven Black `#111111`
- `--card` -> Parchment `#f3efe8`; `--card-foreground` -> Oven Black
- `--popover` -> Flour White; `--popover-foreground` -> Oven Black
- `--primary` -> Oven Black `#111111`; `--primary-foreground` ->
  Flour White (primary buttons read as confident black-on-cream)
- `--secondary` -> Parchment; `--secondary-foreground` -> Oven Black
- `--muted` -> Parchment; `--muted-foreground` -> Cocoa Gray `#6e675f`
- `--accent` -> Bakery Gold `#b9853b`; `--accent-foreground` ->
  Flour White
- `--border` and `--input` -> Stone Divider `#d8d3cc`
- `--ring` -> Bakery Gold (focus rings pick up the accent)
- `--destructive` -> unchanged (semantic error red stays legible)

Dark (`.dark`) - espresso ground, warm cream text, gold preserved:

- `--background` -> deep espresso `#16130f`
- `--foreground` -> warm cream `#f1ece4`
- `--card` / `--popover` -> raised espresso `#1f1b16`
- `--primary` -> warm cream; `--primary-foreground` -> espresso
  (inverted: cream buttons on dark, mirroring the light theme's
  black-on-cream)
- `--secondary` / `--muted` -> `#1f1b16`; `--muted-foreground` ->
  muted taupe `#b6aaa0`
- `--accent` -> Bakery Gold `#b9853b` (unchanged across themes);
  `--accent-foreground` -> espresso
- `--border` / `--input` -> warm low-alpha line (`oklch` of cream at
  ~12-15% over espresso)
- `--ring` -> Bakery Gold

> [!NOTE]
> Sidebar and chart tokens (`--sidebar-*`, `--chart-*`) belong to the
> admin UI (Spec 5). This spec retunes them to warm neutrals only enough
> that they are not jarring; full admin theming is deferred.

OKLCH conversions for every hex above are produced during
implementation and verified by eye against the approved mockup.

## Typography

- Load **Fraunces** via `next/font/google` in `app/[locale]/layout.tsx`,
  exposed as `--font-fraunces`, alongside the existing Inter
  (`--font-inter`) and Geist Mono.
- In `app/globals.css` `@theme inline`, **repoint** the existing
  `--font-heading` token (currently `var(--font-sans)`) to
  `var(--font-fraunces)`. Keep `--font-sans` for body/UI.
- A base-layer rule sets `h1, h2, h3` (and a `.font-display` utility) to
  `--font-heading`. Body text stays Inter via the existing
  `body { ... }` rule. This means heading elements across the app pick up
  the serif automatically without per-component class churn.

### Type scale (from DESIGN.md, bakery-adapted)

| Role | Size |
| --- | --- |
| Body | 16px |
| Product description | 18px |
| Section heading | 32px |
| Hero heading | 48px (adapted down; photography leads) |
| Display | 64px |

Scale is encoded as the Tailwind utility steps the components already
use; no bespoke scale system. Hero/Display sizes are applied by pages in
their own specs, not here.

## Proof Surfaces (the only components restyled in this spec)

### Site header / nav (`components/shared/site-header.tsx`)

- Apply the warm tokens (already token-driven, so it inherits most of
  the palette). Verify the `bg-background/80` blur, the
  `border-b border-border`, and brand wordmark now read as
  cream/espresso, not the old neutral gray.
- Set the brand wordmark (`appName` link) in the heading serif via
  `font-display`, so the bakery name carries the editorial voice.
- Audit directional utilities -> swap any physical `ml-/mr-/pl-/pr-`
  for logical equivalents so RTL spacing is correct.

### Product card (`components/menu/product-card.tsx`)

Restyle toward the DESIGN.md "Signature Pastry Card": borderless, strong
photography, compact text, no shadow, minimal metadata.

- Remove the card border/shadow; let the `aspect-[4/3]` image dominate.
- Price moves to plain text near the name (drop the filled `Badge`
  treatment for price; the badge competes with the minimal aesthetic).
- Name in the heading serif at product scale; description in Cocoa Gray
  at 18px (`text-lg`), `line-clamp-2`.
- "Add to cart" button uses the primary (Oven Black / cream) token.
- Image fallback (no `image_url`): warm Parchment field with a centered
  Croissant lucide icon in Warm Taupe, replacing the current text
  fallback - more on-brand and language-neutral.
- All spacing via logical utilities.

> [!NOTE]
> The product card is restyled here as **proof the token system and
> card pattern work**. The menu page that renders these cards in a grid
> is Spec 3; this spec does not touch the grid/layout.

## Architecture / Where Changes Land

| File | Change |
| --- | --- |
| `app/globals.css` | Remap semantic tokens (`:root` + `.dark`) to brand palette; repoint existing `--font-heading` to Fraunces; add base rule applying serif to headings + `.font-display`. |
| `app/[locale]/layout.tsx` | Load Fraunces via `next/font/google`; add its variable to `<body>` className. |
| `components/shared/site-header.tsx` | Serif wordmark; logical-property audit; verify token inheritance. |
| `components/menu/product-card.tsx` | Borderless minimal card; serif name; plain price; warm icon fallback; logical spacing. |

No new dependencies. No `next.config.ts` change. No data, auth,
routing, or i18n-message changes.

## Error Handling / Edge Cases

- **Dark-mode contrast**: every remapped dark token pair must clear
  WCAG AA for body text (cream `#f1ece4` on espresso `#16130f` passes
  comfortably; verify `--muted-foreground` taupe on espresso for small
  text and bump lightness if it fails).
- **Gold accent contrast**: Bakery Gold `#b9853b` as `--accent` with
  cream foreground is decorative, not used for body text; ensure any
  text placed on gold (e.g. focus states) meets AA or uses the
  espresso/cream foreground that does.
- **RTL**: with logical utilities, Hebrew layout must mirror correctly;
  verify the header and card in `dir="rtl"`.
- **Image fallback**: card must render cleanly with and without
  `image_url`.
- **FOUT/FOIT**: Fraunces loaded through `next/font` (self-hosted,
  `display: swap` default) to avoid layout shift.

## Testing / Verification

- `npm run typecheck` and `npm run test` pass (per CLAUDE.md, before
  claiming done).
- `npm run lint` clean.
- Visual verification via the preview server: header and product card in
  light and dark, LTR and RTL, with and without a product image.
  Capture screenshots as proof.
- Existing unit/integration tests for the touched components (if any)
  still pass; no test logic should need to change since behavior is
  unchanged - only presentation.

## Success Criteria

- The app's global look matches the approved Atelier foundation: Flour
  White ground, Oven Black serif headings, restrained gold accent, warm
  Parchment surfaces - in light mode; the on-brand espresso variant in
  dark mode.
- Header wordmark renders in Fraunces; body/UI stays Inter.
- Product card is borderless, photo-forward, minimal, correct in both
  themes and both directions.
- No regression in typecheck, tests, or lint.
