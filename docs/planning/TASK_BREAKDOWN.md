# Task_Breakdown: Mom's Bread Bakery Ordering App

<!-- markdownlint-disable MD024 -->

## 1. Execution Principles

- Work from foundations to user-facing features.
- Keep tasks small to medium.
- Complete one batch at a time.
- Run quality gates before each commit.
- Preserve existing template structure and existing partially implemented signup/login work where useful.
- Use Supabase MCP for schema inspection and migration verification.
- Use Context7 MCP for current library documentation when implementing framework-specific code.
- Use the Hebrew RTL skill for every UI task that includes layout, forms, navigation, or Hebrew text.
- Keep all planning documents under `docs/planning`.
- Keep implementation prompts under `docs/prompts`.
- Before starting a batch, open and follow that batch's prompt file.

## 2. Batch Overview

| Batch | Goal | Output | Prompt File |
| --- | --- | --- | --- |
| 00 | Audit current project state | Baseline report and safe implementation plan | `docs/prompts/00_PROJECT_BASELINE_AUDIT.md` |
| 01 | Add quality and test foundation | Test scripts, test config, basic test structure | `docs/prompts/01_QUALITY_AND_TEST_FOUNDATION.md` |
| 02 | Add database schema | Supabase migrations, seed data, RLS | `docs/prompts/02_SUPABASE_DATABASE_SCHEMA.md` |
| 03 | Add shared types and utilities | Product, cart, order, validation, formatting helpers | `docs/prompts/03_SHARED_TYPES_AND_UTILITIES.md` |
| 04 | Complete auth and admin role access | Signup/login completion, role checks, protected admin layout | `docs/prompts/04_AUTHENTICATION_AND_ADMIN_ACCESS.md` |
| 05 | Add app shell, navigation, SEO, RTL base | Layout, nav, metadata, theme-safe UI | `docs/prompts/05_APP_SHELL_SEO_AND_RTL_BASE.md` |
| 06 | Add product data layer and menu | `/menu`, product cards, cart indicator | `docs/prompts/06_PRODUCT_DATA_LAYER_AND_MENU.md` |
| 07 | Add cart system | Cart provider, cart page, quantity controls | `docs/prompts/07_CART_SYSTEM.md` |
| 08 | Add order submission | Server-side order creation and success flow | `docs/prompts/08_ORDER_SUBMISSION.md` |
| 09 | Add customer order lookup | `/orders` lookup and status display | `docs/prompts/09_CUSTOMER_ORDER_LOOKUP.md` |
| 10 | Add admin product management | Admin product CRUD, availability toggle | `docs/prompts/10_ADMIN_PRODUCT_MANAGEMENT.md` |
| 11 | Add admin order management | Admin order list, filters, details, updates | `docs/prompts/11_ADMIN_ORDER_MANAGEMENT.md` |
| 12 | Add integration tests | Supabase and server action integration tests | `docs/prompts/12_INTEGRATION_TESTS.md` |
| 13 | Add E2E tests | Playwright customer and admin flows | `docs/prompts/13_E2E_TESTS.md` |
| 14 | Polish UX, Hebrew, RTL, accessibility | Final UI polish and acceptance checklist | `docs/prompts/14_UX_RTL_ACCESSIBILITY_POLISH.md` |
| 15 | Final verification and demo prep | Final checklist, demo script, build verification | `docs/prompts/15_FINAL_VERIFICATION_AND_DEMO.md` |

## 3. Batch 00 - Project Baseline Audit

Prompt file: `docs/prompts/00_PROJECT_BASELINE_AUDIT.md`.

### Objective

Inspect the existing template, completed setup steps, Supabase helper structure, AI route, and partially implemented signup/login flow before making changes.

### Tasks

1. Inspect current repository structure.
2. Identify existing auth pages, components, actions, and Supabase helpers.
3. Identify existing `proxy.ts` behavior.
4. Identify existing `/api/chat` behavior.
5. Identify package scripts and installed dependencies.
6. Identify existing shadcn/ui components.
7. Produce an implementation-safe audit note.
8. Do not modify application behavior in this batch unless trivial broken imports are found.

### Tests

- Run `npm run lint` if available.
- Run `npm run typecheck` if available.
- Run `npm run build` if the project currently builds.

### Commit

```bash
git add .
git commit -m "Audit bakery app baseline"
```

## 4. Batch 01 - Quality And Test Foundation

Prompt file: `docs/prompts/01_QUALITY_AND_TEST_FOUNDATION.md`.

### Objective

Add or verify testing and code quality tooling without changing product behavior.

### Tasks

1. Check whether Vitest, Testing Library, jsdom, and Playwright are already installed.
2. Add missing test tooling.
3. Add or update test scripts without breaking existing scripts.
4. Add test setup file for Testing Library matchers.
5. Add folders for unit, integration, and E2E tests.
6. Add a minimal smoke unit test.
7. Ensure Prettier and ESLint still run.

### Tests

- `npm run lint`
- `npm run typecheck`
- `npm run test`

### Commit

```bash
git add .
git commit -m "Add test foundation"
```

## 5. Batch 02 - Supabase Database Schema

Prompt file: `docs/prompts/02_SUPABASE_DATABASE_SCHEMA.md`.

### Objective

Create the bakery database schema with products, orders, order items, roles, constraints, indexes, RLS policies, and seed data.

### Tasks

1. Inspect existing Supabase schema through Supabase MCP.
2. Create migration for enums or check constraints.
3. Create `products` table.
4. Create `orders` table.
5. Create `order_items` table.
6. Create `user_roles` or equivalent admin role table.
7. Add indexes.
8. Add updated timestamp trigger.
9. Add admin helper function.
10. Enable RLS.
11. Add RLS policies.
12. Add sample products.
13. Verify schema in Supabase.

### Tests

- Verify inserts for sample products.
- Verify public reads only available products.
- Verify admin role helper returns expected result for configured admin user.
- Verify non-admin cannot mutate products or orders.

### Commit

```bash
git add .
git commit -m "Add bakery Supabase schema"
```

## 6. Batch 03 - Shared Types And Utilities

Prompt file: `docs/prompts/03_SHARED_TYPES_AND_UTILITIES.md`.

### Objective

Build typed foundations before UI and server actions.

### Tasks

1. Define product types.
2. Define cart types.
3. Define order and order item types.
4. Define action result types.
5. Add price formatting helper.
6. Add date formatting helper.
7. Add cart utility functions.
8. Add validation utilities for product and order forms.
9. Add status label mapping utilities.
10. Add TSDoc for exported utilities.

### Unit Tests

- Cart add, remove, increase, decrease.
- Cart total calculation.
- Product validation.
- Order validation.
- Price formatting.
- Status label mapping.

### Commit

```bash
git add .
git commit -m "Add shared bakery types and utilities"
```

## 7. Batch 04 - Authentication And Admin Access

Prompt file: `docs/prompts/04_AUTHENTICATION_AND_ADMIN_ACCESS.md`.

### Objective

Complete signup/login and enforce admin-only access for `/admin`.

### Tasks

1. Review partially implemented signup/login.
2. Complete signup page.
3. Complete login page.
4. Add logout action.
5. Add role lookup helper.
6. Add `requireAdmin` helper.
7. Protect `/admin` layout server-side.
8. Add admin dashboard placeholder.
9. Add safe redirect behavior for unauthenticated and non-admin users.
10. Document how to assign admin role to the configured user.

### Tests

- Unit tests for role helpers.
- Integration test for admin guard where feasible.
- Manual test: regular user cannot access `/admin`.
- Manual test: admin user can access `/admin`.

### Commit

```bash
git add .
git commit -m "Complete auth and admin access"
```

## 8. Batch 05 - App Shell, SEO, And RTL Base

Prompt file: `docs/prompts/05_APP_SHELL_SEO_AND_RTL_BASE.md`.

### Objective

Create the visual and navigation foundation for the customer and admin app.

### Tasks

1. Add or update global app layout.
2. Add customer navigation.
3. Add admin navigation.
4. Add cart indicator shell integration.
5. Add SEO metadata to public pages.
6. Set no-index metadata for admin and account pages.
7. Add responsive page containers.
8. Add shared loading, empty, and error components.
9. Verify dark mode still works.
10. Apply Hebrew and RTL base rules.

### Tests

- Component tests for nav rendering.
- Manual mobile layout check.
- Manual RTL alignment check.

### Commit

```bash
git add .
git commit -m "Add app shell SEO and RTL base"
```

## 9. Batch 06 - Product Data Layer And Menu

Prompt file: `docs/prompts/06_PRODUCT_DATA_LAYER_AND_MENU.md`.

### Objective

Build product queries and the customer-facing `/menu` page.

### Tasks

1. Add product query functions.
2. Add product card component.
3. Add placeholder image behavior.
4. Add `/menu` page.
5. Fetch available products from Supabase.
6. Render product cards with name, description, price, category, image, and Add to Cart.
7. Add cart indicator update behavior.
8. Add optional search and category filters if time permits.
9. Add loading and empty states.

### Tests

- Unit tests for product formatting.
- Component tests for product card.
- Integration test for available product query if feasible.
- Manual test: unavailable products are hidden or disabled.

### Commit

```bash
git add .
git commit -m "Add product menu"
```

## 10. Batch 07 - Cart System

Prompt file: `docs/prompts/07_CART_SYSTEM.md`.

### Objective

Build persistent cart behavior and `/cart` page without order submission first.

### Tasks

1. Add cart provider or hook.
2. Persist cart to localStorage.
3. Hydrate cart safely in client components.
4. Add cart item row component.
5. Add quantity controls.
6. Add remove item behavior.
7. Add total calculation display.
8. Add empty cart state.
9. Add order form UI without final submission wiring if needed.

### Tests

- Unit tests for cart state utilities.
- Component tests for cart item row.
- Manual test: reload preserves cart.
- Manual test: quantity changes update total.

### Commit

```bash
git add .
git commit -m "Add cart system"
```

## 11. Batch 08 - Order Submission

Prompt file: `docs/prompts/08_ORDER_SUBMISSION.md`.

### Objective

Connect `/cart` order form to Supabase order creation.

### Tasks

1. Add server action or route handler for order creation.
2. Validate customer fields server-side.
3. Validate cart server-side.
4. Re-fetch products by product IDs server-side.
5. Reject unavailable products.
6. Calculate server-side line totals and order total.
7. Generate unique order number.
8. Insert order.
9. Insert order items with product name and price snapshots.
10. Return order number to UI.
11. Show success state.
12. Clear cart after success.

### Tests

- Unit tests for order validation.
- Integration test for order creation.
- Manual test: Supabase contains one order and correct order items.

### Commit

```bash
git add .
git commit -m "Add order submission"
```

## 12. Batch 09 - Customer Order Lookup

Prompt file: `docs/prompts/09_CUSTOMER_ORDER_LOOKUP.md`.

### Objective

Build `/orders` so customers can find orders by phone or email.

### Tasks

1. Add lookup form.
2. Add server-side lookup action or route.
3. Validate lookup input.
4. Search by normalized phone or lowercased email.
5. Return only matching orders.
6. Include order items in results.
7. Add order status badge.
8. Add payment status badge.
9. Add empty and error states.
10. Ensure lookup does not expose all orders.

### Tests

- Unit test for lookup validation.
- Integration test for lookup by email.
- Integration test for lookup by phone.
- Manual test: wrong email returns no orders.

### Commit

```bash
git add .
git commit -m "Add customer order lookup"
```

## 13. Batch 10 - Admin Product Management

Prompt file: `docs/prompts/10_ADMIN_PRODUCT_MANAGEMENT.md`.

### Objective

Build admin product CRUD and availability management.

### Tasks

1. Add admin product list page.
2. Add product form component.
3. Add create product action.
4. Add update product action.
5. Add delete product action.
6. Add availability toggle action.
7. Validate product fields server-side.
8. Add success and error feedback.
9. Add optimistic or refresh-based updates.
10. Verify non-admin cannot call mutations.

### Tests

- Unit tests for product validation.
- Component tests for product form.
- Integration tests for admin product mutations.
- Manual test: unavailable products do not appear as orderable menu items.

### Commit

```bash
git add .
git commit -m "Add admin product management"
```

## 14. Batch 11 - Admin Order Management

Prompt file: `docs/prompts/11_ADMIN_ORDER_MANAGEMENT.md`.

### Objective

Build admin order list, details, filters, search, status updates, and payment tracking.

### Tasks

1. Add admin order query functions.
2. Add order list page sorted newest first.
3. Add status filter.
4. Add pickup date filter.
5. Add search by name, phone, or email.
6. Add order details view.
7. Add status update action.
8. Add paid/unpaid update action.
9. Add loading, empty, success, and error states.
10. Verify customer lookup reflects admin updates.

### Tests

- Unit tests for filter state helpers if used.
- Component tests for order filters and badges.
- Integration tests for status and payment update actions.
- Manual test: full admin workflow.

### Commit

```bash
git add .
git commit -m "Add admin order management"
```

## 15. Batch 12 - Integration Tests

Prompt file: `docs/prompts/12_INTEGRATION_TESTS.md`.

### Objective

Add meaningful integration tests around data access, server actions, and authorization.

### Tasks

1. Decide test strategy: mocked Supabase, local Supabase, or test database.
2. Add test helpers for sample products, orders, and users.
3. Test order creation path.
4. Test unavailable product rejection.
5. Test customer lookup path.
6. Test admin product mutation authorization.
7. Test admin order update authorization.
8. Document how to run integration tests.

### Tests

- `npm run test`
- Confirm failures are deterministic.

### Commit

```bash
git add .
git commit -m "Add integration tests"
```

## 16. Batch 13 - E2E Tests

Prompt file: `docs/prompts/13_E2E_TESTS.md`.

### Objective

Add Playwright tests for required customer and admin flows.

### Tasks

1. Add Playwright config if missing.
2. Add customer order flow test.
3. Add admin login helper.
4. Add admin order management flow test.
5. Add seeded data assumptions or setup script.
6. Document required environment variables for E2E.
7. Ensure tests can run locally.

### Tests

- `npm run test:e2e`

### Commit

```bash
git add .
git commit -m "Add e2e coverage"
```

## 17. Batch 14 - UX, RTL, And Accessibility Polish

Prompt file: `docs/prompts/14_UX_RTL_ACCESSIBILITY_POLISH.md`.

### Objective

Finalize the app for submission quality.

### Tasks

1. Review all public pages in mobile and desktop layouts.
2. Review all admin pages in mobile and desktop layouts.
3. Apply Hebrew RTL best practices.
4. Verify forms, labels, icons, tables, dialogs, and badges in RTL.
5. Improve loading states.
6. Improve empty states.
7. Improve error states.
8. Verify keyboard navigation.
9. Verify color contrast.
10. Verify dark mode.
11. Add missing TSDoc.
12. Run final formatting.

### Tests

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Manual mobile checks.
- Manual RTL checks.

### Commit

```bash
git add .
git commit -m "Polish bakery UX RTL and accessibility"
```

## 18. Batch 15 - Final Verification And Demo

Prompt file: `docs/prompts/15_FINAL_VERIFICATION_AND_DEMO.md`.

### Objective

Prepare the final assignment submission.

### Tasks

1. Run all quality gates.
2. Run full manual demo flow.
3. Verify Supabase tables contain expected data.
4. Verify admin protection.
5. Verify Git history has meaningful commits.
6. Prepare short demo script.
7. Record or rehearse final demo.

### Required Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

### Final Manual Demo Flow

1. Open menu page.
2. Add two products to cart.
3. Submit order.
4. Find order on My Orders page.
5. Log in as admin.
6. Open order in admin panel.
7. Change status to `Ready for Pickup`.
8. Mark order as paid.
9. Return to customer side and confirm updated status appears.

### Commit

```bash
git add .
git commit -m "Finalize bakery assignment"
```
