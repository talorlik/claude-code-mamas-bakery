# PRD: Mom's Bread Bakery Ordering App

## 1. Product Summary

Mom's Bread is a small bakery ordering web app for a home-based boutique bakery managed by Ronit. The app allows customers to browse available baked goods, add products to a cart, submit pickup orders, and check order status. It also provides a protected admin area where Ronit can manage products, view orders, update order statuses, and track payment state.

The app is built on the existing AI Game Changer App Template using Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and Vercel AI SDK. The template has already been installed and the initial setup commands have already been executed.

## 2. Source Basis

This PRD is based on:

- The bakery assignment document for Mom's Bread.
- The AI Game Changer App Template PDF.
- The user's declared tech stack, completed setup state, and current project state.

## 3. Business Problem

Ronit currently manages bakery orders manually across messages and emails. This creates operational friction:

- Order data is scattered across channels.
- Product availability is repeatedly asked by customers.
- Quantities and pickup dates are easy to miss.
- Payment status is difficult to track.
- Customers do not have a clear way to check whether an order is ready.

## 4. Product Goals

| Goal | Description | Success Signal |
|---|---|---|
| Centralize ordering | Customers submit orders through one app | New orders appear in Supabase with matching order items |
| Improve product visibility | Customers can see available bakery products | `/menu` shows only orderable products by default |
| Reduce customer follow-up | Customers can check order status themselves | `/orders` returns matching orders by phone or email |
| Support bakery operations | Admin can manage products and orders | `/admin` supports product CRUD and order workflow management |
| Protect admin actions | Only authorized admin users can access admin pages | Non-admin users cannot access admin routes |
| Support Hebrew and RTL | UI works correctly for Hebrew content | Pages use correct direction, alignment, spacing, and form layout |

## 5. Target Users

### 5.1 Customer

A customer wants to:

- Browse the bakery menu.
- Add products to a cart.
- Choose quantities.
- Submit contact and pickup details.
- Receive an order number.
- Later check order status and payment status.

### 5.2 Admin: Ronit

Ronit wants to:

- Add, edit, disable, and delete products.
- See all orders sorted newest first.
- Open an order and view customer details and line items.
- Change order status.
- Mark orders as paid or unpaid.
- Filter and search orders.

## 6. Scope

### 6.1 In Scope

- Public customer pages.
- Supabase-backed product catalog.
- Local browser cart.
- Order submission flow.
- Customer order lookup by phone or email.
- Supabase Auth signup and login.
- Admin authorization through a `user_roles` or `profiles` table.
- Protected admin pages.
- Product management.
- Order management.
- Hebrew and RTL-ready UI.
- SEO metadata.
- Loading states, success states, and error states.
- Unit, integration, and end-to-end tests where relevant.
- TSDoc for exported functions, server actions, types, and shared utilities.

### 6.2 Out of Scope For Required Version

- Real payment processing.
- Real email or WhatsApp delivery.
- Inventory management.
- Delivery logistics.
- Multi-tenant bakery support.
- Full customer accounts for order history.
- Complex analytics dashboards.
- Production-grade rate limiting beyond basic server-side validation.

## 7. Current Project Assumptions

- The template is already installed.
- `/start-from-template` has already been run.
- `/setup-vercel-ai` has already been run.
- `/setup-github` has already been run.
- `/setup-vercel` has already been run.
- Supabase, Vercel, GitHub, AI Gateway, MCPs, keys, secrets, and tokens have already been created and configured.
- Signup and login have been started but are incomplete.
- Development should continue from the existing repository state rather than recreating the project.

## 8. Functional Requirements

## 8.1 Global App Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-GLOBAL-001 | The app must run locally with `npm run dev`. | Must |
| FR-GLOBAL-002 | The app must use Next.js App Router routes. | Must |
| FR-GLOBAL-003 | The app must use strict TypeScript. | Must |
| FR-GLOBAL-004 | The app must use Supabase for products, orders, order items, and admin authorization. | Must |
| FR-GLOBAL-005 | The app must include clear navigation for customer and admin flows. | Must |
| FR-GLOBAL-006 | The app must include loading, empty, success, and error states. | Must |
| FR-GLOBAL-007 | The app must support Hebrew and RTL layout. | Must |
| FR-GLOBAL-008 | The app must include SEO metadata for public pages. | Must |
| FR-GLOBAL-009 | Exported functions, shared utilities, server actions, and important types must include TSDoc. | Must |

## 8.2 Authentication And Authorization

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-001 | Users must be able to sign up using Supabase Auth. | Must |
| FR-AUTH-002 | Users must be able to log in using Supabase Auth. | Must |
| FR-AUTH-003 | Auth sessions must be handled using the existing Supabase SSR helpers and `proxy.ts`. | Must |
| FR-AUTH-004 | Admin pages under `/admin` must be protected. | Must |
| FR-AUTH-005 | Admin access must be based on an explicit admin role or profile record. | Must |
| FR-AUTH-006 | Non-admin authenticated users must not access admin pages. | Must |
| FR-AUTH-007 | Unauthenticated users must be redirected away from admin pages. | Must |

## 8.3 Menu Page

Route: `/menu`

| ID | Requirement | Priority |
|---|---|---|
| FR-MENU-001 | Display available products from Supabase. | Must |
| FR-MENU-002 | Each product card must show image or placeholder, name, description, price, category, and Add to Cart button. | Must |
| FR-MENU-003 | Unavailable products must not be orderable. | Must |
| FR-MENU-004 | A cart indicator must show current cart item count. | Must |
| FR-MENU-005 | Add to Cart must update local cart state. | Must |
| FR-MENU-006 | Menu must be mobile friendly. | Must |
| FR-MENU-007 | Menu search by name or description may be included as a bonus. | Should |
| FR-MENU-008 | Category filters for challahs, cakes, and sweets may be included as a bonus. | Should |

## 8.4 Cart And Order Submission

Route: `/cart`

| ID | Requirement | Priority |
|---|---|---|
| FR-CART-001 | Display all selected cart products. | Must |
| FR-CART-002 | Allow quantity increase and decrease. | Must |
| FR-CART-003 | Allow removing a product from the cart. | Must |
| FR-CART-004 | Show updated subtotal, line totals, and total amount. | Must |
| FR-CART-005 | Include an order form with full name, phone, email, pickup date, and notes. | Must |
| FR-CART-006 | Validate required fields before submission. | Must |
| FR-CART-007 | Validate that pickup date is not in the past. | Must |
| FR-CART-008 | Submit order through server-side logic. | Must |
| FR-CART-009 | Save one order record and all related order item records in Supabase. | Must |
| FR-CART-010 | Store product name and unit price snapshots on each order item. | Must |
| FR-CART-011 | Show a success message with order number. | Must |
| FR-CART-012 | Clear cart after successful order submission. | Must |

## 8.5 My Orders Page

Route: `/orders`

| ID | Requirement | Priority |
|---|---|---|
| FR-ORDERS-001 | Customers must be able to search orders by phone number or email address. | Must |
| FR-ORDERS-002 | Matching orders must show order number, order date, pickup date, product names, quantities, total amount, payment status, and order status. | Must |
| FR-ORDERS-003 | Order status labels must be visually clear. | Must |
| FR-ORDERS-004 | Payment status must be visually clear. | Must |
| FR-ORDERS-005 | Empty results must show a helpful message. | Must |
| FR-ORDERS-006 | Lookup must not expose all customer orders publicly. | Must |

## 8.6 Admin Product Management

Routes:

- `/admin`
- `/admin/products`

| ID | Requirement | Priority |
|---|---|---|
| FR-ADMIN-PROD-001 | Admin can view all products. | Must |
| FR-ADMIN-PROD-002 | Admin can add a product. | Must |
| FR-ADMIN-PROD-003 | Admin can edit name, price, description, category, and image URL. | Must |
| FR-ADMIN-PROD-004 | Admin can delete a product. | Must |
| FR-ADMIN-PROD-005 | Admin can mark a product unavailable without deleting it. | Must |
| FR-ADMIN-PROD-006 | Product mutations must validate input server-side. | Must |
| FR-ADMIN-PROD-007 | Admin product list must include clear unavailable state. | Must |

## 8.7 Admin Order Management

Routes:

- `/admin/orders`
- `/admin/orders/[orderId]` or modal/detail panel inside `/admin/orders`

| ID | Requirement | Priority |
|---|---|---|
| FR-ADMIN-ORDER-001 | Admin can view all orders sorted newest first. | Must |
| FR-ADMIN-ORDER-002 | Admin can open an order and view customer and product details. | Must |
| FR-ADMIN-ORDER-003 | Admin can change order status. | Must |
| FR-ADMIN-ORDER-004 | Admin can mark an order paid or unpaid. | Must |
| FR-ADMIN-ORDER-005 | Admin can filter orders by status. | Must |
| FR-ADMIN-ORDER-006 | Admin can filter orders by pickup date. | Must |
| FR-ADMIN-ORDER-007 | Admin can search orders by customer name, phone, or email. | Must |
| FR-ADMIN-ORDER-008 | Admin order mutations must validate role server-side. | Must |

## 8.8 AI Chat Route

| ID | Requirement | Priority |
|---|---|---|
| FR-AI-001 | Keep the existing authenticated `/api/chat` route functional if it already exists. | Should |
| FR-AI-002 | Do not make AI chat part of the required ordering flow. | Should |
| FR-AI-003 | Do not expose AI Gateway keys to the browser. | Must |

## 9. Data Requirements

## 9.1 Product Data

Products must support:

- Product identity.
- Name.
- Description.
- Price.
- Category.
- Image URL.
- Availability flag.
- Created timestamp.
- Updated timestamp.

## 9.2 Order Data

Orders must support:

- Unique order number visible to customers.
- Customer full name.
- Customer phone.
- Customer email.
- Desired pickup date.
- Notes.
- Total amount.
- Status.
- Payment state.
- Created timestamp.
- Updated timestamp.

## 9.3 Order Item Data

Order items must support:

- Parent order reference.
- Product reference.
- Product name snapshot.
- Quantity.
- Unit price snapshot.
- Line total.

## 9.4 Admin Authorization Data

Admin access must support one of these approaches:

- `user_roles` table with `user_id` and `role`.
- `profiles` table with `role`.

Recommended approach: `user_roles`, because it keeps authorization focused and avoids coupling profile metadata to permissions.

## 10. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Customers can order only products that are currently available. |
| BR-002 | Product price must be non-negative. |
| BR-003 | Cart quantity must be an integer greater than zero. |
| BR-004 | Order total must be calculated server-side from current product prices at submission time. |
| BR-005 | `product_name` and `unit_price` must be copied into `order_items` at order creation. |
| BR-006 | Order status must be one of `New`, `Received`, `Ready for Pickup`, `Completed`. |
| BR-007 | New customer orders default to status `New`. |
| BR-008 | New customer orders default to unpaid. |
| BR-009 | Pickup date cannot be in the past. |
| BR-010 | Admin pages and admin mutations require an admin role. |
| BR-011 | Customer order lookup must require exact phone or exact email input. |
| BR-012 | Deleting a product must not corrupt historical order items because order items keep product snapshots. |

## 11. UX Requirements

| Area | Requirement |
|---|---|
| Navigation | Show customer navigation links: Home, Menu, Cart, My Orders. Show Admin only to authorized admins where practical. |
| Cart | Cart count should update immediately after add, remove, increase, or decrease actions. |
| Forms | Fields must show validation messages near the relevant input. |
| Feedback | Use Sonner toasts or visible inline messages for important success and failure events. |
| Loading | Data-fetching pages and form submissions must show loading states. |
| Empty states | Empty menu, empty cart, no matching orders, and no admin records must show clear messages. |
| Mobile | All customer and admin pages must be usable on mobile screen sizes. |
| RTL | Hebrew text and forms must use correct direction, spacing, alignment, and layout behavior. |
| Dark mode | Existing `next-themes` support should not be broken. |

## 12. SEO Requirements

| Page | Metadata Requirements |
|---|---|
| `/` | Title and description for Mom's Bread bakery ordering app. |
| `/menu` | Title and description targeting bakery menu and online ordering. |
| `/cart` | No-index optional, but still must have a clear title. |
| `/orders` | No-index optional, because it is a lookup page. |
| `/login` and `/signup` | No-index optional. |
| Admin routes | Must be no-index. |

## 13. Accessibility Requirements

| ID | Requirement |
|---|---|
| A11Y-001 | Forms must use labels associated with inputs. |
| A11Y-002 | Buttons must have accessible names. |
| A11Y-003 | Status labels must not rely only on color. |
| A11Y-004 | Error messages must be readable by assistive technology. |
| A11Y-005 | Keyboard navigation must work for menus, dialogs, and forms. |
| A11Y-006 | Color contrast must be sufficient in light and dark modes. |

## 14. Testing Requirements

| Test Type | Required Coverage |
|---|---|
| Unit tests | Cart calculations, validation utilities, price formatting, order status mapping, role helpers. |
| Integration tests | Supabase data access functions, order creation server action or route, admin authorization checks. |
| Component tests | Menu product card, cart item row, order status badge, product form, order filters. |
| E2E tests | Customer flow from menu to order status lookup, admin flow from login to order update. |
| Manual tests | Assignment final demo flow and submission checklist. |

## 15. Acceptance Criteria

The app is complete when:

- `npm run dev` starts the app successfully.
- `/menu` displays products from Supabase.
- Customers can add products to the cart.
- `/cart` shows selected products and correct totals.
- Customers can submit an order.
- Submitted orders are saved in Supabase.
- Order items are saved with quantity and price snapshots.
- `/orders` lets customers find their orders.
- Customers can see order status and payment status.
- `/admin` is protected.
- Ronit can add, edit, delete, and disable products.
- Ronit can view orders and update order status.
- Ronit can mark orders as paid or unpaid.
- Search and filters work in the admin order list.
- The app has clear navigation, loading states, and success or error messages.
- Hebrew and RTL layout are handled correctly.
- Meaningful Git commits exist for each completed milestone.

## 16. Final Demo Flow

1. Open `/menu`.
2. Add two products to the cart.
3. Open `/cart`.
4. Submit an order.
5. Copy the order number from the success message.
6. Open `/orders`.
7. Search for the order by phone or email.
8. Confirm the order appears with status and payment state.
9. Log in as admin.
10. Open `/admin/orders`.
11. Open the order details.
12. Change status to `Ready for Pickup`.
13. Mark the order as paid.
14. Return to `/orders`.
15. Confirm the updated status and payment state appear to the customer.
