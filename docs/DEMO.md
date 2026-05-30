# Demo Script: Mom's Bread Bakery

A short, repeatable walkthrough of the full order lifecycle, plus the
verification checklist used to confirm the app is submission-ready.

## Prerequisites

- `npm run dev` is running and the app is reachable (default
  `http://localhost:3000`).
- The seeded sample products exist (from
  `supabase/migrations/0002_bakery_seed.sql`): four available products and one
  unavailable.
- An admin account exists (see [Admin Setup](ADMIN_SETUP.md)). The configured
  admin is `talorlik@gmail.com`.

## Quality Gates

Run before demoing or submitting:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Expected: typecheck, tests (105), build, and E2E (3 pass, admin flow skips
without `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`) all succeed. Lint reports a
single pre-existing error in the unused generated `components/ui/carousel.tsx`
(documented in the baseline audit).

## Customer Flow

1. Open the menu at `/` then **Menu** (or `/en/menu`). Only available products
   appear; the unavailable seed product is hidden.
2. Add two products to the cart. The cart indicator in the header updates
   immediately.
3. Open **Cart**. Adjust a quantity with the steppers; the line and order
   totals update live.
4. Fill the pickup form: full name, phone, email, and a pickup date (today or
   later - past dates are rejected).
5. Click **Place order**. A confirmation appears with an `MB-YYYYMMDD-XXXX`
   order number. The cart clears.
6. Open **My Orders** (`/en/orders`). Search by the email or phone you used.
7. The order appears with its items, total, and status / payment badges.

## Admin Flow

1. Sign in as the admin (`/en/login`). Admins are routed to `/admin`.
2. Open **Orders** (`/en/admin/orders`). Orders are listed newest-first.
3. Use the search and status / pickup-date filters to find the test order.
4. Click **Details** to open the order drawer with customer info and items.
5. Change the status to **Ready for Pickup**.
6. Click **Mark paid**.
7. (Products) Open **Products** to add, edit, toggle availability, or delete a
   product. Toggling a product unavailable removes it from the public menu.

## Closing the Loop

1. Return to the customer **My Orders** page and search for the same order.
2. Confirm the updated status (**Ready for Pickup**) and **Paid** state are
   visible to the customer.

## Language and Theme

- Use the language switcher in the header to flip between Hebrew and English.
  Hebrew renders right-to-left (`dir="rtl"`); English left-to-right. The choice
  persists across navigation.
- Use the theme toggle to switch light / dark mode.

## Verification Checklist

- [ ] `npm run dev` starts the app.
- [ ] Menu shows only available products from Supabase.
- [ ] Add-to-cart updates the cart indicator and cart page.
- [ ] Cart totals are correct and update with quantity changes.
- [ ] Order submission creates one order plus matching order items with
      product-name and unit-price snapshots.
- [ ] Past pickup dates and unavailable products are rejected server-side.
- [ ] My Orders finds orders by exact phone or email; wrong input returns none.
- [ ] `/admin` is protected: signed-out users are sent to login, non-admins
      to home.
- [ ] Admin can create, edit, delete, and toggle product availability.
- [ ] Admin can update order status and payment; the customer view reflects it.
- [ ] Hebrew RTL and English LTR both render correctly; dark mode works.
- [ ] SEO metadata is set on public pages; admin and account pages are
      no-index.
- [ ] Git history has meaningful, atomic commits per milestone.
