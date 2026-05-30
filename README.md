# Mom's Bread - Boutique Bakery Orders

Mom's Bread is a localized bakery ordering app built for a home-based
boutique bakery. Customers can browse available baked goods, manage a cart,
place pickup or delivery orders, and track order status. The bakery admin can
manage products, orders, customers, stock, payments, and analytics from a
protected dashboard.

This project started from the private AI Game Changer App Template. The
original Hebrew template README has been translated to English and updated to
describe the current `mamas-bakery` application. For the source template
reference, see the
[AI Game Changer App Template PDF](docs/app-template/AI%20GAME%20CHANGER%20-%20App%20Template.pdf).

## Current Status

The app has moved beyond the base template and now includes:

- Public landing, menu, cart, order lookup, auth, and profile pages.
- English and Hebrew localization through `next-intl`.
- RTL layout support for Hebrew and LTR layout support for English.
- Supabase-backed products, profiles, orders, order items, and roles.
- Authenticated checkout with server-side price, stock, and delivery validation.
- Pickup and demo delivery flows with flat-fee carrier options.
- Customer account profiles with saved contact and delivery details.
- Admin-only product, order, customer, and analytics pages.
- Product stock tracking, low-stock indicators, and image upload support.
- Order status and payment controls for admins.
- Optional order confirmation email through a Supabase Edge Function.
- Optional Upstash Redis rate limiting for auth, password reset, and orders.
- Authenticated AI chat route through Vercel AI Gateway.
- Unit, integration, and Playwright E2E test coverage.

## Tech Stack

- Next.js 16.1.7 with the App Router and Turbopack.
- React 19.2.4.
- TypeScript 5.9 with strict mode.
- Tailwind CSS 4.
- shadcn/ui, Base UI, and lucide-react.
- Supabase Auth, SSR helpers, Postgres, RLS, Storage, and Edge Functions.
- Vercel AI SDK with Vercel AI Gateway.
- Vitest, React Testing Library, jsdom, and Playwright.
- ESLint 9 and Prettier with `prettier-plugin-tailwindcss`.

## Local Setup

Use Node 20 or newer. Node 24 LTS is recommended.

1. Install dependencies:

   ```bash
   npm install
   ```

1. Create local environment variables:

   ```bash
   cp .env.example .env.local
   ```

1. Fill in the values in `.env.local`.

1. Run the development server:

   ```bash
   npm run dev
   ```

1. Open the app:

   ```text
   http://localhost:3000
   ```

Locale-aware routes use an explicit prefix after detection, for example
`/en/menu` and `/he/menu`.

## Environment Variables

The app reads these variables from `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

AI_GATEWAY_API_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000

EMAIL_ENABLED=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is browser-safe.
- `SUPABASE_SECRET_KEY` is server-only. Never expose it to client code.
- `AI_GATEWAY_API_KEY` is server-only and powers `/api/chat`.
- Set `EMAIL_ENABLED=true` only when the `send-order-email` Edge Function
  and SMTP secrets are configured.
- Upstash variables are optional. When unset, rate limiting no-ops in local
  development.

## Main Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/[locale]` | Public | Landing page and primary menu call to action. |
| `/[locale]/menu` | Public | Product catalog, search, filters, and add to cart. |
| `/[locale]/cart` | Signed-in checkout | Cart review and pickup or delivery order form. |
| `/[locale]/orders` | Public lookup | Find orders by exact phone or email. |
| `/[locale]/login` | Public | Sign in, sign up, and auth notices. |
| `/[locale]/forgot-password` | Public | Request a password reset link. |
| `/[locale]/reset-password` | Public | Set a new password from an auth link. |
| `/[locale]/profile` | Signed in | Account details, saved address, and past orders. |
| `/[locale]/chat` | Signed in | AI Gateway chat UI. |
| `/[locale]/admin` | Admin | Admin dashboard shell. |
| `/[locale]/admin/products` | Admin | Product CRUD, availability, stock, and images. |
| `/[locale]/admin/orders` | Admin | Order list, filters, details, status, and payment. |
| `/[locale]/admin/orders/[orderId]` | Admin | Mobile-friendly order detail route. |
| `/[locale]/admin/customers` | Admin | Customer list and password reset links. |
| `/[locale]/admin/analytics` | Admin | Revenue, status, product, and fulfillment charts. |

## Database And Supabase

Database migrations live in `supabase/migrations`.

The current schema includes:

- `products` with category, availability, stock, low-stock threshold, and image.
- `orders` with account ownership, customer details, pickup or delivery data,
  total amount, status, and payment state.
- `order_items` with product name and unit price snapshots.
- `profiles` for customer contact and saved delivery address details.
- `user_roles` for admin authorization.
- Storage policies for product images.
- RLS policies for public product reads, own-order reads, and admin access.
- Admin-only RPCs for analytics aggregates.
- Atomic stock decrement and increment functions for order creation rollback.

The app uses Supabase server actions and server components for privileged work.
Client code never receives the Supabase secret key.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run setup` | Runs the template setup script. Mostly for first install. |
| `npm run dev` | Starts the Next.js dev server with Turbopack. |
| `npm run build` | Creates a production build. |
| `npm run start` | Serves the production build locally. |
| `npm run lint` | Runs ESLint. |
| `npm run format` | Formats TypeScript and TSX files with Prettier. |
| `npm run typecheck` | Runs TypeScript without emitting files. |
| `npm run test` | Runs Vitest once. |
| `npm run test:watch` | Runs Vitest in watch mode. |
| `npm run test:e2e` | Runs Playwright E2E tests. |

## Testing

The repository includes:

- Unit tests for formatting, validation, cart utilities, filters, roles,
  carriers, email rendering, rate limiting, and UI components.
- Integration tests for product actions, order actions, order lookup, and admin
  order actions.
- Playwright E2E tests for customer ordering and admin order management.

Recommended local verification:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run Playwright when browser-level coverage is needed:

```bash
npm run test:e2e
```

## Project Structure

```text
app/                      Next.js App Router routes
app/[locale]/             Localized English and Hebrew pages
app/api/chat/             Authenticated AI chat route
components/               Shared, menu, cart, admin, order, and UI components
i18n/                     next-intl routing and navigation helpers
lib/                      Supabase, auth, products, orders, email, and utilities
messages/                 English and Hebrew translation files
supabase/migrations/      Database, RLS, storage, delivery, and analytics SQL
__tests__/                Unit and integration tests
e2e/                      Playwright tests
docs/                     Assignment, planning, prompts, and template reference
```

## Admin Access

Admin routes are protected server-side by `requireAdmin()` and backed by the
`user_roles` table. To grant admin access, add an `admin` role row for the
target Supabase Auth user.

Example SQL:

```sql
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'admin')
on conflict do nothing;
```

Replace the UUID with the user's Supabase Auth ID.

## Template Lineage

The original AI Game Changer template provides the base setup for:

- Next.js App Router.
- shadcn/ui and Tailwind CSS.
- Supabase configuration.
- Claude Code commands, skills, and MCP-ready workflow.
- Vercel AI Gateway.
- GitHub and Vercel deployment flow.

This repository keeps that foundation and layers the Mom's Bread bakery
assignment implementation on top of it.

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel AI SDK](https://ai-sdk.dev)
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
