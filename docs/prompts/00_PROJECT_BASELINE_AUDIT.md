# 00_Project_Baseline_Audit

## Claude Code Prompt

```text
Use Plan Mode.

Context:
I am continuing an existing Next.js bakery ordering app project for Mom's Bread. The template has already been installed and these commands have already been run:
- /start-from-template
- /setup-vercel-ai
- /setup-github
- /setup-vercel

All accounts, keys, secrets, and tokens have already been generated and configured. Signup/login was started but is not complete.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Audit the current repository before changing implementation code.

Inspect:
1. Current project structure.
2. Existing app routes.
3. Existing Supabase helpers under lib/supabase or equivalent paths.
4. Existing proxy.ts session handling.
5. Existing signup/login implementation and what is incomplete.
6. Existing /api/chat route and whether it is authenticated.
7. Existing package scripts and installed test dependencies.
8. Existing shadcn/ui components and shared components.
9. Existing environment variable usage, without printing secret values.
10. Any broken imports, obvious TypeScript issues, or route conflicts.

Output:
1. A concise baseline report.
2. A safe implementation sequence based on the actual repository.
3. Files that should be modified in the next batch.
4. Risks or conflicts with the existing partial signup/login work.

Do not implement application behavior changes in this batch unless there is a trivial compile-blocking issue. If you find a trivial issue, explain it before fixing it.

After the audit, run available checks:
- npm run lint
- npm run typecheck
- npm run build, only if the project is expected to build at this stage
```
