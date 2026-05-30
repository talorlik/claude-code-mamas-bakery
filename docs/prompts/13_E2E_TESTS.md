# 13_E2E_Tests

## Claude Code Prompt

```text
Use Agent Mode.
Use the hebrew-rtl-best-practices skill.

Context:
The app needs end-to-end coverage for the required final demo flow. Use Playwright.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Add Playwright E2E tests for customer and admin flows.

Requirements:
1. Inspect existing Playwright config before modifying.
2. Add or update Playwright config only as needed.
3. Add stable selectors where necessary. Prefer accessible roles and labels over test IDs.
4. Add customer flow test:
   - open /menu
   - add two products to cart
   - open /cart
   - change quantity if practical
   - fill order form
   - submit order
   - verify success message includes order number
   - open /orders
   - search by email or phone
   - verify order details appear
5. Add admin flow test:
   - log in as admin
   - open /admin/orders
   - search for test order
   - open order details
   - change status to Ready for Pickup
   - mark order as paid
   - return to customer lookup
   - confirm updated status and payment state appear
6. Add setup notes for required seeded products and admin credentials.
7. Do not commit real credentials.
8. Use environment variables for E2E credentials.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test:e2e

Commit message after success:
Add e2e coverage
```
