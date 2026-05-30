# 10_Admin_Product_Management

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.
Use the hebrew-rtl-best-practices skill.

Context:
Ronit needs an admin product management page. Admin routes are already protected. Products must be manageable through admin-only server-side actions.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Build admin product management at /admin/products.

Requirements:
1. Ensure /admin/products is protected by the admin layout or equivalent server-side guard.
2. Add product list in table or card layout.
3. Show all products, including unavailable products.
4. Add create product form.
5. Add edit product behavior.
6. Add delete product behavior.
7. Add mark unavailable and mark available behavior.
8. Product fields:
   - name
   - price
   - description
   - category
   - image URL
   - availability
9. Validate all product mutations server-side.
10. Admin mutations must verify admin role server-side.
11. Add loading, empty, success, and error states.
12. Use shadcn/ui and existing design conventions.
13. Ensure Hebrew and RTL layout is correct.
14. Include TSDoc for exported admin product actions.

Tests:
1. Unit test product validation.
2. Component test ProductForm.
3. Integration test admin can create product.
4. Integration test admin can update product.
5. Integration test non-admin cannot mutate product.
6. Manual test unavailable product is not orderable on /menu.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test
- npm run build

Commit message after success:
Add admin product management
```
