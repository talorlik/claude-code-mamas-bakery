# Design Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Atelier Bakery visual system (warm-neutral palette in light + on-brand espresso dark, Fraunces serif headings over Inter body) inside the existing Tailwind v4 / Base UI token plumbing, proven on the site header and product card.

**Architecture:** Remap the existing semantic CSS custom properties in `app/globals.css` (`:root` + `.dark`) to the DESIGN.md brand palette so all 52 Base UI components inherit the look with zero component edits. Load Fraunces via `next/font/google` and repoint the existing `--font-heading` token to it, with a base-layer rule applying the serif to `h1/h2/h3` and a `.font-display` utility. Restyle only two proof surfaces: the site header (serif wordmark, RTL-safe logical spacing) and the product card (borderless, photo-forward, minimal).

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (`@theme inline` + CSS custom properties, OKLCH color space), Base UI, `next/font/google`, `next-themes`, Vitest 4 + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-05-31-design-foundation-design.md` (Spec 1 of 5).

---

## Reference: Brand Palette OKLCH Values

These conversions are computed from the DESIGN.md hex values and are the canonical token values used throughout this plan. Use them verbatim.

| Brand color | Hex | OKLCH |
| --- | --- | --- |
| Flour White | `#faf9f7` | `oklch(0.9823 0.0029 84.56)` |
| Oven Black | `#111111` | `oklch(0.1776 0 89.88)` |
| Parchment | `#f3efe8` | `oklch(0.9533 0.0103 81.80)` |
| Stone Divider | `#d8d3cc` | `oklch(0.8689 0.0110 76.59)` |
| Cocoa Gray | `#6e675f` | `oklch(0.5178 0.0152 71.17)` |
| Warm Taupe | `#9d9488` | `oklch(0.6708 0.0203 75.24)` |
| Butter Cream | `#f7e7c6` | `oklch(0.9324 0.0466 85.19)` |
| Bakery Gold | `#b9853b` | `oklch(0.6542 0.1104 73.15)` |
| Berry Accent | `#8c4b5f` | `oklch(0.4970 0.0906 1.25)` |
| Espresso BG (dark) | `#16130f` | `oklch(0.1888 0.0093 75.06)` |
| Espresso Card (dark) | `#1f1b16` | `oklch(0.2249 0.0113 73.35)` |
| Warm Cream (dark text) | `#f1ece4` | `oklch(0.9448 0.0120 79.78)` |
| Muted Taupe (dark) | `#b6aaa0` | `oklch(0.7453 0.0198 62.36)` |

Dark border/input use warm cream at low alpha: `oklch(0.9448 0.0120 79.78 / 12%)` (border) and `oklch(0.9448 0.0120 79.78 / 16%)` (input).

---

## Task 1: Light-mode color tokens

Remap the `:root` semantic tokens to the brand palette. This is a CSS-only change; verification is visual + a build/typecheck pass (no unit test asserts CSS variable values, and adding one would be brittle).

**Files:**
- Modify: `app/globals.css` (the `:root { ... }` block)

- [ ] **Step 1: Replace the `:root` color tokens**

In `app/globals.css`, replace the existing `:root` block's color tokens (keep `--radius` and the `--sidebar-*` / `--chart-*` lines as noted) with:

```css
:root {
    --background: oklch(0.9823 0.0029 84.56);
    --foreground: oklch(0.1776 0 89.88);
    --card: oklch(0.9533 0.0103 81.80);
    --card-foreground: oklch(0.1776 0 89.88);
    --popover: oklch(0.9823 0.0029 84.56);
    --popover-foreground: oklch(0.1776 0 89.88);
    --primary: oklch(0.1776 0 89.88);
    --primary-foreground: oklch(0.9823 0.0029 84.56);
    --secondary: oklch(0.9533 0.0103 81.80);
    --secondary-foreground: oklch(0.1776 0 89.88);
    --muted: oklch(0.9533 0.0103 81.80);
    --muted-foreground: oklch(0.5178 0.0152 71.17);
    --accent: oklch(0.6542 0.1104 73.15);
    --accent-foreground: oklch(0.9823 0.0029 84.56);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.8689 0.0110 76.59);
    --input: oklch(0.8689 0.0110 76.59);
    --ring: oklch(0.6542 0.1104 73.15);
    --chart-1: oklch(0.6542 0.1104 73.15);
    --chart-2: oklch(0.5178 0.0152 71.17);
    --chart-3: oklch(0.4970 0.0906 1.25);
    --chart-4: oklch(0.6708 0.0203 75.24);
    --chart-5: oklch(0.8689 0.0110 76.59);
    --radius: 0.625rem;
    --sidebar: oklch(0.9533 0.0103 81.80);
    --sidebar-foreground: oklch(0.1776 0 89.88);
    --sidebar-primary: oklch(0.1776 0 89.88);
    --sidebar-primary-foreground: oklch(0.9823 0.0029 84.56);
    --sidebar-accent: oklch(0.6542 0.1104 73.15);
    --sidebar-accent-foreground: oklch(0.9823 0.0029 84.56);
    --sidebar-border: oklch(0.8689 0.0110 76.59);
    --sidebar-ring: oklch(0.6542 0.1104 73.15);
}
```

> `--destructive` keeps its original red; sidebar/chart tokens are retuned to warm neutrals only enough to avoid clashing (full admin theming is Spec 5).

- [ ] **Step 2: Verify the build compiles the CSS**

Run: `npm run typecheck`
Expected: PASS (no TS errors; this confirms nothing else broke). CSS itself has no compile step beyond the dev/build pipeline; a full visual check happens in Task 6.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(design): remap light-mode tokens to Atelier brand palette"
```

---

## Task 2: Dark-mode color tokens

Remap the `.dark` semantic tokens to the on-brand espresso variant.

**Files:**
- Modify: `app/globals.css` (the `.dark { ... }` block)

- [ ] **Step 1: Replace the `.dark` color tokens**

In `app/globals.css`, replace the `.dark` block's color tokens with:

```css
.dark {
    --background: oklch(0.1888 0.0093 75.06);
    --foreground: oklch(0.9448 0.0120 79.78);
    --card: oklch(0.2249 0.0113 73.35);
    --card-foreground: oklch(0.9448 0.0120 79.78);
    --popover: oklch(0.2249 0.0113 73.35);
    --popover-foreground: oklch(0.9448 0.0120 79.78);
    --primary: oklch(0.9448 0.0120 79.78);
    --primary-foreground: oklch(0.1888 0.0093 75.06);
    --secondary: oklch(0.2249 0.0113 73.35);
    --secondary-foreground: oklch(0.9448 0.0120 79.78);
    --muted: oklch(0.2249 0.0113 73.35);
    --muted-foreground: oklch(0.7453 0.0198 62.36);
    --accent: oklch(0.6542 0.1104 73.15);
    --accent-foreground: oklch(0.1888 0.0093 75.06);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(0.9448 0.0120 79.78 / 12%);
    --input: oklch(0.9448 0.0120 79.78 / 16%);
    --ring: oklch(0.6542 0.1104 73.15);
    --chart-1: oklch(0.6542 0.1104 73.15);
    --chart-2: oklch(0.7453 0.0198 62.36);
    --chart-3: oklch(0.4970 0.0906 1.25);
    --chart-4: oklch(0.6708 0.0203 75.24);
    --chart-5: oklch(0.8689 0.0110 76.59);
    --sidebar: oklch(0.2249 0.0113 73.35);
    --sidebar-foreground: oklch(0.9448 0.0120 79.78);
    --sidebar-primary: oklch(0.6542 0.1104 73.15);
    --sidebar-primary-foreground: oklch(0.1888 0.0093 75.06);
    --sidebar-accent: oklch(0.2249 0.0113 73.35);
    --sidebar-accent-foreground: oklch(0.9448 0.0120 79.78);
    --sidebar-border: oklch(0.9448 0.0120 79.78 / 12%);
    --sidebar-ring: oklch(0.6542 0.1104 73.15);
}
```

- [ ] **Step 2: Verify typecheck still passes**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(design): add on-brand espresso dark palette"
```

---

## Task 3: Load Fraunces and wire the heading font

Add the Fraunces serif via `next/font/google`, expose it as a CSS variable, repoint `--font-heading`, and apply the serif to headings.

**Files:**
- Modify: `app/[locale]/layout.tsx:1-16` (font imports + instances), `:58-69` (html className)
- Modify: `app/globals.css` (the `@theme inline` `--font-heading` line + the `@layer base` block)

- [ ] **Step 1: Import and instantiate Fraunces**

In `app/[locale]/layout.tsx`, change the font import line and add the Fraunces instance. Replace:

```tsx
import { Geist_Mono, Inter } from "next/font/google"
```

with:

```tsx
import { Fraunces, Geist_Mono, Inter } from "next/font/google"
```

Then, immediately after the existing `inter` and `fontMono` declarations (currently lines 15-16), add:

```tsx
// Fraunces: high-contrast serif for editorial display/headings (Atelier
// Bakery). Body and UI stay on Inter. opsz lets the optical size scale with
// the large display sizes used on marketing pages.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
})
```

- [ ] **Step 2: Add the Fraunces variable to the html className**

In the same file, the `<html>` element's `cn(...)` currently reads:

```tsx
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
```

Replace it with:

```tsx
      className={cn(
        "antialiased",
        fontMono.variable,
        fraunces.variable,
        "font-sans",
        inter.variable
      )}
```

- [ ] **Step 3: Repoint `--font-heading` in the theme**

In `app/globals.css`, inside `@theme inline`, change:

```css
    --font-heading: var(--font-sans);
```

to:

```css
    --font-heading: var(--font-fraunces);
```

- [ ] **Step 4: Apply the serif to headings in the base layer**

In `app/globals.css`, the `@layer base` block currently ends with the `html` rule. Add a headings rule and a display utility. Replace the whole `@layer base { ... }` block with:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-sans;
    }
  h1, h2, h3 {
    font-family: var(--font-heading);
    }
  .font-display {
    font-family: var(--font-heading);
    }
}
```

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Verify the existing test suite still passes**

Run: `npm run test`
Expected: PASS (all existing tests green; no behavior changed).

- [ ] **Step 7: Commit**

```bash
git add "app/[locale]/layout.tsx" app/globals.css
git commit -m "feat(design): load Fraunces serif for headings, repoint font-heading"
```

---

## Task 4: Restyle the site header

Set the brand wordmark in the serif and make spacing RTL-safe with logical utilities. The header is already token-driven, so it inherits the palette; this task is the editorial wordmark + logical-property audit.

**Files:**
- Modify: `components/shared/site-header.tsx`

- [ ] **Step 1: Set the wordmark in the display serif**

In `components/shared/site-header.tsx`, the home link currently reads:

```tsx
          <Link href="/" className="font-semibold">
            {t("home")}
          </Link>
```

Replace it with:

```tsx
          <Link
            href="/"
            className="font-display text-lg font-medium tracking-tight"
          >
            {t("home")}
          </Link>
```

- [ ] **Step 2: Confirm spacing utilities are already logical**

Read the file. The layout uses `gap-*`, `px-*`, `py-*`, `justify-between` - all direction-agnostic, so no physical `ml-/mr-/pl-/pr-` swaps are needed here. No edit required for this step; it is a verification step. If any physical inline-axis utility (`ml-`, `mr-`, `pl-`, `pr-`) is found, replace it with its logical equivalent (`ms-`, `me-`, `ps-`, `pe-`).

Expected: no physical inline-axis utilities present.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/shared/site-header.tsx
git commit -m "feat(design): set bakery wordmark in Fraunces display serif"
```

---

## Task 5: Restyle the product card

Make the card borderless and photo-forward, name in the serif, plain-text price, warm icon fallback, logical spacing. All existing behavior (name/description/price render, image vs fallback) is preserved, so existing tests stay green; we add assertions for the new structure.

**Files:**
- Modify: `components/menu/product-card.tsx`
- Test: `__tests__/unit/product-card.test.tsx`

- [ ] **Step 1: Add failing tests for the new structure**

In `__tests__/unit/product-card.test.tsx`, add two new `it` blocks inside the existing `describe("ProductCard", ...)`, after the last existing test:

```tsx
  it("renders the product name in the display serif", () => {
    renderCard()
    const name = screen.getByText("Sourdough")
    expect(name.className).toContain("font-display")
  })

  it("uses a borderless card (no border utility on the root)", () => {
    const { container } = renderCard()
    const root = container.firstElementChild as HTMLElement
    expect(root.className).not.toContain("border")
    expect(root.className).not.toContain("shadow")
  })
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `npx vitest run __tests__/unit/product-card.test.tsx`
Expected: FAIL - the two new tests fail (the current card has no `font-display` on the name and the `Card` root applies a border), while the three original tests pass.

- [ ] **Step 3: Rewrite the product card component**

Replace the entire body of `components/menu/product-card.tsx` with:

```tsx
"use client"

import { Croissant, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import type { Product } from "@/lib/products/product-types"
import { categoryLabel } from "@/lib/products/product-formatting"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatPrice } from "@/lib/utils/format"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"

/**
 * Menu product card (Atelier Bakery): photo-forward and borderless. Strong
 * 4:3 image, compact text below. Name in the display serif, description in
 * secondary text, plain-text price next to an add-to-cart button. Adding
 * dispatches into the cart context and confirms with a toast.
 *
 * The image is a plain <img> (not next/image) because image_url is
 * admin-supplied and arbitrary; this avoids maintaining a remote-host
 * allowlist in next.config.
 */
export function ProductCard({
  product,
  locale,
}: {
  product: Product
  locale: Locale
}) {
  const t = useTranslations("menu")
  const { add } = useCart()

  function handleAdd() {
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
      category: product.category,
      quantity: 1,
    })
    toast.success(t("added"), { description: product.name })
  }

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-card">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Croissant className="h-10 w-10" aria-hidden />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-medium leading-snug">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
            {categoryLabel(product.category, locale)}
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums">
          {formatPrice(product.price)}
        </span>
      </div>

      {product.description ? (
        <p className="mt-2 line-clamp-2 text-lg text-muted-foreground">
          {product.description}
        </p>
      ) : null}

      <Button
        size="sm"
        variant="outline"
        onClick={handleAdd}
        className="mt-3 self-start"
      >
        <Plus className="me-1 h-4 w-4" />
        {t("addToCart")}
      </Button>
    </div>
  )
}
```

> Note: the `Card`/`CardHeader`/`CardContent`/`CardFooter`/`Badge` imports are removed because the new markup is borderless and does not use them. The description uses `text-lg` (18px) per the spec's product-description scale.

- [ ] **Step 4: Run the full card test file to verify all tests pass**

Run: `npx vitest run __tests__/unit/product-card.test.tsx`
Expected: PASS - all five tests (three original + two new) green.

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/menu/product-card.tsx __tests__/unit/product-card.test.tsx
git commit -m "feat(design): borderless photo-forward product card"
```

---

## Task 6: Full verification and visual proof

Run the complete verification loop and capture screenshots as evidence across both themes and directions.

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: PASS, no errors.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Full unit/integration suite**

Run: `npm run test`
Expected: PASS - all tests green.

- [ ] **Step 4: Format**

Run: `npm run format`
Expected: Prettier writes; review the diff is whitespace-only.

- [ ] **Step 5: Visual verification via preview**

Start the dev server (preview_start) and confirm in the browser preview:

- Home (`/en`) and Menu (`/en/menu`): Flour White background, Oven Black serif headings, warm Parchment card surfaces, gold accent restrained.
- Toggle dark (press "D" or the theme toggle): espresso background, warm cream text, gold accent preserved; body text passes legibility by eye.
- Header wordmark renders in Fraunces serif; body/nav text stays Inter.
- Menu product cards: borderless, image-forward, serif name, plain price; cards with no `image_url` show the warm Croissant fallback.
- Hebrew (`/he/menu`): layout mirrors correctly (RTL), header and cards not visually broken.

Capture screenshots (preview_screenshot) of: light menu (LTR), dark menu (LTR), Hebrew menu (RTL). Share as proof.

- [ ] **Step 6: Commit any formatting changes**

```bash
git add -A
git commit -m "chore(design): apply Prettier formatting to foundation changes"
```

(Skip this commit if `git status` shows no changes after Step 4.)

---

## Self-Review Notes

**Spec coverage:**
- Color system (light + dark remap) -> Tasks 1, 2.
- Typography (Fraunces load, `--font-heading` repoint, heading rule) -> Task 3.
- Proof surface: site header (serif wordmark, logical-property audit) -> Task 4.
- Proof surface: product card (borderless, serif name, plain price, warm fallback, logical spacing, `text-lg` description) -> Task 5.
- Imagery decision (plain `<img>`, no next.config change) -> preserved in Task 5 (no next.config touched anywhere).
- Bilingual/RTL (logical utilities) -> Tasks 4 (audit) and 5 (`me-1`), verified in Task 6 Step 5.
- Dark-mode contrast / gold contrast / image fallback / FOUT -> verified in Task 6 Step 5; Fraunces via `next/font` (self-hosted, swap) addresses FOUT in Task 3.
- Testing/verification (typecheck, test, lint, visual) -> Task 6.
- Non-goals respected: no page layouts rebuilt, no Hebrew marketing copy, no real photography, no business logic.

**Placeholder scan:** No TBD/TODO; every code step shows full code; every command shows expected output.

**Type/name consistency:** `--font-fraunces` variable name is consistent across layout (`variable: "--font-fraunces"`) and globals (`var(--font-fraunces)`). `.font-display` utility defined in Task 3 Step 4 and consumed in Tasks 4 and 5. `ProductCard` props (`product`, `locale`) unchanged, so the existing test's `renderCard` helper still compiles.
