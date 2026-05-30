# 09_Customer_Order_Lookup

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.
Use the hebrew-rtl-best-practices skill.

Context:
Customers need a /orders page where they can find orders by phone number or email address. The page must show order status, payment status, totals, and product quantities.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Build the customer order lookup feature.

Requirements:
1. Add /orders page.
2. Add order lookup form with one input that accepts phone or email, or two clearly labeled inputs if simpler.
3. Validate lookup input server-side.
4. Query matching orders only by exact normalized phone or exact lowercased email.
5. Include related order_items in results.
6. Do not expose all orders to unauthenticated users.
7. Display each order with:
   - order number
   - order date
   - pickup date
   - product names and quantities
   - total amount
   - payment status
   - current order status
8. Add clear visual labels for order statuses:
   - New
   - Received
   - Ready for Pickup
   - Completed
9. Add clear paid/unpaid label.
10. Add loading, empty, error, and success states.
11. Ensure Hebrew and RTL layout is correct.
12. Include TSDoc for exported lookup functions.

Tests:
1. Unit test lookup validation.
2. Component test OrderStatusBadge.
3. Component test PaymentStatusBadge.
4. Integration test lookup by email.
5. Integration test lookup by phone.
6. Integration test wrong lookup returns no unrelated orders.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

Commit message after success:
Add customer order lookup
```
