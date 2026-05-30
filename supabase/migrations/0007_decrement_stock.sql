-- Atomic stock decrement for order placement.
--
-- Decrements stock_quantity for a single product only when enough remains,
-- using a guarded UPDATE so concurrent orders cannot oversell (the check and
-- the write are one statement). When stock reaches zero the product is marked
-- unavailable so it drops off the public menu. Returns true when the decrement
-- happened, false when there was insufficient stock (caller rolls back).
--
-- SECURITY DEFINER so it runs with table owner rights; EXECUTE is granted only
-- to service_role, matching the service-role-only order write path. It is not
-- exposed to anon/authenticated.

create or replace function public.decrement_stock(
  p_product_id uuid,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
begin
  update public.products
    set stock_quantity = stock_quantity - p_quantity,
        is_available = case
          when stock_quantity - p_quantity <= 0 then false
          else is_available
        end
  where id = p_product_id
    and stock_quantity >= p_quantity
  returning stock_quantity into v_remaining;

  return found;
end;
$$;

revoke execute on function public.decrement_stock(uuid, integer) from public;
grant execute on function public.decrement_stock(uuid, integer) to service_role;
