-- Bakery schema: products, orders, order_items, user_roles, profiles.
-- Extends the spec (TECHNICAL_REQUIREMENTS sections 7-8) with order ownership
-- (orders.user_id), a customer profiles table, and own-row read policies so
-- authenticated customers can see their own orders and manage their profile.
--
-- Order creation and anonymous phone/email lookup run server-side through the
-- service-role client (which bypasses RLS); therefore no public INSERT policy
-- is granted on orders or order_items, keeping that surface closed.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type product_category as enum ('challah', 'cake', 'sweets', 'other');

create type order_status as enum (
  'New',
  'Received',
  'Ready for Pickup',
  'Completed'
);

create type app_role as enum ('admin');

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category product_category not null default 'other',
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_is_available_idx on public.products (is_available);
create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  pickup_date date not null,
  notes text,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status order_status not null default 'New',
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_pickup_date_idx on public.orders (pickup_date);
create index orders_status_idx on public.orders (status);
create index orders_user_id_idx on public.orders (user_id);
create index orders_customer_phone_idx on public.orders (customer_phone);
create index orders_customer_email_idx on public.orders (lower(customer_email));
create index orders_customer_name_idx
  on public.orders using gin (to_tsvector('simple', customer_name));

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index user_roles_role_idx on public.user_roles (role);

-- ---------------------------------------------------------------------------
-- profiles (customer account details)
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Updated timestamp trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Admin helper
-- ---------------------------------------------------------------------------

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_roles.user_id = is_admin.user_id
      and user_roles.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;

-- products: public reads available, admins read all and manage.
create policy "Anyone can read available products"
on public.products
for select
to anon, authenticated
using (is_available = true);

create policy "Admins can read all products"
on public.products
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- orders: admins read/update all; customers read only their own.
create policy "Admins can read orders"
on public.orders
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "Users can read own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

-- order_items: admins read all; customers read items of their own orders.
create policy "Admins can read order items"
on public.order_items
for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Users can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

-- user_roles: users read own, admins read all.
create policy "Users can read own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can read all roles"
on public.user_roles
for select
to authenticated
using (public.is_admin(auth.uid()));

-- profiles: each user fully manages their own row.
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
