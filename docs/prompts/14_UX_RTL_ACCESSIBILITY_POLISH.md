# 14_UX_RTL_Accessibility_Polish

## Claude Code Prompt

```text
Use Agent Mode.
Use the hebrew-rtl-best-practices skill.
Use Context7 MCP for current accessibility or framework documentation if needed.

Context:
The bakery app functionality should now be complete. This batch is for UX, Hebrew, RTL, accessibility, SEO, dark mode, mobile behavior, and final code quality.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Polish the app for submission quality.

Review pages:
- /
- /menu
- /cart
- /orders
- /login
- /signup
- /admin
- /admin/products
- /admin/orders

Requirements:
1. Improve navigation clarity.
2. Verify mobile layout on all pages.
3. Verify Hebrew and RTL layout on all pages.
4. Ensure numeric values, prices, emails, URLs, and order numbers remain readable in RTL.
5. Improve loading states.
6. Improve empty states.
7. Improve error states.
8. Improve success states.
9. Ensure form labels are associated with inputs.
10. Ensure buttons have accessible names.
11. Ensure status badges do not rely only on color.
12. Ensure keyboard navigation works for dialogs, drawers, forms, and menus.
13. Verify dark mode does not break readability.
14. Verify SEO metadata exists for public pages.
15. Verify admin and auth pages are no-index.
16. Add missing TSDoc for exported functions and types.
17. Remove dead code and unused imports.
18. Run formatting.

Validation:
Run:
- npm run format
- npm run lint
- npm run typecheck
- npm run test
- npm run build

Commit message after success:
Polish bakery UX RTL and accessibility
```
