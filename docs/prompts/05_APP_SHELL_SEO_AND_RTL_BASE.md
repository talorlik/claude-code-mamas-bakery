# 05_App_Shell_SEO_And_RTL_Base

## Claude Code Prompt

```text
Use Agent Mode.
Use the hebrew-rtl-best-practices skill.
Use Context7 MCP for current Next.js metadata guidance if needed.

Context:
The bakery app needs a clean application shell, navigation, page containers, SEO metadata, and Hebrew/RTL-ready layout before feature pages are completed.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Build or refine the app shell, navigation, SEO metadata, and RTL base.

Requirements:
1. Preserve existing template theme behavior.
2. Preserve next-themes dark mode support.
3. Add public customer navigation:
   - Home
   - Menu
   - Cart
   - My Orders
4. Add admin navigation for protected admin pages:
   - Admin Home
   - Products
   - Orders
5. Add cart indicator placeholder integration, even if final cart provider is completed in the cart batch.
6. Add responsive page containers.
7. Add shared loading, empty, and error state components if missing.
8. Add route metadata for public pages.
9. Add no-index metadata for login, signup, and admin pages.
10. Ensure Hebrew and RTL layout is correct for navigation, forms, and containers.
11. Ensure numbers, prices, emails, and order numbers remain readable in RTL.
12. Do not break existing auth routes or /api/chat.

Tests:
1. Component test for public nav links.
2. Component test for admin nav links if practical.
3. Manual mobile check.
4. Manual dark mode check.
5. Manual RTL layout check.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

Commit message after success:
Add app shell SEO and RTL base
```
