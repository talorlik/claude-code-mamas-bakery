# 11_Admin_Order_Management

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.
Use the hebrew-rtl-best-practices skill.

Context:
Ronit needs protected admin order management. Admin must see all orders, inspect details, filter/search orders, update order status, and mark orders paid or unpaid.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Build admin order management at /admin/orders.

Requirements:
1. Ensure /admin/orders is protected server-side.
2. Query all orders sorted newest first.
3. Include order_items for details view.
4. Add search by customer name, phone, or email.
5. Add filter by status.
6. Add filter by pickup date.
7. Add order detail view as page, modal, drawer, or expandable row.
8. Detail view must show:
   - customer name
   - phone
   - email
   - pickup date
   - notes
   - products
   - quantities
   - unit prices
   - line totals
   - order total
   - status
   - payment state
9. Add status update action.
10. Add paid/unpaid update action.
11. Mutations must verify admin role server-side.
12. Add loading, empty, success, and error states.
13. Ensure customer /orders lookup reflects status and payment updates.
14. Ensure Hebrew and RTL layout is correct.
15. Include TSDoc for exported admin order actions.

Tests:
1. Component test order filters.
2. Component test order status update control if practical.
3. Integration test admin can update order status.
4. Integration test admin can update payment state.
5. Integration test non-admin cannot update order.
6. Manual test full admin order workflow.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test
- npm run build

Commit message after success:
Add admin order management
```
