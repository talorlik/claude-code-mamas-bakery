# 04_Authentication_And_Admin_Access

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.
Use Context7 MCP for current Next.js and Supabase SSR guidance if needed.

Context:
Signup/login was started but not completed. The project uses Supabase Auth with @supabase/ssr and session handling through proxy.ts. Admin pages must be protected so only the configured admin user can access them.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md
- Output from 00_Project_Baseline_Audit

Task:
Complete authentication and admin authorization.

Requirements:
1. Preserve useful existing signup/login code.
2. Complete signup with Supabase Auth.
3. Complete login with Supabase Auth.
4. Add logout behavior.
5. Ensure auth session refresh works through proxy.ts and existing Supabase SSR helpers.
6. Add role lookup helper using user_roles or the chosen admin role table.
7. Add requireAdmin server helper.
8. Protect /admin and nested admin routes server-side.
9. Redirect unauthenticated users to login.
10. Redirect authenticated non-admin users away from admin pages.
11. Do not expose service-role or secret keys to client components.
12. Add clear UI states for auth errors.
13. Add no-index metadata to auth pages and admin pages.
14. Document the exact SQL or Supabase MCP step required to grant the first admin role to my email.

Tests:
1. Unit test role helper behavior where possible.
2. Integration test requireAdmin behavior where feasible.
3. Manual test regular user cannot access /admin.
4. Manual test admin user can access /admin.

Validation:
Run:
- npm run lint
- npm run typecheck
- npm run test
- npm run build

Commit message after success:
Complete auth and admin access
```
