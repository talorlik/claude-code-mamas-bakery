# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Mom's Bakery" (`mamas-bakery`): a Next.js 16 (App Router, React 19) bakery storefront with a customer-facing menu/cart/order flow, an admin back office, transactional email, an AI chat assistant, and full English/Hebrew (LTR/RTL) localization. Data and auth are on Supabase. Deployed on Vercel.

## Commands

```bash
npm run dev          # Next dev server with Turbopack (localhost:3000)
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint (eslint-config-next)
npm run format       # Prettier write over **/*.{ts,tsx}
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit + integration (run once)
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E (auto-starts dev server on :3000)
npm run setup        # interactive env/credential bootstrap (scripts/setup.mjs)
```

Run a single unit/integration test: `npx vitest run __tests__/unit/cart-utils.test.ts` (or pass `-t "name"` to filter by test name). Run a single E2E spec: `npx playwright test e2e/customer-order.spec.ts`.

Before claiming work is done, run `npm run typecheck` and `npm run test`. E2E requires a working Supabase connection and admin credentials (see `docs/TESTING.md`); they are not part of the default verification loop.

## Architecture

### Locale routing + auth middleware (the most non-obvious part)

The middleware entrypoint is `proxy.ts` at the repo root, not `middleware.ts` (Next 16 renamed the convention). It composes two concerns in a fixed order:

1. `next-intl` locale routing runs first. It detects the locale from `Accept-Language` on first visit, persists it in a cookie, and may issue a redirect to add a `/[locale]` prefix (e.g. `/menu` -> `/he/menu`). When it redirects, `proxy.ts` returns immediately and lets the redirected request run the full pipeline again.
2. Sensitive POSTs are rate-limited (see below).
3. `updateSession` (`lib/supabase/middleware.ts`) refreshes the Supabase auth session and enforces route protection, **layering its cookies onto the same response object** the next-intl middleware produced, so locale and auth cookies are emitted together. Do not break this layering by creating a new response.

Route protection is a **protected allowlist**, not a public blocklist: only `/admin`, `/admin/*`, `/profile`, `/profile/*`, and `/chat` require a session. Everything else (menu, cart, order lookup, login) is public so guests can browse. Adding a new private page means adding it to the allowlist in `lib/supabase/middleware.ts`. The middleware `matcher` in `proxy.ts` deliberately excludes `api` and `auth` routes; the `auth` exclusion is critical because those Supabase handlers (`app/auth/signout`, `app/auth/confirm`) are non-localized and would 404 if next-intl tried to locale-prefix them.

Inside the app, **always use the locale-aware navigation primitives** from `i18n/navigation.ts` (`Link`, `redirect`, `useRouter`, `usePathname`) instead of `next/link` / `next/navigation`, so locale prefixes are preserved. Locales and their text direction are defined in `i18n/routing.ts` (`routing`, `LOCALE_DIRECTION`). Translations live in `messages/en.json` and `messages/he.json`.

### Supabase clients

Three client factories in `lib/supabase/`:

- `createClient()` (`server.ts`): request-scoped, uses the **publishable** key, respects RLS, carries the user's session. Default for reading user-owned data and resolving the current user.
- `createAdminClient()` (`server.ts`): uses the **secret** key, bypasses RLS. Use only server-side for writes that have no public RLS policy by design (order/order_item inserts, stock RPCs, admin mutations, invoking the email Edge Function). Never expose its results paths to the client.
- `createClient()` (`client.ts`): browser client for client components.

The "remember me" feature is implemented via `lib/supabase/cookie-persistence.ts`: when the user opts out of persistent login, both `server.ts` and `middleware.ts` strip expiry from auth cookies on every write so the session vanishes on browser close. Both the server-component path and the middleware refresh path must apply this, or a session-only login silently re-persists.

### Auth and admin

`getCurrentUserRole()` / `isAdmin()` live in `lib/auth/roles.ts` and always call `supabase.auth.getUser()` (which revalidates against Supabase) rather than trusting the session cookie. `requireAdmin()` (`lib/auth/require-admin.ts`) is the **authoritative** admin guard: it `redirect()`s non-admins, so a normal return proves admin access. It is called from `app/[locale]/admin/layout.tsx`. RLS on data tables is a second layer, never the only one. The admin role is a row in `public.user_roles` (`role = 'admin'`); it is granted by SQL only, never through the UI (see `docs/ADMIN_SETUP.md`).

### Server actions and the ActionResult contract

All server actions and route handlers return `ActionResult<T>` (`lib/types/action-result.ts`): a discriminated union `{ ok: true, data }` | `{ ok: false, error, fieldErrors? }`. Construct with the `ok(data)` and `fail(message, fieldErrors?)` helpers; callers narrow on `.ok`. `error` must be a user-safe message; `fieldErrors` maps form field names to per-field messages for inline form validation.

### Domain layer (`lib/`)

Business logic is organized by domain, with a consistent file-suffix convention within each: `*-actions.ts` (server actions, `"use server"`), `*-queries.ts` (reads), `*-validation.ts` (input validation), `*-types.ts`, `*-formatting.ts`/`*-filters.ts` (pure helpers). Domains: `orders/`, `products/`, `users/`, `profile/`, `analytics/`, `delivery/`, `cart/`, `email/`, `rate-limit/`.

`lib/orders/order-actions.ts#createOrder` is the canonical example of the security model and worth reading before touching the order flow: prices, availability, and delivery fees are **re-derived server-side from the database** and client-sent values are ignored; product name and unit price are snapshotted onto order items; accounts are mandatory and the order email comes from the authenticated account, not the form; stock is decremented atomically via the `decrement_stock` RPC with full compensating rollback (re-increment + delete order/items) on any shortfall; order-number collisions (Postgres `23505`) are retried; and email/profile side effects are fire-and-forget so they never fail a committed order.

### Rate limiting

`lib/rate-limit/limiter.ts` uses Upstash Redis with named sliding-window buckets (`auth`, `order`, `passwordReset`). It **degrades gracefully to a no-op** when `UPSTASH_REDIS_REST_URL`/`TOKEN` are unset (local dev, tests) and **fails open** on a Redis outage. Limiting is applied in two places by design (defense in depth): in `proxy.ts` for the relevant POSTs, and again inside `createOrder` because server actions can be invoked directly.

### Email

`lib/email/send.ts#sendEmail` transmits a pre-rendered email through the `send-order-email` Supabase Edge Function (`supabase/functions/send-order-email/`), which holds SMTP credentials as function secrets. The app renders templates (`lib/email/templates/`, locale-aware) but never holds SMTP creds. When `EMAIL_ENABLED !== "true"` it logs a stub instead of sending, so the order flow works offline. All failures are swallowed and returned as a boolean.

### AI chat

`app/api/chat/route.ts` streams via the Vercel AI SDK (`streamText`, model `anthropic/claude-sonnet-4.5`) routed through the AI Gateway when `AI_GATEWAY_API_KEY` is set. The endpoint is auth-gated so anonymous traffic cannot drain the gateway credit.

### Database

Schema and policies live in versioned SQL under `supabase/migrations/` (numbered `0001`+). Core tables: `products`, `orders`, `order_items`, `user_roles`, `profiles`, plus enums (`product_category`, `order_status`, `app_role`) and stock RPCs (`decrement_stock`, `increment_stock`). RLS is enabled on all tables; the order-insert surface is intentionally closed (no public insert policy), which is why writes go through the admin client. Generated types are in `lib/supabase/database.types.ts` (regenerate with the Supabase MCP `generate_typescript_types` after schema changes). The Supabase project is wired via the `supabase` MCP server in `.mcp.json`.

## Conventions

- Path alias `@/*` maps to the repo root (configured in both `tsconfig.json` and `vitest.config.ts`). Use it for all internal imports.
- App routes are under `app/[locale]/`; non-localized Supabase handlers under `app/auth/`; API under `app/api/`. Each domain's UI manager components live in `components/<domain>/`; shadcn/Base UI primitives in `components/ui/`.
- TypeScript is `strict`. Public-facing functions carry explanatory docstrings; match the existing density of "why" comments on non-obvious decisions (cookie persistence, rollback ordering, middleware composition).
- Unit/integration tests live in `__tests__/` (Vitest, jsdom); E2E in `e2e/` (Playwright, English locale). `e2e/` is excluded from Vitest.
```
