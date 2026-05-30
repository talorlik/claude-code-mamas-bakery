-- Security hardening for the stock RPCs.
--
-- decrement_stock/increment_stock are SECURITY DEFINER and must only be callable
-- by the service-role server path that places orders. Revoking from PUBLIC
-- alone does not remove the implicit grants Supabase gives the `anon` and
-- `authenticated` roles, so they remained callable via /rest/v1/rpc (advisors
-- 0028/0029). Revoke EXECUTE from both roles explicitly; service_role keeps it.

revoke execute on function public.decrement_stock(uuid, integer) from anon, authenticated;
revoke execute on function public.increment_stock(uuid, integer) from anon, authenticated;
