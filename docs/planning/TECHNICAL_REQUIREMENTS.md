# Technical_Requirements: Mom's Bread Bakery Ordering App

## 1. Technical Objective

Build a production-structured bakery ordering app on the existing AI Game Changer App Template. The implementation must use the installed Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and Vercel AI SDK foundation without recreating the project.

The implementation must prioritize correctness, authorization, maintainability, TSDoc coverage, SEO, Hebrew and RTL compatibility, and testability.

## 2. Existing Project Baseline

The following setup is already complete:

- Template installed.
- `/start-from-template` executed.
- `/setup-vercel-ai` executed.
- `/setup-github` executed.
- `/setup-vercel` executed.
- Supabase project and keys configured.
- Supabase MCP configured.
- Context7 MCP available.
- GitHub and Vercel deployment workflow configured.
- `.env.local` contains relevant keys and secrets.
- Signup and login are started but incomplete.

The first implementation task must inspect and preserve existing work before modifying authentication.

## 3. Required Stack

| Layer | Requirement |
|---|---|
| Framework | Next.js 16.1.7 with App Router |
| React | React 19.2.4 |
| Language | TypeScript 5.9.3 with strict mode |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui, Base UI, lucide-react |
| Theme | next-themes |
| Data/Auth | Supabase via `@supabase/ssr` and `@supabase/supabase-js` |
| Session handling | Existing `lib/supabase/*` helpers and `proxy.ts` |
| AI | Vercel AI SDK with authenticated `/api/chat` using Vercel AI Gateway |
| Tooling | npm, ESLint 9 with Next config, Prettier with Tailwind plugin, Turbopack |
| Deployment | GitHub to Vercel workflow already configured |
| MCP | Supabase MCP and Context7 MCP |

## 4. Architecture Overview

```text
Browser
  |
  | Customer pages: /, /menu, /cart, /orders
  | Admin pages: /admin, /admin/products, /admin/orders
  v
Next.js App Router
  |
  | Server components for read-heavy data
  | Client components for cart and interactive forms
  | Server actions or route handlers for mutations
  v
Supabase SSR Client
  |
  | Public-safe reads
  | Server-side order creation
  | Admin-only mutations
  v
Supabase
  |
  | products
  | orders
  | order_items
  | user_roles
```

## 5. Route Requirements

| Route | Type | Access | Purpose |
|---|---|---|---|
| `/` | Public | Anyone | Landing page and navigation to menu |
| `/menu` | Public | Anyone | Product catalog and add-to-cart flow |
| `/cart` | Public | Anyone | Cart review and order form |
| `/orders` | Public | Anyone | Customer order lookup by phone or email |
| `/login` | Public | Anyone | Supabase login |
| `/signup` | Public | Anyone | Supabase signup |
| `/admin` | Protected | Admin only | Admin dashboard summary |
| `/admin/products` | Protected | Admin only | Product management |
| `/admin/orders` | Protected | Admin only | Order list, filters, search, updates |
| `/admin/orders/[orderId]` | Protected | Admin only | Optional order detail route |
| `/api/chat` | Protected | Authenticated users | Existing AI Gateway chat route |

## 6. Recommended File Structure

```text
app/
  layout.tsx
  page.tsx
  menu/
    page.tsx
  cart/
    page.tsx
  orders/
    page.tsx
  login/
    page.tsx
  signup/
    page.tsx
  admin/
    layout.tsx
    page.tsx
    products/
      page.tsx
    orders/
      page.tsx
      [orderId]/
        page.tsx
  api/
    chat/
      route.ts
components/
  cart/
    CartProvider.tsx
    CartIndicator.tsx
    CartItemRow.tsx
    OrderForm.tsx
  menu/
    ProductCard.tsx
    ProductFilters.tsx
  orders/
    OrderStatusBadge.tsx
    PaymentStatusBadge.tsx
    OrderLookupForm.tsx
    OrderSummaryCard.tsx
  admin/
    AdminNav.tsx
    ProductForm.tsx
    ProductTable.tsx
    OrderFilters.tsx
    OrderTable.tsx
    OrderDetails.tsx
  shared/
    EmptyState.tsx
    LoadingState.tsx
    ErrorState.tsx
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
  auth/
    roles.ts
    require-admin.ts
  cart/
    cart-types.ts
    cart-utils.ts
    cart-storage.ts
  products/
    product-types.ts
    product-queries.ts
    product-actions.ts
  orders/
    order-types.ts
    order-validation.ts
    order-queries.ts
    order-actions.ts
    order-formatting.ts
  seo/
    metadata.ts
  utils/
    format.ts
supabase/
  migrations/
    0001_bakery_schema.sql
    0002_bakery_seed.sql
  seed.sql
__tests__/
  unit/
  integration/
e2e/
  customer-order.spec.ts
  admin-order-management.spec.ts
docs/
  planning/
  prompts/
```

Adjust paths to match the installed template if it already has preferred conventions. Do not duplicate existing helpers.

## 7. Database Requirements

## 7.1 Extensions

Enable `pgcrypto` if UUID generation is needed.

```sql
create extension if not exists pgcrypto;
```

## 7.2 Enums

```sql
create type product_category as enum ('challah', 'cake', 'sweets', 'other');

create type order_status as enum (
  'New',
  'Received',
  'Ready for Pickup',
  'Completed'
);

create type app_role as enum ('admin');
```

If the project prefers text columns instead of PostgreSQL enums, use check constraints with the same accepted values.

## 7.3 `products`

```sql
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
```

Indexes:

```sql
create index products_is_available_idx on public.products (is_available);
create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);
```

## 7.4 `orders`

```sql
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
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
```

Indexes:

```sql
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_pickup_date_idx on public.orders (pickup_date);
create index orders_status_idx on public.orders (status);
create index orders_customer_phone_idx on public.orders (customer_phone);
create index orders_customer_email_idx on public.orders (lower(customer_email));
create index orders_customer_name_idx on public.orders using gin (to_tsvector('simple', customer_name));
```

## 7.5 `order_items`

```sql
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
```

Indexes:

```sql
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
```

## 7.6 `user_roles`

```sql
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
```

Indexes:

```sql
create index user_roles_role_idx on public.user_roles (role);
```

## 7.7 Updated Timestamp Trigger

```sql
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
```

## 7.8 Admin Helper Function

```sql
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
```

## 7.9 Order Number Strategy

Use one of these options:

1. Database-generated order number via function and trigger.
2. Server-generated order number in the order creation action.

Recommended format:

```text
MB-YYYYMMDD-XXXX
```

Requirements:

- Unique.
- Human-readable.
- Returned to customer after submission.
- Searchable in admin.

## 8. Row Level Security Requirements

Enable RLS on all business tables:

```sql
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_roles enable row level security;
```

## 8.1 Product Policies

Required behavior:

- Anyone can read available products.
- Admins can read all products.
- Admins can insert, update, and delete products.

Recommended policies:

```sql
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
```

## 8.2 Order Policies

Recommended implementation: order creation and customer order lookup should run through server actions or route handlers. Client components should not directly query all orders.

Required behavior:

- Admins can read and update all orders.
- Customers can create orders through server-side logic.
- Customers can look up only matching orders by exact phone or email through server-side logic.

If using a server-side Supabase secret key for customer order creation and lookup, protect the route with strict validation and return only required fields.

Admin policies:

```sql
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
```

## 8.3 Order Item Policies

Required behavior:

- Admins can read all order items.
- Customers can create order items only through trusted server-side order creation logic.

Admin policies:

```sql
create policy "Admins can read order items"
on public.order_items
for select
to authenticated
using (public.is_admin(auth.uid()));
```

## 8.4 User Role Policies

Required behavior:

- Users may read only their own role if needed.
- Admins may read all roles.
- Role assignment should be done through Supabase SQL editor, controlled seed, or admin-only server logic.

```sql
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
```

## 9. Supabase Data Access Requirements

## 9.1 Client-Safe Reads

Client components may read:

- Available products.
- Public-safe product data.

Client components must not directly read:

- All orders.
- All order items.
- User roles except own role if needed.
- Admin-only product fields if additional internal fields are added.

## 9.2 Server Actions Or Route Handlers

Use server-side code for:

- Creating orders.
- Creating order items.
- Looking up customer orders by phone or email.
- Admin product mutations.
- Admin order mutations.
- Admin role checks.

Each mutation must:

1. Validate inputs.
2. Confirm authorization where required.
3. Execute Supabase operations.
4. Return a typed success or error result.
5. Avoid leaking internal errors to users.

## 10. TypeScript Requirements

## 10.1 Shared Types

Create shared types for:

- Product.
- Product category.
- Cart item.
- Order.
- Order item.
- Order status.
- Payment status display.
- Admin role.
- Server action result.

## 10.2 Type Safety

- Avoid `any`.
- Prefer discriminated union result types for server actions.
- Type route params and search params explicitly.
- Keep database DTOs separate from UI view models where transformation is useful.

Example:

```ts
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
```

## 11. Validation Requirements

The project may use handwritten validation to avoid adding dependencies. If a validation library already exists in the template, use it consistently.

## 11.1 Product Validation

| Field | Rule |
|---|---|
| name | Required, trimmed, 2 to 120 chars |
| description | Optional or required based on UI, max 500 chars |
| price | Required, numeric, greater than or equal to 0 |
| category | Must be one of supported categories |
| image_url | Optional valid URL |
| is_available | Boolean |

## 11.2 Order Validation

| Field | Rule |
|---|---|
| full name | Required, trimmed, 2 to 120 chars |
| phone | Required, normalized, 7 to 20 digits plus optional `+` |
| email | Required valid email |
| pickup date | Required, date, not in the past |
| notes | Optional, max 1000 chars |
| cart items | Required, at least one item |
| quantity | Integer, 1 to 99 |

## 12. Cart Requirements

Use local browser state with persistence:

- Store cart in `localStorage`.
- Load cart only in client components.
- Use a `CartProvider` or equivalent hook.
- Store minimum cart item data: `productId`, `name`, `price`, `imageUrl`, `category`, `quantity`.
- Revalidate products at order submission to ensure availability and current price.
- Calculate totals in the UI for display.
- Recalculate totals on the server before writing the order.

## 13. UI Component Requirements

Use existing UI primitives from shadcn/ui and Base UI where appropriate.

Required components:

- Product card.
- Cart indicator.
- Cart item row.
- Order form.
- Order status badge.
- Payment status badge.
- Admin navigation.
- Product form.
- Product table or card list.
- Order table.
- Order filters.
- Order detail panel or page.
- Empty, loading, and error states.

Use lucide-react icons where they improve clarity.

## 14. Hebrew And RTL Requirements

- Public UI should be Hebrew-ready.
- Hebrew text must use `dir="rtl"` or a suitable container-level direction strategy.
- Numeric values, prices, emails, URLs, and order numbers must remain readable inside RTL layout.
- Forms must preserve correct label and input alignment.
- Icon placement must be checked in RTL.
- Tables and cards must remain legible on mobile.
- Use the Hebrew RTL skill in Claude Code prompts for UI implementation and polish tasks.

## 15. SEO And Metadata Requirements

Each route must export metadata where relevant.

Recommended titles:

| Route | Title |
|---|---|
| `/` | `Mom's Bread - Boutique Bakery Orders` |
| `/menu` | `Menu - Mom's Bread` |
| `/cart` | `Cart - Mom's Bread` |
| `/orders` | `My Orders - Mom's Bread` |
| `/login` | `Login - Mom's Bread` |
| `/signup` | `Sign Up - Mom's Bread` |
| `/admin` | `Admin - Mom's Bread` |

Admin and account pages should be no-index.

## 16. AI Route Requirements

The existing AI route is not part of the assignment's required bakery workflow. It must remain secure:

- AI Gateway API key must be server-only.
- `/api/chat` must require authentication if already configured that way.
- No customer PII should be sent to the AI model unless explicitly required and protected.
- Do not use AI for order creation or admin authorization.

## 17. Testing Tooling Requirements

Add test tooling if it is not already installed:

- Unit and integration tests: Vitest.
- Component tests: React Testing Library, jest-dom, jsdom.
- E2E tests: Playwright.

Recommended dev dependencies:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

Do not break existing scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run format`
- `npm run typecheck`

## 18. Unit Test Requirements

| Area | Required Tests |
|---|---|
| Cart utilities | Add item, remove item, increase quantity, decrease quantity, total calculation |
| Order validation | Required fields, invalid email, invalid phone, past pickup date, empty cart |
| Product validation | Required fields, invalid price, invalid URL, category constraint |
| Formatting | Price formatting, date formatting, order status labels |
| Role helpers | Admin true, admin false, unauthenticated false |

## 19. Integration Test Requirements

| Area | Required Tests |
|---|---|
| Order creation | Creates one order and matching order items |
| Order total | Server total uses product prices and quantities |
| Product availability | Unavailable product cannot be ordered |
| Customer lookup | Lookup by email or phone returns only matching orders |
| Admin authorization | Non-admin cannot mutate products or orders |
| Admin order update | Admin can update status and payment state |

Use Supabase mocking, a local Supabase test environment, or isolated data-access tests depending on project constraints.

## 20. E2E Test Requirements

## 20.1 Customer Order Flow

1. Open `/menu`.
2. Add two products to cart.
3. Open `/cart`.
4. Change quantity.
5. Fill order form.
6. Submit order.
7. Confirm success message with order number.
8. Open `/orders`.
9. Search by email or phone.
10. Confirm order details appear.

## 20.2 Admin Order Flow

1. Log in as admin.
2. Open `/admin/orders`.
3. Search for the test order.
4. Open order details.
5. Change status to `Ready for Pickup`.
6. Mark order as paid.
7. Return to customer lookup.
8. Confirm customer can see updated status and payment state.

## 21. Quality Gates

Before each commit:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Before final submission:

```bash
npm run test:e2e
```

If E2E tests require seeded data, provide a documented seed step.

## 22. Security Requirements

- Do not commit `.env.local`.
- Do not expose Supabase secret key to client code.
- Do not expose AI Gateway API key to client code.
- Protect admin routes in server-side logic.
- Protect admin mutations in server-side logic.
- Use RLS as a second security layer.
- Validate all server action and route handler inputs.
- Do not return stack traces or raw Supabase errors to users.
- Do not allow arbitrary filtering that exposes all orders to unauthenticated users.

## 23. Git Checkpoint Requirements

Use meaningful commits after each working batch:

```bash
git add .
git commit -m "Audit template and auth baseline"
```

```bash
git add .
git commit -m "Add bakery database schema"
```

```bash
git add .
git commit -m "Complete Supabase auth and admin access"
```

```bash
git add .
git commit -m "Add product menu and cart"
```

```bash
git add .
git commit -m "Add order submission and lookup"
```

```bash
git add .
git commit -m "Add admin product and order management"
```

```bash
git add .
git commit -m "Polish RTL UX and tests"
```
