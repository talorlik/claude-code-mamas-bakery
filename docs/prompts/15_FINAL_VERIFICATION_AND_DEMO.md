# 15_Final_Verification_And_Demo

## Claude Code Prompt

```text
Use Agent Mode.

Context:
The bakery ordering app should be complete. This batch verifies the assignment acceptance criteria and prepares the final demo flow.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Perform final verification and prepare the demo.

Do not add major new features in this batch. Focus on verification, small fixes, and documentation.

Verification checklist:
1. npm run dev starts the app.
2. /menu displays products from Supabase.
3. Customers can add products to cart.
4. /cart shows selected products and correct totals.
5. Customers can submit an order.
6. Submitted orders are saved in Supabase.
7. Order items are saved with quantity and price snapshots.
8. /orders lets customers find their orders.
9. Customers can see order status and payment status.
10. /admin is protected.
11. Ronit can add, edit, delete, and disable products.
12. Ronit can view orders and update order status.
13. Ronit can mark orders as paid or unpaid.
14. Search and filters work in the admin order list.
15. The app has clear navigation, loading states, success messages, and error messages.
16. Hebrew and RTL layout are handled correctly.
17. Git history has meaningful commits.

Run:
- npm run format
- npm run lint
- npm run typecheck
- npm run test
- npm run build
- npm run test:e2e

Final demo script to verify manually:
1. Open /menu.
2. Add two products to the cart.
3. Open /cart.
4. Submit an order.
5. Copy the order number.
6. Open /orders.
7. Search by phone or email.
8. Confirm the order appears.
9. Log in as admin.
10. Open /admin/orders.
11. Open the order.
12. Change status to Ready for Pickup.
13. Mark the order as paid.
14. Return to /orders.
15. Confirm the updated customer-visible status and payment state.

Output:
1. A short final verification report.
2. Any remaining known issues.
3. The exact demo flow results.
4. A final commit if changes were made.

Commit message after success if files changed:
Finalize bakery assignment
```
