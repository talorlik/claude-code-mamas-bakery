-- Analytics aggregates for the admin dashboard.
--
-- Three SECURITY DEFINER functions, each gated internally on
-- public.is_admin(auth.uid()) so only admins get data (non-admins get an empty
-- result, never an error that could leak existence). Aggregation runs in
-- Postgres rather than pulling every row into the app. EXECUTE is granted to
-- authenticated only; the internal admin check is the authorization boundary.
-- Completed/Ready/Received/New all count as revenue; this is a demo bakery with
-- no cancellation state, so every order contributes.

-- Daily revenue and order count for the last N days.
create or replace function public.analytics_revenue_by_day(p_days integer default 30)
returns table (day date, revenue numeric, orders bigint)
language sql
security definer
set search_path = public
as $$
  select
    o.created_at::date as day,
    coalesce(sum(o.total_amount), 0) as revenue,
    count(*) as orders
  from public.orders o
  where public.is_admin(auth.uid())
    and o.created_at >= (now() - make_interval(days => p_days))
  group by o.created_at::date
  order by day;
$$;

-- Order counts grouped by status.
create or replace function public.analytics_orders_by_status()
returns table (status order_status, orders bigint)
language sql
security definer
set search_path = public
as $$
  select o.status, count(*) as orders
  from public.orders o
  where public.is_admin(auth.uid())
  group by o.status;
$$;

-- Top products by total quantity sold (and the revenue they drove).
create or replace function public.analytics_top_products(p_limit integer default 10)
returns table (product_name text, quantity bigint, revenue numeric)
language sql
security definer
set search_path = public
as $$
  select
    oi.product_name,
    sum(oi.quantity) as quantity,
    sum(oi.line_total) as revenue
  from public.order_items oi
  where public.is_admin(auth.uid())
  group by oi.product_name
  order by quantity desc
  limit greatest(p_limit, 1);
$$;

-- Pickup vs delivery split.
create or replace function public.analytics_fulfillment_split()
returns table (fulfillment_method fulfillment_method, orders bigint)
language sql
security definer
set search_path = public
as $$
  select o.fulfillment_method, count(*) as orders
  from public.orders o
  where public.is_admin(auth.uid())
  group by o.fulfillment_method;
$$;

-- Lock execution down to signed-in users; the in-function admin check is the
-- real gate. Revoke the implicit PUBLIC/anon grants.
revoke execute on function public.analytics_revenue_by_day(integer) from public, anon;
revoke execute on function public.analytics_orders_by_status() from public, anon;
revoke execute on function public.analytics_top_products(integer) from public, anon;
revoke execute on function public.analytics_fulfillment_split() from public, anon;

grant execute on function public.analytics_revenue_by_day(integer) to authenticated;
grant execute on function public.analytics_orders_by_status() to authenticated;
grant execute on function public.analytics_top_products(integer) to authenticated;
grant execute on function public.analytics_fulfillment_split() to authenticated;
