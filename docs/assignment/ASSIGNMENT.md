# Assignment 1 - Vibe Coding App With Claude Code

Build a small ordering system for the boutique bakery **Mom's Bread**.

In this assignment you will use Claude Code, Supabase, and a Next.js template to
create an app that lets customers order baked goods and lets the bakery manager
track products, orders, statuses, and payments.

## Learning Goals

By the end of this assignment, you should be able to:

- Start a project from the class template.
- Connect a Next.js app to Supabase.
- Plan a simple database structure before building features.
- Use Claude Code in Plan Mode and Agent Mode.
- Build customer-facing and admin-facing pages.
- Save products, orders, order items, and order statuses in Supabase.
- Test the app manually from both the customer and admin point of view.
- Use Git commits as checkpoints during development.

## Business Case

Ronit manages a home-based boutique bakery called **Mom's Bread**. She sells
challahs, cakes, and sweets by custom order.

Today, Ronit manages orders manually. This causes several problems:

- Orders arrive through messages and emails, so information is scattered.
- Quantities and pickup dates are easy to forget.
- Customers repeatedly ask what is available this week.
- Payment status is difficult to track.
- Customers do not receive a clear update when an order is ready for pickup.

The goal is to create a simple app where customers can view the menu, place an
order, and check order status. Ronit should be able to manage products, view all
orders, update order status, and mark orders as paid.

## Required App Features

The app must include both a customer side and an admin side.

### Customer Side

Customers should be able to browse the menu, add products to a cart, submit an
order, and check their order status.

#### Menu Page

Create a menu page at `/menu`.

The page must display all available bakery products from Supabase. Each product
card should include:

- Product image or placeholder image.
- Product name.
- Short description.
- Price.
- Category, such as challah, cake, or sweets.
- **Add to Cart** button.

The page should also include a cart indicator that shows how many items are
currently in the cart.

#### Shopping Cart And Order Form

Create a cart page at `/cart`.

The cart page must show all selected products. Customers should be able to:

- Increase or decrease quantity.
- Remove a product from the cart.
- See the updated total price.

The cart page must include an order form with these fields:

- Full name.
- Phone number.
- Email address.
- Desired pickup date.
- Notes for Ronit.

When the customer submits the order, save the order and order items in
Supabase. After submission, show a clear success message with the order number.

#### My Orders Page

Create a page at `/orders` where customers can find their orders by phone number
or email address.

Each order should display:

- Order number.
- Order date.
- Pickup date.
- Product names and quantities.
- Total amount.
- Payment status.
- Current order status.

Use clear visual labels for these order statuses:

- `New`
- `Received`
- `Ready for Pickup`
- `Completed`

### Admin Side

Ronit needs an admin area where she can manage products and orders.

#### Product Management

Create a product management page in the admin area.

Ronit should be able to:

- View all products in a table or card layout.
- Add a new product.
- Edit product name, price, description, category, and image URL.
- Delete a product.
- Mark a product as unavailable without deleting it.

Unavailable products should not appear as orderable items on the customer menu.

#### Order Management

Create an order management page in the admin area.

Ronit should be able to:

- View all orders sorted by newest first.
- Open an order and see full customer and product details.
- Change order status.
- Mark an order as paid or not paid.
- Filter orders by status.
- Filter orders by pickup date.
- Search orders by customer name, phone number, or email.

## Suggested Database Structure

Before writing code, ask Claude Code to help you design the database. Your final
structure can be different, but it should cover the same data needs.

Recommended tables:

- `products`
- `orders`
- `order_items`
- `profiles` or `user_roles`, if you add admin permissions

Recommended product fields:

- `id`
- `name`
- `description`
- `price`
- `category`
- `image_url`
- `is_available`
- `created_at`

Recommended order fields:

- `id`
- `order_number`
- `customer_name`
- `customer_phone`
- `customer_email`
- `pickup_date`
- `notes`
- `total_amount`
- `status`
- `is_paid`
- `created_at`

Recommended order item fields:

- `id`
- `order_id`
- `product_id`
- `product_name`
- `quantity`
- `unit_price`
- `line_total`

> [!TIP]
> Store `product_name` and `unit_price` on each order item. This keeps old
> orders accurate even if Ronit edits a product later.

## Setup Instructions

Complete the setup before building features.

### Step 0 - Install The Template

Open the class template link and follow the installation instructions. The
template setup script will ask you to:

- Choose a project name.
- Choose a destination folder.
- Complete the required setup steps for your operating system.

After the script finishes:

1. Open VS Code.
1. Click **Open** and choose the new project folder.
1. Open a new terminal:

   ```text
   Terminal > New Terminal
   ```

1. Start the development server:

   ```bash
   npm run dev
   ```

1. Open the app in your browser:

   ```text
   http://localhost:3000
   ```

You should see the template homepage.

### Step 1 - Configure The Template And Connect Supabase

The app needs Supabase to store products, orders, and order items.

In the Claude Code panel inside VS Code, run:

```text
/start-from-template
```

Follow the interactive instructions. When the setup is complete, verify that:

- A Supabase project was created.
- The app is connected to Supabase.
- Supabase MCP is configured so Claude Code can access the database.
- The app still runs at `http://localhost:3000`.

### Step 2 - Install The Hebrew And RTL Skill

The final app should support Hebrew and right-to-left layouts. Install the RTL
Skill from [Hebrew RTL Best Practices][hebrew-rtl-skill].

After installation, open a new Claude Code chat. Skills load only in new chats,
not in chats that were already open before installation.

To activate the Skill, include one of these lines in your prompts:

```text
Use the hebrew-rtl-best-practices skill.
```

```text
Make sure the design is correct for Hebrew and RTL.
```

Use this Skill every time you create or change a page, form, navigation area, or
component that includes Hebrew text.

## Development Milestones

Work in small milestones. At the end of each milestone, run the app, test the
feature manually, and make a Git commit.

### Milestone 1 - Plan The App

Switch Claude Code to **Plan Mode** and ask it to plan the bakery ordering app.

Include the business case, required features, and suggested database structure
from this assignment document in your prompt.

Ask Claude Code to produce:

- Page list.
- Database tables and fields.
- Relationships between tables.
- Authentication and admin approach.
- Implementation order.
- A few sample products for testing.

Do not start building until the plan makes sense.

### Milestone 2 - Authentication And Admin Access

Ask Claude Code to add login and registration using Supabase Auth.

After it creates the feature:

1. Create a new account in the app using your email.
1. Confirm the registration email.
1. Log in with your email and password.
1. Open your Supabase project.
1. Go to **Authentication**.
1. Verify that your user appears in the project.

Then ask Claude Code to give your email admin permissions in the app.

> [!IMPORTANT]
> The admin area must not be open to every visitor. At minimum, protect admin
> pages so only the configured admin user can access them.

### Milestone 3 - Products And Menu Page

Ask Claude Code to create the products table and seed a few sample products.

Then build the `/menu` page. Test that:

- Products load from Supabase.
- Unavailable products are hidden or clearly disabled.
- The **Add to Cart** button works.
- The cart indicator updates when products are added.

### Milestone 4 - Cart And Order Submission

Ask Claude Code to build the `/cart` page and order form.

Test that:

- Quantities can be changed.
- Products can be removed.
- Total price updates correctly.
- Required fields are validated.
- Submitting an order creates one order and the correct order items.
- The order is visible in Supabase Table Editor.

### Milestone 5 - My Orders Page

Ask Claude Code to build the `/orders` page.

Test that:

- A customer can search by phone number or email.
- Matching orders are displayed.
- Each order shows products, totals, payment status, and order status.
- Status labels are easy to understand.

### Milestone 6 - Admin Panel

Ask Claude Code to build an admin area at `/admin`.

The admin area should include:

- Product management.
- Order management.
- Search and filtering.
- Status updates.
- Payment tracking.

Test that Ronit can manage a full order from creation to completion.

### Milestone 7 - UX, Hebrew, And RTL Polish

Ask Claude Code to improve the user experience and visual design.

Your app should include:

- Clear top navigation.
- Mobile-friendly layout.
- Loading states while data is loading.
- Success messages after important actions.
- Error messages when something fails.
- Hebrew-friendly spacing, alignment, and direction.
- Consistent button and form styling.

## Git Checkpoints

Commit after each working milestone. Example commits:

```bash
git add .
git commit -m "Plan bakery ordering app"
```

```bash
git add .
git commit -m "Add Supabase authentication"
```

```bash
git add .
git commit -m "Add product menu and cart"
```

```bash
git add .
git commit -m "Add order submission"
```

```bash
git add .
git commit -m "Add admin order management"
```

Use commits as save points. If something breaks, you can compare changes and
return to the last working version.

## Suggested Claude Code Prompts

You may write your own prompts, but these examples can help you start.

### Planning Prompt

```text
Use Plan Mode. I am building a bakery ordering app for Mom's Bread.
Customers need to browse products, add items to a cart, submit an order,
and check order status. The bakery manager needs an admin area for products,
orders, statuses, and payments.

Please plan the pages, Supabase tables, relationships, auth rules,
and implementation order before writing code.
```

### Database Prompt

```text
Create the Supabase database structure for this bakery ordering app.
Include products, orders, and order_items. Add useful fields, relationships,
constraints, and sample products. Explain what each table is for before
applying changes.
```

### RTL Prompt

```text
Use the hebrew-rtl-best-practices skill. Review this page for Hebrew and RTL
layout issues, then fix spacing, alignment, direction, and form behavior.
```

## Optional Bonus Features

If you finish the required work early, add one or more bonus features.

### Menu Search

Add a search field that filters products by name or description.

### Category Filters

Add category filters for:

- Challahs.
- Cakes.
- Sweets.

### Real Product Images

Upload product images to Supabase Storage and display them on the menu page.

### Pickup Calendar

Show only available pickup dates, or prevent customers from choosing dates when
the bakery is closed.

### Customer Notifications

Add a simple email or WhatsApp message template Ronit can copy when an order is
ready for pickup.

### Improved Components

Use class tools to improve the design:

- Browse [21st.dev community components][twenty-first-components], use
  **Copy Prompt**, and paste the prompt into Claude Code.
- Choose a theme in [Tweakcn][tweakcn-theme] and ask Claude Code to apply it.

## Acceptance Criteria

Your assignment is complete when all required items below work.

- The app runs locally with `npm run dev`.
- The `/menu` page displays products from Supabase.
- Customers can add products to the cart.
- The `/cart` page shows selected products and correct totals.
- Customers can submit an order.
- Submitted orders are saved in Supabase.
- Order items are saved with quantity and price.
- The `/orders` page lets customers find their orders.
- Customers can see order status and payment status.
- The `/admin` area is protected.
- Ronit can add, edit, delete, and disable products.
- Ronit can view orders and update order status.
- Ronit can mark orders as paid or not paid.
- Search and filters work in the admin order list.
- The app has clear navigation, loading states, and success or error messages.
- Hebrew and RTL layout are handled correctly.
- Git commits were made along the way.

## Submission Checklist

Before submitting, verify each item:

- Run the app locally.
- Create or confirm sample products in Supabase.
- Place a test order from the customer side.
- Confirm the order appears in Supabase.
- Find the order on the `/orders` page.
- Update the order from the admin panel.
- Mark the order as paid.
- Test the app on a mobile screen size.
- Check that admin pages are not available to regular customers.
- Review Git history and confirm you have meaningful commits.
- Prepare a short demo showing the customer flow and the admin flow.

## Final Demo Flow

In your demo, show this complete flow:

1. Open the menu page.
1. Add two products to the cart.
1. Submit an order.
1. Find the order on the My Orders page.
1. Log in as admin.
1. Open the order in the admin panel.
1. Change the status to `Ready for Pickup`.
1. Mark the order as paid.
1. Return to the customer side and confirm the updated status appears.

## References

- [Hebrew RTL Best Practices][hebrew-rtl-skill]
- [21st.dev Community Components][twenty-first-components]
- [Tweakcn Theme Editor][tweakcn-theme]

[hebrew-rtl-skill]: https://skills.sh/skills-il/localization/hebrew-rtl-best-practices
[twenty-first-components]: https://21st.dev/community/components
[tweakcn-theme]: https://tweakcn.com/editor/theme
