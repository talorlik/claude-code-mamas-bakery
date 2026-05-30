# Admin Reset Customer Password

## Context

Admins need to help customers who are locked out of their accounts. The
self-service forgot-password flow (built in the prior change) covers customers
who can reach the login page, but an admin currently has no way to initiate a
reset on a customer's behalf - for example, a customer who calls the bakery for
help.

This change adds an admin-only **Customers** page that lists every registered
account and lets the admin send a customer a password-reset email. The admin
never sees or sets the password: the customer receives the standard recovery
email and chooses their own new password through the existing `/reset-password`
page. This reuses the self-service infrastructure end to end - no new email
service, tokens, or tables.

## Decisions

- Reset mechanism: the admin action calls
  `supabase.auth.resetPasswordForEmail(email, { redirectTo:
  ${origin}/auth/confirm?next=/reset-password })` - the same call the
  self-service forgot-password action makes. Supabase sends the recovery email
  via its configured SMTP, and the link routes through the existing
  `/auth/confirm` -> `/reset-password` flow.
  - Not `admin.generateLink('recovery')`: that returns a link but does not send
    an email, and this app has no email-sending service of its own.
- Customer source of truth: emails live only in `auth.users`, so the list comes
  from Supabase's privileged `admin.listUsers()` via `createAdminClient()`,
  enriched with `full_name` from `public.profiles`. Customers exist
  independently of orders (0+ orders each).
- Scope: list every registered account; flag admin rows with a badge; allow
  reset on anyone EXCEPT the currently-logged-in admin (who uses self-service).
- Confirm UX: `window.confirm(...)`, matching the existing product-delete
  pattern. No new dialog component.
- Localization: full EN + HE.

## Architecture

Mirrors the existing admin Orders feature (server page fetches data with
`requireAdmin()`, hands it to a client "manager" component that filters,
acts via server actions, and toasts results).

### Data layer - `lib/users/customer-queries.ts`

`listCustomers(): Promise<Customer[]>`

- `await requireAdmin()` (defense in depth even though only admin pages call it).
- `createAdminClient()` (service role) -> `auth.admin.listUsers({ page: 1,
  perPage: 1000 })`. Single page is sufficient for this app's scale; if the
  result is full, log a note (no silent truncation). Document the cap.
- Fetch `profiles` (`user_id, full_name`) and `user_roles` (`user_id` where
  `role = 'admin'`) with the admin client, build lookup maps.
- Map to a `Customer` view type:
  `{ id, email, fullName, createdAt, emailConfirmed, isAdmin }`.
- Sort newest-first by `createdAt` to match the Orders list convention.

Define `Customer` in a small `lib/users/customer-types.ts`.

### Action layer - `lib/users/customer-admin-actions.ts`

`sendCustomerPasswordReset(email: string): Promise<ActionResult<null>>`

- `await requireAdmin()`.
- Validate with `isValidEmail` from `lib/orders/order-validation.ts`.
- Resolve `origin` using the same helper pattern as the self-service
  forgot-password action (`NEXT_PUBLIC_SITE_URL` with localhost fallback) - read
  `headers()`.
- Call `resetPasswordForEmail(email, { redirectTo:
  ${origin}/auth/confirm?next=/reset-password })` on a regular `createClient()`
  (the method is public; admin gate already passed).
- Return `ok(null)` on success, `fail(...)` on a thrown/Supabase error.
- No `revalidatePath` needed (sending a reset does not change listed data).

To avoid duplicating the origin logic, factor the resolver out of the
forgot-password action into a shared helper (e.g.
`lib/utils/site-origin.ts` -> `resolveOrigin()`), and have both call sites use
it. Small, in-scope refactor.

### Page - `app/[locale]/admin/customers/page.tsx`

Server component matching `admin/orders/page.tsx`: `setRequestLocale`,
`await requireAdmin()`, `getTranslations("adminCustomers")`, fetch
`listCustomers()`, render `<CustomersManager customers={...}
currentAdminId={...} />`. Get the current admin id from the `requireAdmin()`
return value (it returns the admin's user id).

### Client - `app/[locale]/admin/customers/customers-manager.tsx`

`"use client"`, mirrors `OrdersManager`:

- Props: `customers: Customer[]`, `currentAdminId: string`.
- Client-side search box filtering by email or name.
- shadcn `Table`: columns email, name, joined date (`formatDate`), a role
  `Badge` for admins, and an action cell.
- Action button "Send reset link" per row, hidden on the row whose
  `id === currentAdminId`.
- On click: `window.confirm` with the customer's email; if confirmed, call
  `sendCustomerPasswordReset(email)`; `toast.success`/`toast.error` on the
  result (`sonner`, as in OrdersManager).
- `EmptyState` from `components/shared/states` when the (filtered) list is
  empty.

### Navigation - `app/[locale]/admin/layout.tsx`

Add a "Customers" `Link` to `/admin/customers` in the admin nav, after
"Orders". Label from `admin.customers`.

## Localization

New `adminCustomers` namespace in both `messages/en.json` and
`messages/he.json`:

- `title`, `heading`, `search`, `email`, `name`, `joined`, `role`, `adminBadge`
- `sendReset` ("Send reset link"),
  `resetConfirm` ("Send a password reset link to {email}?") - if interpolation
  is awkward with `window.confirm`, build the string in the client with the
  email concatenated and keep a plain `resetConfirm` prefix key.
- `resetSent` ("Reset link sent."), `resetError` ("Could not send the reset
  link."), `empty` ("No customers yet.")

Add a `customers` key to the existing `admin` namespace (nav label). Keep EN/HE
key parity (verified in the prior change's process).

## Security

- `requireAdmin()` in the page AND inside both `listCustomers` and
  `sendCustomerPasswordReset` - matches every existing admin action.
- `createAdminClient()` (service role) stays server-only; only the derived
  `Customer[]` (no tokens, no password hashes) crosses to the client.
- `resetPasswordForEmail` is a public auth method; calling it post-admin-gate
  carries no extra privilege.
- The current admin cannot trigger a reset on their own row (UI guard); they use
  self-service. Resetting another admin is allowed (admins are already fully
  privileged).
- Generic toasts; no per-email existence disclosure beyond what the admin
  already sees in the list (the admin is authorized to see it).

## Files

New:

- `lib/users/customer-types.ts`
- `lib/users/customer-queries.ts`
- `lib/users/customer-admin-actions.ts`
- `lib/utils/site-origin.ts` (shared origin resolver)
- `app/[locale]/admin/customers/page.tsx`
- `app/[locale]/admin/customers/customers-manager.tsx`

Modified:

- `app/[locale]/admin/layout.tsx` (nav link)
- `app/[locale]/forgot-password/actions.ts` (use shared `resolveOrigin`)
- `messages/en.json`, `messages/he.json`

Reused as-is:

- `requireAdmin()` (`lib/auth/require-admin.ts`)
- `createAdminClient()` / `createClient()` (`lib/supabase/server.ts`)
- `isValidEmail` (`lib/orders/order-validation.ts`)
- `ActionResult` helpers (`lib/types/action-result.ts`)
- `/auth/confirm` + `/reset-password` (the recovery destination)
- `OrdersManager` as the structural template for `CustomersManager`

## Verification

1. **Build/lint/types**: `npm run lint`, `npm run typecheck`, `npm run build`
   clean. `npm test` green (no regressions).
2. **List renders**: as an admin, open `/admin/customers`; the table lists
   registered accounts with email, name, joined date; admin rows show the role
   badge; the current admin's row has no reset button.
3. **Send reset (happy path)**: click "Send reset link" for a customer, confirm
   the dialog; a success toast appears; the customer receives the recovery email
   and can set a new password via `/reset-password`, then sign in with it.
4. **Authorization**: a non-admin hitting `/admin/customers` is redirected
   (layout + page guard); calling `sendCustomerPasswordReset` without admin is
   rejected by the in-action `requireAdmin`.
5. **Search**: typing an email/name fragment filters the table client-side.
6. **Localization**: switch to HE; the nav link, page, table headers, button,
   and confirm/toast strings render translated and RTL-correct. EN/HE
   `adminCustomers` key parity holds.
7. **Self-row guard**: the logged-in admin cannot send a reset to their own
   account from this page.
