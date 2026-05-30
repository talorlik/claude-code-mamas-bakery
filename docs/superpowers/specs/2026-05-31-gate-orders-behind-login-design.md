# Gate Order Viewing Behind Login

## Problem

The `/orders` page is a public order-lookup form: a visitor types any phone
number or email and the server runs an exact-match query through the
service-role admin client, returning the matching orders. This lets any
unauthenticated visitor read anyone else's orders by guessing or knowing a
phone/email - an order-enumeration and PII-disclosure hole. The "My Orders"
navigation link is also shown to everyone, including guests.

The cart is intentionally left public: checkout already requires login
(`createOrder` rejects unauthenticated submits), so guests can browse and build
a cart but must sign in before placing an order. That behavior does not change.

## Goals

- A guest cannot reach `/orders` or read any order.
- The "My Orders" nav link appears only when a user is signed in.
- A signed-in user sees only their own orders on `/orders`.
- The cart remains publicly accessible.

## Non-Goals

- No change to the checkout/order-creation flow.
- No change to admin order management.
- No new database schema or RLS policies (the required `user_id` column and
  "Users can read own orders" RLS policy already exist).

## Approach

Replace the public phone/email lookup with an authenticated "My Orders"
account view backed by the existing, RLS-respecting `getOrdersForUser(userId)`
query. Protect the route in middleware and re-check the session in the page
itself (defense in depth), then delete the now-dead lookup code. Gate the nav
link on auth state.

This is a net security improvement on two axes: the enumeration surface is
removed entirely, and the read path moves off the RLS-bypassing admin client
onto the request-scoped server client where the "Users can read own orders"
policy is enforced as a real second layer.

## Changes

### 1. Route protection (middleware)

In `lib/supabase/middleware.ts`, add `/orders` and `/orders/*` to the protected
allowlist (the `isProtected` expression that currently covers `/admin`,
`/profile`, `/chat`). A guest hitting `/orders` is redirected to locale-aware
login with the existing `notice=Please sign in to continue.` query param.

Update the explanatory comment above the allowlist, which currently names
"order lookup" as a public route - it would otherwise contradict the new
behavior.

### 2. Page becomes an authenticated owned-orders list

Rewrite `app/[locale]/orders/page.tsx`:

- Resolve the user with `createClient().auth.getUser()`.
- If `user` is null, `redirect()` to the locale-aware login. This is the
  defense-in-depth layer: middleware gates the route, but the page re-checks
  because a page/action can be reached directly. Mirrors the pattern used by
  `requireAdmin` and by the duplicate rate-limit check in `createOrder`.
- Call `getOrdersForUser(user.id)` (already in `lib/orders/order-queries.ts`)
  and render the results.
- Keep `robots: { index: false, follow: false }` in `generateMetadata`.

The order-card presentation (status/payment badges, line items, totals)
currently lives inside the `OrdersLookup` client component. Move it into a small
presentational component (e.g. `components/orders/order-card.tsx`) or inline it
in the server page. Since there is no longer an interactive form, the page can
be fully server-rendered - no `"use client"` needed for the list.

Empty state: when `getOrdersForUser` returns `[]`, show an `EmptyState` with
"You have no orders yet." copy.

### 3. Delete the lookup code

Remove, after a final reference check at implementation time:

- `lib/orders/order-lookup.ts` (the `lookupOrders` server action).
- `app/[locale]/orders/orders-lookup.tsx` (the `OrdersLookup` client form).
- `validateLookup` in `lib/orders/order-validation.ts`. Verified to be imported
  only by `order-lookup.ts`; remove it (and any now-unused imports it leaves
  behind in `order-validation.ts`). Leave the rest of `order-validation.ts`
  untouched.

No `__tests__` or `e2e` file references these symbols (verified), so no test
deletions are required for the removal itself.

### 4. Gate the nav link

In `components/shared/site-header.tsx`, wrap the `/orders` link in
`{user ? (...) : null}`, the same pattern already used for the admin and profile
controls. Update the component docstring, which currently states that
"My Orders" is always shown.

### 5. Translations

Switch `/orders` copy to account-style and prune the lookup-only strings in
both `messages/en.json` and `messages/he.json` under the `orders` namespace:

- Repurpose `heading` -> "My Orders" / "ההזמנות שלי".
- Repurpose `description` -> "Your order history." / Hebrew equivalent.
- Add an empty-state key (e.g. `empty`) -> "You have no orders yet." / Hebrew
  equivalent.
- Remove now-unused keys: `lookupLabel`, `lookupPlaceholder`, `search`,
  `searching`, `noResults`. Keep `title`, `orderedOn`, `pickupOn`, `total`,
  which the card still uses.

`nav.orders` ("My Orders" / "ההזמנות שלי") is unchanged; only its visibility
changes.

## Data Flow (after)

```
Guest -> GET /he/orders
  proxy.ts -> next-intl -> updateSession: isProtected, no user
  -> redirect /he/login?notice=Please sign in to continue.

User -> GET /he/orders
  proxy.ts -> updateSession: user present, allowed
  -> page.tsx: getUser() (re-check) -> getOrdersForUser(user.id)
     (server client, RLS "Users can read own orders")
  -> render own orders, newest first
```

## Error Handling

- Guest at `/orders`: redirect to login (middleware), redundant redirect in
  page if reached directly.
- `getOrdersForUser` already returns `[]` on query error or no rows; the page
  renders the empty state rather than surfacing a raw error.
- No admin client is used on this path, so an RLS failure returns no rows rather
  than leaking other users' data.

## Testing

- Unit: middleware allowlist - assert `/orders` and `/orders/sub` are protected
  (guest -> redirect) and pass through for an authenticated user, alongside the
  existing protected-route assertions if present.
- E2E (`e2e/`, English locale):
  - Signed-out visit to `/orders` redirects to `/login`.
  - Signed-in user sees their own orders and the "My Orders" nav link.
  - Signed-out header does not render the "My Orders" link.
- Verification: `npm run typecheck` and `npm run test`. E2E requires a working
  Supabase connection and admin credentials (per `docs/TESTING.md`) and is not
  part of the default loop.

## Risks / Notes

- The order-card markup must be ported faithfully when it moves out of the
  client form so the rendered output is unchanged for signed-in users.
- Removing `validateLookup` depends on it having no other importer; re-confirm
  with a repo-wide grep at implementation time before deleting.
