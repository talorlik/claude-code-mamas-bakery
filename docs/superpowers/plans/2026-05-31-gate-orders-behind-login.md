# Gate Order Viewing Behind Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the public phone/email order-lookup at `/orders` into an authenticated "My Orders" view that shows only the signed-in user's own orders, gate the nav link on auth, and remove the order-enumeration hole.

**Architecture:** Add `/orders` to the middleware protected allowlist; rewrite the page as a server component that resolves the user, re-checks the session (defense in depth), and renders `getOrdersForUser(user.id)` using the same card pattern as the profile page; delete the lookup action, client form, validator, and their tests; gate the header link; prune lookup-only i18n keys.

**Tech Stack:** Next.js 16 App Router (React 19 server components), next-intl, Supabase (RLS-respecting server client), Vitest, Playwright.

---

## Pre-flight: branch

The repo is on `main`. Create a feature branch before any change.

- [ ] **Step 1: Branch**

```bash
git checkout -b feat/gate-orders-behind-login
```

---

## Task 1: Protect `/orders` in middleware

**Files:**
- Modify: `lib/supabase/middleware.ts:81-91`

There is no existing unit test for `updateSession` (it requires Supabase env and
`createServerClient`); route protection is verified end-to-end in Task 6. This
task is the one-line allowlist change plus a comment fix.

- [ ] **Step 1: Add `/orders` to the protected allowlist**

In `lib/supabase/middleware.ts`, replace the comment block and `isProtected`
expression (currently lines 81-91):

```typescript
  // Only a few routes require a session. Everything else - the menu, cart,
  // login, auth handlers - is public, so guests can browse and build a cart.
  // Order viewing is private: /orders shows the signed-in user's own orders.
  // Expressed as a protected allowlist so new public pages are not
  // accidentally gated.
  const pathname = stripLocale(request.nextUrl.pathname)
  const isProtected =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/") ||
    pathname === "/chat"
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/middleware.ts
git commit -m "feat(auth): protect /orders route behind login"
```

---

## Task 2: Repurpose the `orders` i18n namespace

**Files:**
- Modify: `messages/en.json` (`orders` namespace)
- Modify: `messages/he.json` (`orders` namespace)

Switch to account-style copy and remove the lookup-only keys. Keep `title`,
`orderedOn`, `pickupOn`, `total`, `status`, `payment` (still used by the card).
Remove `heading` (repurposed), `description` (repurposed), `lookupLabel`,
`lookupPlaceholder`, `search`, `searching`, `noResults`, `error`. Add `empty`.

- [ ] **Step 1: Update `messages/en.json`**

Replace the entire `"orders"` object with:

```json
  "orders": {
    "title": "My Orders",
    "heading": "My Orders",
    "description": "Your order history.",
    "empty": "You have no orders yet.",
    "orderedOn": "Ordered",
    "pickupOn": "Pickup",
    "total": "Total",
    "status": "Status",
    "payment": "Payment"
  },
```

- [ ] **Step 2: Update `messages/he.json`**

Replace the entire `"orders"` object with:

```json
  "orders": {
    "title": "ההזמנות שלי",
    "heading": "ההזמנות שלי",
    "description": "היסטוריית ההזמנות שלך.",
    "empty": "אין לך הזמנות עדיין.",
    "orderedOn": "הוזמן",
    "pickupOn": "איסוף",
    "total": "סך הכול",
    "status": "סטטוס",
    "payment": "תשלום"
  },
```

- [ ] **Step 3: Verify both files are valid JSON**

Run: `node -e "require('./messages/en.json'); require('./messages/he.json'); console.log('ok')"`
Expected: prints `ok`.

- [ ] **Step 4: Commit**

```bash
git add messages/en.json messages/he.json
git commit -m "i18n(orders): account-style copy, drop lookup-only keys"
```

---

## Task 3: Rewrite `/orders` as an authenticated My Orders page

**Files:**
- Rewrite: `app/[locale]/orders/page.tsx`
- Reference (reuse): `components/orders/order-badges.tsx`
  (`OrderStatusBadge`, `PaymentStatusBadge`)
- Reference (pattern): `app/[locale]/profile/page.tsx`

The page becomes a server component that resolves the user, redirects guests
(defense-in-depth re-check; mirrors the profile page's `redirect()` +
`throw new Error("unreachable")` idiom for type-narrowing), and renders the
user's own orders via the existing `getOrdersForUser`. No client component, no
form.

- [ ] **Step 1: Replace the file contents**

Overwrite `app/[locale]/orders/page.tsx` with:

```tsx
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOrdersForUser } from "@/lib/orders/order-queries"
import type { Locale } from "@/lib/orders/order-formatting"
import { formatDate, formatPrice } from "@/lib/utils/format"
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/order-badges"
import { EmptyState } from "@/components/shared/states"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "orders" })
  // Private account view; keep it out of the index.
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  }
}

/**
 * Authenticated "My Orders" page. Shows only the signed-in user's own orders,
 * read through the RLS-respecting server client. The route is gated in
 * middleware; this re-check redirects a guest who reaches the page directly.
 */
export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("orders")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/login", locale })
    throw new Error("unreachable") // redirect() halts; narrows `user` below.
  }

  const orders = await getOrdersForUser(user.id)
  const lang = locale as Locale

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {order.order_number}
                  </CardTitle>
                  <div className="flex gap-2">
                    <OrderStatusBadge status={order.status} locale={lang} />
                    <PaymentStatusBadge isPaid={order.is_paid} locale={lang} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p className="text-muted-foreground">
                  {t("orderedOn")} {formatDate(order.created_at)} ·{" "}
                  {t("pickupOn")} {formatDate(order.pickup_date)}
                </p>
                <ul>
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between border-b py-1 last:border-b-0"
                    >
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.line_total)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: FAIL — `./orders-lookup` import is now gone from this file, but
`orders-lookup.tsx` still imports the soon-to-be-deleted action. This is
resolved in Task 4. If the only errors reference `orders-lookup.tsx` /
`order-lookup.ts`, proceed; otherwise fix this file first.

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/orders/page.tsx"
git commit -m "feat(orders): render signed-in user's own orders"
```

---

## Task 4: Delete the lookup code and its tests

**Files:**
- Delete: `app/[locale]/orders/orders-lookup.tsx`
- Delete: `lib/orders/order-lookup.ts`
- Delete: `__tests__/integration/order-lookup.test.ts`
- Delete: `__tests__/unit/order-lookup-validation.test.ts`
- Modify: `lib/orders/order-validation.ts` (remove `validateLookup` +
  `LookupQuery`)

- [ ] **Step 1: Confirm no remaining importers of the deleted symbols**

Run:

```bash
grep -rn "OrdersLookup\|lookupOrders\|validateLookup\|LookupQuery\|orders-lookup\|order-lookup" \
  --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Expected: every hit is inside one of the five files listed above. If anything
else references them, stop and reconcile before deleting.

- [ ] **Step 2: Delete the four files**

```bash
git rm "app/[locale]/orders/orders-lookup.tsx" \
  lib/orders/order-lookup.ts \
  __tests__/integration/order-lookup.test.ts \
  __tests__/unit/order-lookup-validation.test.ts
```

- [ ] **Step 3: Remove `validateLookup` and `LookupQuery` from `order-validation.ts`**

In `lib/orders/order-validation.ts`, delete the `LookupQuery` type (currently
lines 69-75) and the `validateLookup` function (currently lines 77-104),
including their doc comments. Keep `isValidEmail` and `normalizePhone` — they
are still used by `validateOrderCustomer`. The block to remove begins with:

```typescript
/**
 * The classified result of an order-lookup query: either an exact email or a
 * normalized phone number to match against.
 */
export type LookupQuery =
```

and ends with the closing brace of `validateLookup`:

```typescript
  return ok({ kind: "phone", value: phone })
}
```

After removal, `normalizePhone` should be immediately followed by the
`validateOrderCustomer` doc comment.

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS (the Task 3 dangling-import errors are now resolved).

- [ ] **Step 5: Run the unit + integration suite**

Run: `npm run test`
Expected: PASS. The two deleted test files no longer run; the remaining suites
(including `order-validation.test.ts`, which never referenced `validateLookup`)
pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(orders): remove public order-lookup and its tests"
```

---

## Task 5: Gate the "My Orders" nav link

**Files:**
- Modify: `components/shared/site-header.tsx:11-16` (docstring)
- Modify: `components/shared/site-header.tsx:38-40` (the `/orders` link)

- [ ] **Step 1: Update the docstring**

Replace the component doc comment (currently lines 11-16) with:

```tsx
/**
 * Top navigation shared across all pages. Server-rendered so it can reflect
 * the current auth and admin state: signed-out users see a Sign in link;
 * signed-in users see their account, their orders, and a sign-out control;
 * admins also see an Admin link. Home, Menu, and Cart are always shown.
 */
```

- [ ] **Step 2: Gate the `/orders` link on `user`**

Replace the unconditional link (currently lines 38-40):

```tsx
          <Link href="/orders" className="hover:underline">
            {t("orders")}
          </Link>
```

with:

```tsx
          {user ? (
            <Link href="/orders" className="hover:underline">
              {t("orders")}
            </Link>
          ) : null}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/shared/site-header.tsx
git commit -m "feat(nav): show My Orders link only when signed in"
```

---

## Task 6: Update E2E coverage

**Files:**
- Modify: `e2e/customer-order.spec.ts:75-86` (replace the lookup test)
- Modify: `e2e/customer-order.spec.ts:15-29` (extend the signed-out test)

E2E requires a working Supabase connection and admin credentials and is not part
of the default verification loop (`docs/TESTING.md`). Write the tests; running
them is optional in this environment.

- [ ] **Step 1: Replace the lookup test with a guest-redirect test**

In `e2e/customer-order.spec.ts`, replace the final test (currently lines 75-86,
`"order lookup with a non-matching email shows no results"`) with:

```typescript
test("signed-out visit to /orders redirects to login", async ({ page }) => {
  await page.goto("/en/orders")
  await expect(page).toHaveURL(/\/en\/login/, { timeout: 15_000 })
})
```

- [ ] **Step 2: Assert the My Orders link is hidden for guests**

In the `"signed-out checkout is gated behind sign-in"` test, after the existing
`page.goto("/en/menu")` and the menu heading assertion (around line 17), add:

```typescript
  // The My Orders link is hidden until the visitor signs in.
  await expect(
    page.getByRole("link", { name: /my orders/i })
  ).toHaveCount(0)
```

- [ ] **Step 3: Assert the signed-in user sees their order at /orders**

In the `"customer can place a pickup order and see it in their history"` test,
after the existing profile assertion (currently the last lines, around 70-71),
add:

```typescript
    // The order also appears on the dedicated My Orders page.
    await page.goto("/en/orders")
    await expect(page.getByText(orderNumber!)).toBeVisible({ timeout: 15_000 })
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add e2e/customer-order.spec.ts
git commit -m "test(e2e): cover /orders auth gate and own-orders view"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full typecheck + unit/integration suite**

Run: `npm run typecheck && npm run test`
Expected: both PASS.

- [ ] **Step 2: Lint + format**

Run: `npm run lint && npm run format`
Expected: lint passes; format writes no unexpected changes (review `git diff`).

- [ ] **Step 3: Confirm no stragglers**

Run:

```bash
grep -rn "lookupOrders\|validateLookup\|OrdersLookup\|LookupQuery" \
  --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Expected: no output.

- [ ] **Step 4: Commit any format changes**

```bash
git add -A
git commit -m "chore: lint/format pass" || echo "nothing to commit"
```

---

## Coverage Check (plan vs. spec)

- Spec change 1 (middleware) -> Task 1.
- Spec change 2 (page becomes owned-orders list, in-page re-check) -> Task 3.
- Spec change 3 (delete lookup action/form/validator + tests) -> Task 4.
- Spec change 4 (gate nav link, fix docstring) -> Task 5.
- Spec change 5 (i18n account copy, prune keys) -> Task 2.
- Spec testing section (E2E guest redirect, own-orders view, hidden link) ->
  Task 6. Middleware unit test intentionally omitted: no `updateSession` test
  harness exists and the route gate is covered E2E (documented in Task 1).
- Cart stays public: untouched (no task modifies cart or `createOrder`).
