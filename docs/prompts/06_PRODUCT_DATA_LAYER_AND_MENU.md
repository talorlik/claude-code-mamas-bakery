# 06_Product_Data_Layer_And_Menu

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.
Use the hebrew-rtl-best-practices skill.

Context:
The bakery app needs a customer menu page at /menu. Products must load from Supabase. Unavailable products must not be orderable.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Build the product data layer and /menu page.

Requirements:
1. Inspect current components and product-related files before adding new ones.
2. Add product query functions using the existing Supabase helpers.
3. Fetch only available products for the customer menu by default.
4. Add ProductCard component.
5. Product card must show:
   - image or placeholder
   - product name
   - short description
   - price
   - category
   - Add to Cart button
6. Add cart indicator that shows number of items currently in the cart.
7. Add menu loading state.
8. Add menu empty state.
9. Add menu error state if data fetching fails.
10. Add optional category filter if it can be done without expanding scope too much.
11. Add optional search by name or description if it can be done without expanding scope too much.
12. Ensure layout is mobile-friendly.
13. Ensure Hebrew and RTL behavior is correct.
14. Include TSDoc for exported product query functions.

Tests:
1. Component test for ProductCard.
2. Unit test for category label mapping if added.
3. Integration test for available products query if feasible.
4. Manual test Add to Cart updates cart indicator.
5. Manual test unavailable products are hidden or disabled.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

Commit message after success:
Add product menu
```
