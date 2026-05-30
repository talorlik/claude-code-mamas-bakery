# 02_Supabase_Database_Schema

## Claude Code Prompt

```text
Use Agent Mode.
Use Supabase MCP.

Context:
I am building the Mom's Bread bakery ordering app. The app needs Supabase tables for products, orders, order_items, and admin authorization. The template is already connected to Supabase.

References:
- docs/planning/PRD.md
- docs/planning/TECHNICAL_REQUIREMENTS.md
- docs/planning/TASK_BREAKDOWN.md

Task:
Create the Supabase database schema and seed data for the bakery app.

Step 1 - Inspect before changing:
1. Use Supabase MCP to inspect current tables, policies, functions, and migrations.
2. Check whether any of the required tables already exist.
3. Avoid destructive changes unless explicitly safe.

Step 2 - Create migration:
Create a migration under the project's Supabase migration location. If the project does not yet have a Supabase migrations folder, create the conventional folder used by this template.

Schema requirements:
1. products
   - id
   - name
   - description
   - price
   - category
   - image_url
   - is_available
   - created_at
   - updated_at
2. orders
   - id
   - order_number
   - customer_name
   - customer_phone
   - customer_email
   - pickup_date
   - notes
   - total_amount
   - status
   - is_paid
   - created_at
   - updated_at
3. order_items
   - id
   - order_id
   - product_id
   - product_name
   - quantity
   - unit_price
   - line_total
   - created_at
4. user_roles or an equivalent admin role table
   - user_id
   - role
   - created_at

Constraints:
1. Prices and totals must be non-negative.
2. Quantity must be greater than zero.
3. order_number must be unique.
4. order status must be limited to:
   - New
   - Received
   - Ready for Pickup
   - Completed
5. Product category must support:
   - challah
   - cake
   - sweets
   - other
6. order_items must store product_name and unit_price snapshots.

Add:
1. Useful indexes.
2. updated_at trigger.
3. is_admin helper function or equivalent.
4. RLS on all business tables.
5. Policies so available products are readable by anyone.
6. Policies so only admins can manage products and orders.
7. Safe approach for customer order creation through server-side application code.

Seed:
Add sample products for testing:
- Classic Challah
- Whole Wheat Challah
- Chocolate Cake
- Cinnamon Rolls
- Rugelach Box

Do not put secrets in migrations.

Validation:
1. Apply or prepare the migration according to the project's current workflow.
2. Verify with Supabase MCP that tables, constraints, indexes, and policies exist.
3. Verify seeded products exist.
4. Report any manual step needed to assign the first admin role.

Commit message after success:
Add bakery Supabase schema
```
