-- Security hardening (part 2): revoke is_admin EXECUTE from PUBLIC.
--
-- New public functions are granted to PUBLIC by default, which anon and
-- authenticated inherit, exposing the helper via the REST RPC endpoint
-- (advisors 0028/0029). RLS policies call is_admin as the policy owner, so
-- revoking from PUBLIC does not affect policy evaluation. service_role keeps
-- EXECUTE for trusted server-side use.

revoke execute on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to service_role;
