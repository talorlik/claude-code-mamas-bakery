# 08_Order_Submission

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.
Use the hebrew-rtl-best-practices skill.

Context:
The /cart page exists and needs to submit orders. Order creation must be server-side. The app must create one order and the correct order_items in Supabase. Each order item must store product_name and unit_price snapshots.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Implement secure order submission.

Requirements:
1. Add a server action or route handler for order creation using existing project conventions.
2. Validate input server-side:
   - full name required
   - phone required and valid
   - email required and valid
   - pickup date required and not in the past
   - notes optional
   - cart must contain at least one item
   - quantities must be positive integers
3. Re-fetch products from Supabase by product IDs on the server.
4. Reject unavailable products.
5. Recalculate line totals and order total server-side.
6. Generate a unique order number in a human-readable format.
7. Insert the order.
8. Insert all order_items.
9. Store product_name and unit_price snapshots in each order_item.
10. Return a typed success result with the order number.
11. Return typed validation errors when invalid.
12. Show a clear success message with order number on /cart.
13. Clear cart after successful submission.
14. Do not expose Supabase secret keys to client code.
15. Include TSDoc for exported server action and validation helpers.

Tests:
1. Unit tests for order validation.
2. Integration test for successful order creation.
3. Integration test that unavailable product cannot be ordered.
4. Integration test that total is calculated server-side.
5. Manual test order appears in Supabase Table Editor.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test
- npm run build

Commit message after success:
Add order submission
```
