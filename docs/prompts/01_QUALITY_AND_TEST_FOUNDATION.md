# 01_Quality_And_Test_Foundation

## Claude Code Prompt

```text
Use Agent Mode.

Context:
This project is an existing Next.js 16 App Router bakery ordering app using React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase, and the AI Game Changer template.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md
- Output from the baseline audit

Task:
Add or verify the test and quality foundation without changing product behavior.

Requirements:
1. Inspect package.json first.
2. If missing, add Vitest, Testing Library, jsdom, jest-dom, user-event, and Playwright as dev dependencies.
3. Add or update test scripts:
   - test
   - test:watch
   - test:e2e
4. Preserve existing scripts:
   - dev
   - build
   - start
   - lint
   - format
   - typecheck
5. Add a Vitest config only if needed.
6. Add a test setup file for Testing Library matchers if needed.
7. Add folders for unit, integration, and E2E tests.
8. Add one minimal smoke unit test that does not depend on Supabase.
9. Add or update Playwright config only if missing.
10. Do not add unnecessary dependencies beyond the testing stack.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test

TSDoc:
If you add any exported helpers, include TSDoc.

Commit message after success:
Add test foundation
```
