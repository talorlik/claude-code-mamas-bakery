# Baseline Audit: Mom's Bread Bakery

This note records the project state at the start of the foundation build
(Batches 00-05), before any bakery feature work. It is a reference for what was
inherited from the template versus what this project adds.

## Stack

- Next.js 16.1.7 (App Router, Turbopack), React 19.2.4, TypeScript strict.
- Supabase via `@supabase/ssr` and `@supabase/supabase-js`.
- Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/gateway`).
- Tailwind CSS 4, shadcn/ui (57 components installed), next-themes,
  lucide-react, sonner.
- 25 runtime dependencies, 12 dev dependencies at baseline.

## Existing Scripts

`setup`, `dev` (`next dev --turbopack`), `build`, `start`, `lint` (`eslint`),
`format` (`prettier --write`), `typecheck` (`tsc --noEmit`).

No test scripts yet - added in Batch 01.

## What Works and Is Preserved

- **Supabase clients:** `lib/supabase/client.ts` (browser),
  `lib/supabase/server.ts` (server + `createAdminClient()`),
  `lib/supabase/middleware.ts` (`updateSession()` route protection).
- **Middleware entry:** `proxy.ts` delegates to `updateSession()`. Public paths:
  `/`, `/login`, `/auth`, `/error`, `/api`; everything else requires auth.
- **Auth flows (functional, to be hardened in Batch 04):** `app/login/`
  (`page.tsx`, `login-tabs.tsx`, `actions.ts`), `app/auth/confirm/route.ts`,
  `app/auth/signout/route.ts`. Current post-login redirect target is `/chat`.
- **AI chat:** `app/api/chat/route.ts` (auth-gated, AI Gateway, Sonnet) and
  `app/chat/page.tsx` (useChat UI).
- **Routes present:** `/`, `/login`, `/chat`, `/error`, `/api/chat`,
  `/auth/confirm`, `/auth/signout`.

## What Does Not Exist Yet

- **Database:** zero tables and zero migrations (confirmed via Supabase MCP
  `list_tables` and `list_migrations`). `supabase/migrations/` created in this
  batch; schema applied in Batch 02.
- No shared types/utilities, no menu/cart/order/admin/profile routes, no test
  tooling.

## Baseline Quality Gates

| Gate | Result |
|---|---|
| `npm run typecheck` | Pass (exit 0). |
| `npm run build` | Pass. 8 routes compile and render. |
| `npm run lint` | 3 errors + 1 warning, all pre-existing template code (see below). |

### Known Pre-Existing Lint Findings (not introduced by this project)

All three errors were the same rule, `react-hooks/set-state-in-effect`
(synchronous `setState` inside an effect), in template-generated files:

- `components/theme-toggle.tsx:14` - resolved in Batch 05 with a justified
  `eslint-disable-next-line` (the documented next-themes mount pattern).
- `hooks/use-mobile.ts:14` - resolved in Batch 05 the same way.
- `components/ui/carousel.tsx:98` - shadcn-generated and unused; left as-is.
  This is the one remaining baseline lint error.

The warning `app/layout.tsx:1` unused `Geist` import was cleared in Batch 05
when the root layout was reworked for i18n.

After Batch 05 the lint gate reports a single pre-existing error in the
unused generated `carousel.tsx`; everything else is clean.

## Constraints Carried Forward

- Do not commit `.env.local`; keep `SUPABASE_SECRET_KEY` and
  `AI_GATEWAY_API_KEY` server-only.
- Preserve the existing Supabase client/middleware structure; compose with it
  rather than replacing it (Batch 05 folds next-intl middleware into `proxy.ts`).
