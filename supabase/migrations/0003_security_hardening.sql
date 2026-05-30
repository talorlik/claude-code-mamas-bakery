-- Security hardening following the post-DDL advisor pass (part 1).
--
-- Pin set_updated_at's search_path (advisor 0011, function_search_path_mutable)
-- so the trigger function cannot be hijacked via a mutable search_path.
--
-- Also revokes is_admin EXECUTE from anon/authenticated. This alone is not
-- sufficient because the default grant is to PUBLIC (handled in 0004), but it
-- is recorded here to mirror the applied migration history exactly.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.is_admin(uuid) from anon, authenticated;
