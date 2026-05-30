-- Inventory: per-product stock tracking.
--
-- stock_quantity is decremented when an order is placed (server-side, in
-- createOrder) and a product is auto-marked unavailable when it reaches zero.
-- low_stock_threshold drives a low-stock badge in the admin UI. Existing rows
-- are backfilled to a non-zero stock so the seeded demo menu stays available.

alter table public.products
  add column stock_quantity integer not null default 0 check (stock_quantity >= 0),
  add column low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0);

-- Backfill seeded/existing products to a sane starting stock so the demo menu
-- is not emptied by the not-null default of 0.
update public.products set stock_quantity = 100 where stock_quantity = 0;

-- Partial index to list low-stock products cheaply in the admin dashboard.
create index products_low_stock_idx
  on public.products (stock_quantity)
  where stock_quantity <= low_stock_threshold;
