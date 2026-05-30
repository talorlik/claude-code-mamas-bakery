-- Delivery logistics: fulfillment method, demo carrier, fee, and address.
--
-- Orders can be pickup (default, unchanged behaviour) or delivery. Delivery
-- orders carry a demo carrier id, a server-computed flat fee, and a shipping
-- address. The carrier integration is a stub: no real dispatch happens. The
-- pickup_date column is reused as the requested fulfillment date for both
-- methods. Customers' saved addresses live on profiles so they are not retyped.

create type fulfillment_method as enum ('pickup', 'delivery');

alter table public.orders
  add column fulfillment_method fulfillment_method not null default 'pickup',
  add column delivery_carrier text,
  add column delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  add column delivery_address_line1 text,
  add column delivery_address_line2 text,
  add column delivery_city text,
  add column delivery_postal_code text;

alter table public.profiles
  add column address_line1 text,
  add column address_line2 text,
  add column city text,
  add column postal_code text;
