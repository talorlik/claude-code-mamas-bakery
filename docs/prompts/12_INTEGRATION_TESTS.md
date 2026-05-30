# 12_Integration_Tests

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.

Context:
The main bakery functionality should now exist. Add integration tests around data access, server actions or route handlers, order creation, customer lookup, and admin authorization.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Add integration tests for critical business behavior.

Requirements:
1. Inspect existing test setup first.
2. Choose the safest available strategy:
   - mocked Supabase client
   - local Supabase test project
   - isolated test database
3. Do not run destructive tests against production data.
4. Add test helpers for sample products, sample cart, sample order, admin user, and non-admin user.
5. Test successful order creation creates one order and matching order_items.
6. Test order item snapshots store product_name and unit_price.
7. Test server-side order total calculation.
8. Test unavailable product rejection.
9. Test customer lookup by email.
10. Test customer lookup by phone.
11. Test wrong lookup does not return unrelated orders.
12. Test admin can create or update product.
13. Test non-admin cannot create or update product.
14. Test admin can update order status.
15. Test admin can update payment state.
16. Test non-admin cannot update order status or payment state.
17. Document any environment variables or seed assumptions required for integration tests.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

Commit message after success:
Add integration tests
```
