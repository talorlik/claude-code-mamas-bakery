# 07_Cart_System

## Claude Code Prompt

```text
Use Agent Mode.
Use the hebrew-rtl-best-practices skill.

Context:
The bakery app needs a cart system and /cart page. Cart state should persist in localStorage and support quantity changes, removal, and total calculation.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Build the cart provider, cart UI, and /cart page without relying on direct database writes from the client.

Requirements:
1. Inspect existing cart-related code first.
2. Add a CartProvider or equivalent client-side state hook.
3. Persist cart to localStorage.
4. Hydrate cart safely without server/client mismatch.
5. Add cart item row component.
6. Allow increasing quantity.
7. Allow decreasing quantity.
8. Allow removing an item.
9. Show line totals and total amount.
10. Show empty cart state.
11. Add order form UI with fields:
    - full name
    - phone number
    - email address
    - desired pickup date
    - notes for Ronit
12. The order form can be wired to submission in the next batch, but validation UI should be prepared.
13. Ensure cart count updates in the navigation indicator.
14. Ensure Hebrew and RTL form layout is correct.
15. Include TSDoc for exported cart hooks and helpers.

Tests:
1. Unit tests for cart utilities if not already complete.
2. Component test for CartItemRow.
3. Component test for empty cart state.
4. Manual test reload preserves cart.
5. Manual test quantity changes update totals.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

Commit message after success:
Add cart system
```
