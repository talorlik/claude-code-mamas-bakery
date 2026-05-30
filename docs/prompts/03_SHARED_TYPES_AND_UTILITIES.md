# 03_Shared_Types_And_Utilities

## Claude Code Prompt

```text
Use Agent Mode.

Context:
The bakery app needs typed foundations before UI and data mutations. Build shared types and pure utilities for products, cart behavior, orders, validation, formatting, and statuses.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Create shared TypeScript types and pure utility functions.

Requirements:
1. Inspect existing lib and type organization before adding files.
2. Use existing project conventions where present.
3. Avoid any dependency on browser APIs in pure utility files.
4. Avoid direct Supabase calls in pure utility files.
5. Avoid any `any` usage.

Create or update types for:
1. Product.
2. Product category.
3. Cart item.
4. Order.
5. Order item.
6. Order status.
7. Payment display state.
8. Admin role.
9. Generic action result.

Create or update utilities for:
1. Cart add item.
2. Cart remove item.
3. Cart increase quantity.
4. Cart decrease quantity.
5. Cart total calculation.
6. Product validation.
7. Order form validation.
8. Lookup validation for phone or email.
9. Price formatting.
10. Date formatting.
11. Order status label and badge mapping.
12. Payment status label and badge mapping.

TSDoc:
Add TSDoc to all exported functions and important exported types.

Tests:
Add unit tests for:
1. Adding product to empty cart.
2. Adding same product twice increments quantity.
3. Removing product from cart.
4. Decreasing quantity to zero removes product or clamps according to chosen behavior.
5. Total calculation.
6. Invalid email validation.
7. Invalid phone validation.
8. Past pickup date rejection.
9. Invalid product price rejection.
10. Status label mapping.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

Commit message after success:
Add shared bakery types and utilities
```
