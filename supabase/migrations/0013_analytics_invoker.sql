-- Switch analytics aggregates to SECURITY INVOKER.
--
-- As SECURITY DEFINER they tripped advisor 0029 (signed-in users can execute a
-- definer function). Re-create them as SECURITY INVOKER so they run with the
-- caller's rights and rely on the existing orders/order_items RLS for row
-- visibility: admins ("Admins can read orders/order items") see everything and
-- get full aggregates; a non-admin would only ever aggregate their own rows,
-- which is harmless. The admin analytics page is also requireAdmin-gated. The
-- internal is_admin() filter is therefore removed.

create or replace function public.analytics_revenue_by_day(p_days integer default 30)
returns table (day date, revenue numeric, orders bigint)
language sql
security invoker
set search_path = public
as $$
  select
    o.created_at::date as day,
    coalesce(sum(o.total_amount), 0) as revenue,
    count(*) as orders
  from public.orders o
  where o.created_at >= (now() - make_interval(days => p_days))
  group by o.created_at::date
  order by day;
$$;

create or replace function public.analytics_orders_by_status()
returns table (status order_status, orders bigint)
language sql
security invoker
set search_path = public
as $$
  select o.status, count(*) as orders
  from public.orders o
  group by o.status;
$$;

create or replace function public.analytics_top_products(p_limit integer default 10)
returns table (product_name text, quantity bigint, revenue numeric)
language sql
security invoker
set search_path = public
as $$
  select
    oi.product_name,
    sum(oi.quantity) as quantity,
    sum(oi.line_total) as revenue
  from public.order_items oi
  group by oi.product_name
  order by quantity desc
  limit greatest(p_limit, 1);
$$;

create or replace function public.analytics_fulfillment_split()
returns table (fulfillment_method fulfillment_method, orders bigint)
language sql
security invoker
set search_path = public
as $$
  select o.fulfillment_method, count(*) as orders
  from public.orders o
  group by o.fulfillment_method;
$$;
