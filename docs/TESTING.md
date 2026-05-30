# Testing

How the test suites are organized and how to run them.

## Strategy

The project uses three layers:

- **Unit tests** (`__tests__/unit`): pure logic with no I/O - cart math,
  validation, formatting, status and category label maps, order-number
  generation, and order filtering. Component tests for the cart and product
  forms render with React Testing Library.
- **Integration tests** (`__tests__/integration`): server actions and data
  access with the Supabase client faked. They exercise the real action logic -
  server-side pricing, availability rejection, snapshots, order-number retry,
  rollback, lookup routing, and admin authorization - without a live database,
  so they are deterministic and need no credentials.
- **End-to-end tests** (`e2e`): Playwright drives the running app through the
  customer and admin flows. See the E2E section below.

Shared fixtures live in `__tests__/helpers/fixtures.ts` (builders for products,
orders, order items, and customer input).

## Why mocked Supabase for integration tests

Mutations and lookups run through server actions that own the security-critical
logic (validation, server-side totals, authorization, exact-match queries).
Faking the Supabase client lets those code paths be tested exactly, fast, and
offline. The live schema is validated separately via Supabase MCP round-trips
during development; RLS is the second authorization layer beyond the
`requireAdmin` guard the integration tests assert.

## Running

```bash
npm run test        # unit + integration (Vitest, single run)
npm run test:watch  # Vitest in watch mode
npm run test:e2e    # Playwright end-to-end
```

`npm run test` requires no environment variables. The Vitest config
(`vitest.config.ts`) uses the jsdom environment and mirrors the `@/` path
alias.

## End-to-End

Playwright config is in `playwright.config.ts`. The E2E suite expects:

- The dev server reachable at the configured base URL (Playwright starts it
  automatically via `webServer`).
- `.env.local` populated with the Supabase and app keys (the same file the app
  uses).
- The seeded sample products present in the database (from
  `supabase/migrations/0002_bakery_seed.sql`).
- An admin account whose credentials are provided via `E2E_ADMIN_EMAIL` and
  `E2E_ADMIN_PASSWORD` for the admin-flow test (see `e2e/README` notes in the
  spec files).

```bash
npx playwright install   # one-time: download browsers
npm run test:e2e
```
