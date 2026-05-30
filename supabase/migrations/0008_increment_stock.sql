-- Stock restore counterpart to decrement_stock.
--
-- Used to compensate already-decremented lines when a later line in the same
-- order fails (partial rollback in createOrder). Adds quantity back and, since
-- restoring stock means the product is sellable again, re-marks it available.
-- service_role-only, matching decrement_stock.

create or replace function public.increment_stock(
  p_product_id uuid,
  p_quantity integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
    set stock_quantity = stock_quantity + p_quantity,
        is_available = true
  where id = p_product_id;
end;
$$;

revoke execute on function public.increment_stock(uuid, integer) from public;
grant execute on function public.increment_stock(uuid, integer) to service_role;
