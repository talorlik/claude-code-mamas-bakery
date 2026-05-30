# Admin Setup

How admin access works in Mom's Bread and how to grant it.

## How Admin Access Is Enforced

- Admin status is stored in `public.user_roles` as a row with `role = 'admin'`.
- `public.is_admin(uuid)` checks for that row. It is used inside RLS policies
  and by the server-side `requireAdmin()` guard.
- The `/admin` subtree is gated by `app/admin/layout.tsx`, which calls
  `requireAdmin()` (in `lib/auth/require-admin.ts`). Unauthenticated users are
  redirected to `/login`; authenticated non-admins to `/`.
- On login, admins are redirected to `/admin` and everyone else to `/profile`
  (see `app/login/actions.ts`).

## Granting the Admin Role

Admin role is not assigned through the app UI. Grant it with a one-off SQL
statement against the Supabase project (SQL editor or Supabase MCP), using the
target user's `auth.users` id.

Find the user id:

```sql
select id, email from auth.users where email = 'person@example.com';
```

Grant admin:

```sql
insert into public.user_roles (user_id, role)
values ('<USER_UUID>', 'admin')
on conflict (user_id, role) do nothing;
```

Verify:

```sql
select public.is_admin('<USER_UUID>');  -- expect: true
```

This identity is intentionally not baked into a migration, so the migrations
stay environment-agnostic.

## Current Admin

The role has been granted to `talorlik@gmail.com`
(`73efa3ed-c200-47bc-a619-808140ee9d6e`) in the connected project.

## Revoking Admin

```sql
delete from public.user_roles
where user_id = '<USER_UUID>' and role = 'admin';
```

## Recommended Auth Dashboard Settings

The security advisor flags one Auth setting that is a dashboard toggle, not a
schema change:

- **Leaked password protection** is disabled. Enable it under
  Dashboard → Authentication → Policies (Password protection) so Supabase
  rejects passwords found in known breaches (HaveIBeenPwned).

The signup/login flow already enforces a minimum password length of 8
characters server-side; the breach check is complementary.
