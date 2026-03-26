# Component Documentation

This document covers the layouts, pages, and partials that make up the Insites Client Portal (`app-v5-client-portal`). The codebase is built on PlatformOS using Liquid templating. Components are Liquid partials included via `{% include %}` or `{%- include_form %}`.

---

## Module Structure

```
modules/
  portal/       Core portal logic, pages, and partials
  website/      Marketing site pages, assets, and shared layout elements
  client/       Client-specific API pages and layouts
  ins_forms/    Form builder forms (contact us, client feedback)
```

---

## Layouts

Layouts wrap all page content via `{{ content_for_layout }}`. Assigned per-page in frontmatter with `layout: modules/portal/<layout_name>`.

### `portal_default`

**File:** [modules/portal/public/views/layouts/portal_default.liquid](modules/portal/public/views/layouts/portal_default.liquid)

The primary authenticated portal layout. Used by non-form pages such as Overview and Users.

**Structure:**
- Full `<html>` document with cached `<head>` (shared website head partial)
- Cached header (desktop + mobile variants)
- Two-column grid: left sidebar (3/12 large, 5/12 medium) + main content (9/12 large, 7/12 medium)
- Includes `modules/portal/layouts/sidebar` for navigation
- Renders `{{ content_for_layout }}` inside `.main-content`
- Cached footer
- Conditionally includes ecommerce cart drawer if `context.constants.ecommerce_addon == 'true'`

**Used by pages:** `overview`, `users`

---

### `portal_form`

**File:** [modules/portal/public/views/layouts/portal_form.liquid](modules/portal/public/views/layouts/portal_form.liquid)

Used for pages that contain Stripe or form interactions. Same structure as `portal_default` but configured for form-heavy pages.

**Used by pages:** `my-details`, `my-company-details`, `payment-methods`, `pay-bills`, `feedback`

---

### `portal_account`

**File:** [modules/portal/public/views/layouts/portal_account.liquid](modules/portal/public/views/layouts/portal_account.liquid)

Split-screen layout for authentication pages. No sidebar or header.

**Structure:**
- Left panel (7/12): logo + page content (`{{ content_for_layout }}`)
  - `create-account` slug gets a slightly different container class (`.create-account-container`)
  - All other account pages use `.account-container`
- Right panel (5/12): background image (`.layout-background`)
- Logo sourced from `global.company_logo` (CMS global)
- Preloads LCP background image (`login-bg.webp`) with `fetchpriority="high"`

**Used by pages:** `sign-in`, `sign-out`, `forgot-password`, `password-reset`, `create-account`

---

### `portal_system_pages`

**File:** [modules/portal/public/views/layouts/portal_system_pages.liquid](modules/portal/public/views/layouts/portal_system_pages.liquid)

Minimal layout for system/error pages (403, 404, 500).

---

## Pages

All portal pages require authentication via `authorization_policies: modules/portal/is_user_logged_in` unless noted.

### Overview (`/overview`)

**File:** [modules/portal/public/views/pages/overview.liquid](modules/portal/public/views/pages/overview.liquid)
**Layout:** `portal_default`

Entry point for authenticated users. Delegates entirely to the `overview` partial.

---

### My Details (`/my-details`)

**File:** [modules/portal/public/views/pages/my_details.liquid](modules/portal/public/views/pages/my_details.liquid)
**Layout:** `portal_form`

Displays and updates the current user's personal information.

**Key logic:**
- Fetches current user via `modules/portal/account/get_current_user` GraphQL
- Syncs CRM contact to CRM company if `crm_contact[0].company_uuid` mismatches `portal[0].company_uuid`
- Fetches CRM contact and default address via controllers
- Renders `modules/portal/my_details` form and `modules/portal/change_password` form
- Includes Google Maps address lookup script
- Flash notices trigger `App.events.notyf` toasts (`Success-My-Details` / `Error-My-Details`)

**Scripts loaded (env-conditional):** `address-lookup`, `user-profile`

---

### My Company Details (`/my-company-details`)

**File:** [modules/portal/public/views/pages/my_company_details.liquid](modules/portal/public/views/pages/my_company_details.liquid)
**Layout:** `portal_form`

Allows the user to update their company information.

---

### Users (`/users`)

**File:** [modules/portal/public/views/pages/users.liquid](modules/portal/public/views/pages/users.liquid)
**Layout:** `portal_default`

User management page. Restricted to Primary Account Holders (PAH) only. Non-PAH users are redirected to `/403`.

**Key logic:**
- Calls `modules/portal/users/user_details` function to check `is_primary_account_holder`
- If PAH: renders heading and includes `modules/portal/users/list` partial
- If not PAH: `redirect_to '/403'`

**Scripts loaded:** `axios`, `apiServices`

---

### Payment Methods (`/payment-methods`)

**File:** [modules/portal/public/views/pages/payment_methods.liquid](modules/portal/public/views/pages/payment_methods.liquid)
**Layout:** `portal_form`

Stripe credit card management. Lists saved cards and allows adding/removing.

**Key logic:**
- Requires Stripe to be configured (`get_stripe_settings.account_id != ''`); shows setup message if not
- Fetches saved cards via `modules/portal/credit_cards/get_credit_card` GraphQL, filtered by `context.current_user.external_id`
- Renders one `ins-credit-card` web component per saved card
- "Add credit card" button triggers Stripe modal (injected via `stripe_element` partial)
- First card is set as `active` automatically if only one card exists
- Empty state shown via `#no-card` div (toggled via JS when last card is removed)

**Scripts loaded:** `axios`, `apiServices`, `user-profile`, `stripeServices`

---

### Pay a Bill (`/pay-bills`)

**File:** [modules/portal/public/views/pages/pay_bills.liquid](modules/portal/public/views/pages/pay_bills.liquid)
**Layout:** `portal_form`
**Sitemap:** excluded (`searchable: false`)

Allows users to submit a payment against an outstanding bill via Stripe.

**Key logic:**
- Requires Stripe to be configured; shows setup message otherwise
- After payment, reads session (`paybill_status`, `paybill_order_id`, `paybill_payment_id`) and shows success or failure notice partial
- Before payment, renders `modules/portal/pay_bills` form
- Stripe card element injected via `stripe_element` partial with `cc_field_id: "checkout-credit-card"`

**Scripts loaded:** `axios`, `pay-bills`, `stripeServices`, `apiServices`, `user-profile`

---

### Feedback (`/feedback`)

**File:** [modules/portal/public/views/pages/feedback.liquid](modules/portal/public/views/pages/feedback.liquid)
**Layout:** `portal_form`

Customer feedback submission. Toggles between the form and a thank-you state based on `?message=thank-you`.

**Key logic:**
- If `context.params.message == 'thank-you'`: renders thank-you confirmation with `icon-number-of-checks`
- Otherwise: renders `modules/ins_forms/client_feedback` form (built via Form Builder)

---

### Account Pages

| Page | Slug | File |
|------|------|------|
| Sign In | `/sign-in` | [account/sign_in.liquid](modules/portal/public/views/pages/account/sign_in.liquid) |
| Sign Out | `/sign-out` | [account/sign_out.liquid](modules/portal/public/views/pages/account/sign_out.liquid) |
| Forgot Password | `/forgot-password` | [account/forgot_password.liquid](modules/portal/public/views/pages/account/forgot_password.liquid) |
| Password Reset | `/password-reset` | [account/password_reset.liquid](modules/portal/public/views/pages/account/password_reset.liquid) |
| Create Account | `/create-account` | [account/create_account.liquid](modules/portal/public/views/pages/account/create_account.liquid) |

All use the `portal_account` layout. No authentication policy (public access).

---

## Partials

Partials are included via `{% include 'modules/portal/<path>' %}`. They receive variables from their parent scope unless explicitly passed.

---

### Sidebar

**File:** [modules/portal/public/views/partials/layouts/sidebar.liquid](modules/portal/public/views/partials/layouts/sidebar.liquid)
**Partial name:** `Portal | Layouts | Sidebar`

Renders the portal navigation. Has two distinct implementations in the same file: desktop and mobile.

**Desktop** (hidden on small screens via `.hide-for-small-only`):
- Vertical list of `ins-accordion-link` components
- Active state set by comparing `params.slug` to each route slug

**Mobile** (shown on small screens via `.show-for-small-only`):
- Single `ins-accordion-item` that shows the current page label as the heading
- Expands to show all nav links, hiding the current page's link

**Conditional nav items:**
- `Order history` — only shown if `context.constants.ecommerce_addon == 'true'`
- `My events` (upcoming/previous) — only shown if `context.constants.events_addon == 'true'`
- `Users` — only shown if `user_details.is_primary_account_holder != false`

**Data dependency:** calls `modules/portal/users/user_details` function to resolve PAH status.

---

### Banner

**File:** [modules/portal/public/views/partials/layouts/banner.liquid](modules/portal/public/views/partials/layouts/banner.liquid)
**Partial name:** `Portal | Banner`

Renders the hero carousel on the homepage/overview. Used by the website module's homepage (`index.liquid`).

**Key logic:**
- Fetches banner records from `modules/portal/banners/get_banner` GraphQL
- Falls back to a hardcoded default entry if the database has no records (temporary scaffold — comments indicate it should be removed once the database is populated)
- Renders an `ins-carousel` with autoplay, 5s duration, 700ms transition
- Each slide has a desktop image, mobile image (switched via `context.device.device_type`), heading, sub-text, and optional CTA button

**Props (from GraphQL data):**
- `main_text` — slide heading
- `sub_text` — slide body
- `desktop_image.url` / `mobile_image.url` — responsive images
- `button_label` / `button_link` — optional CTA (only rendered if `button_link` is non-empty)

---

### Paginations

**File:** [modules/portal/public/views/partials/layouts/paginations.liquid](modules/portal/public/views/partials/layouts/paginations.liquid)
**Partial name:** `Portal | Layouts | Paginations`

Generic pagination control. Used on any list page that renders records from a paginated GraphQL query.

**Required variables (passed from parent):**
- `page_num` — current page number (integer)
- `per_page` — current page size (integer)
- `data` — GraphQL result object with `total_entries`, `current_page`, `total_pages`

**Features:**
- Items-per-page selector using `ins-select` (options: 6, 15, 30)
- Displays `{start} - {end} of {total}` count
- Previous/next `ins-button` controls; each button only renders if the relevant page exists
- Preserves all existing query string parameters when building prev/next URLs (strips and re-appends `page` and `per_page` params)
- Page size change handled via JS `insValueChange` event — reloads page with new `per_page` and resets `page` to 1

---

### Overview

**File:** [modules/portal/public/views/partials/overview/overview.liquid](modules/portal/public/views/partials/overview/overview.liquid)
**Partial name:** `Portal | Overview | Overview`

Main dashboard content. Rendered by the `overview` page.

**Sections:**

1. **Overview banner** — fetches first banner record from `modules/portal/banners/get_banner`. Shows a card with image, heading, sub-text, and CTA button. Falls back to hardcoded placeholder list if no record exists (temporary — see inline comments).

2. **Stats cards** — currently uses hardcoded placeholder data (`Projects: 24`, `Open tasks: 12`, `Completed Task: 6`). Renders three `overview-cards` with icon, heading, count, and "View details" button. Conditionally includes `modules/ecommerce/overview/overview` if ecommerce addon is enabled.

3. **Requests table** — paginated table of requests fetched via `modules/portal/overview/get_request`. Uses `ins-table` with static pagination driven by JS `insPaginationChange` event. Columns: Description, Request type, Requested by, Date requested. Mobile view collapses rows into `ins-accordion-item`. Empty state shown inline.

**Query params:** `page` (default 1), `per_page` (default 10)

---

### Users List

**File:** [modules/portal/public/views/partials/users/list.liquid](modules/portal/public/views/partials/users/list.liquid)
**Partial name:** `Portal | Users | List`

Full user management panel. Fetches and displays all users in the company, with search, permission management, and invite flow.

**Data fetching:**
- Fetches PAH users (`get_pah_users`) separately from non-PAH users (`get_non_pah_users`), both filtered by `user_details.company_uuid`
- Merges both arrays via `concat` for display
- PAH query always fetches page 1, size 1 (to pin the PAH at the top); non-PAH query is paginated

**Passes to table sub-partials:**
- `modules/portal/users/partials/filters` — search input
- `modules/portal/users/partials/table_header` — column headers
- `modules/portal/users/partials/table_row` — one row per user (receives `item`)

**Invite user modal (`#add-user-modal`):**
- Fields: Email, First Name, Last Name, Phone (`ins-input-tel`), Permission Level (`ins-input-select`: Manager / Staff / No Access)
- Email field does a live async lookup to `/check-user-email` — prefills name/phone if user exists, shows warning banner for existing accounts
- Validation: first name, last name, and a valid email are required before submit
- Submit POSTs to `/update-user-account` with `actions=add_user`

**Permission level changes:**
- Each row has a `.selectPermission` `ins-input-select`
- Changing to `No Access` triggers a SweetAlert confirm ("Revoke Access?")
- Any other permission triggers a SweetAlert confirm ("Grant X Access?")
- Both confirmed actions POST to `/update-user-account` with `actions=change_permission_level`

**Hidden inputs passed to JS:** `total_entries`, `per_page`, `page_num`, `get-users` (JSON), `search-user`, `company-name`, `company-uuid`

---

### Registration Steps

**File:** [modules/portal/public/views/partials/account/registration_steps.liquid](modules/portal/public/views/partials/account/registration_steps.liquid)
**Partial name:** `Portal | Account | Registration steps`

Multi-step progress indicator for the account creation flow.

**Steps:** Personal, Company, Terms

- Renders two instances of `ins-steps`: one for large screens (inline/horizontal, `.hide-for-small-only`), one for small screens (`.show-for-small-only`)
- If `context.flash.notice` is set, all steps are marked as `complete`

---

### Payment Summary

**File:** [modules/portal/public/views/partials/pay_bills/payment_summary.liquid](modules/portal/public/views/partials/pay_bills/payment_summary.liquid)
**Partial name:** `Portal | Paybills | Payment summary`

Displays a calculated payment breakdown. Used in two modes: pre-payment (form mode) and post-payment (confirmation mode).

**Optional variable:** `order_id` — if provided, fetches real order data from `modules/portal/orders/get_order` and populates totals server-side. If absent, totals are populated client-side via JS.

**Displayed line items:**
- Bill amount
- Discount (conditional — only shown if `is_discount_code_enabled` or if the order had a non-zero discount)
- Subtotal
- Tax (10% GST)
- Processing fee (1.7% credit card surcharge, applied to subtotal + GST)
- **Total**

**Client-side calculation (when no `order_id`):**
- Listens to `insValueChange` on `#bill-amount`
- Recalculates and updates all summary spans in real time
- Updates hidden inputs (`bill-total-amount`, `bill-subtotal-amount`, `bill-tax-amount`, etc.) for form submission
- Uses a 500ms debounce

---

### Stripe Element

**File:** [modules/portal/public/views/partials/stripe/stripe_element.liquid](modules/portal/public/views/partials/stripe/stripe_element.liquid)
**Partial name:** `Portal | Stripe | Stripe element`

Injects the Stripe card capture modal and initialises the Stripe.js SDK. Included by both `payment-methods` and `pay-bills` pages.

**Parameters (passed via include):**
- `cc_field_id` — ID of the credit card field element to bind to (used in `pay-bills` as `"checkout-credit-card"`)
- `email_field_id` — ID of the email field (used to pass cardholder email to Stripe)

**Rendered output:**
- `ins-modal` (`#stripe-modal`) with Stripe card element mount point (`#card-element`) and error display (`#card-errors`)
- Cancel and Add buttons (responsive layout: desktop right-aligned, mobile stacked)
- Hidden inputs: `#email` (current user email), `#stripe-first-name`, `#stripe-last-name`, `#pk_key` (Stripe publishable key from `get_stripe_settings`)
- Initialises `Stripe(pk_key_value.value)` and assigns to `let stripe`

**Scripts loaded (env-conditional):** `stripe-element`, `stripe-model`

**Dependency:** `get_stripe_settings` must be assigned in the parent page before including this partial.

---

## Web Components Reference

These `ins-*` custom elements are provided by the Insites component library and are used throughout the portal.

| Component | Description |
|-----------|-------------|
| `ins-accordion` | Accordion container |
| `ins-accordion-item` | Single collapsible accordion panel. Props: `heading`, `open-icon`, `close-icon`, `active` |
| `ins-accordion-link` | Navigation link inside accordion. Props: `label`, `link`, `link-target`, `active` |
| `ins-button` | Button. Props: `label`, `icon`, `icon-right`, `solid`, `outlined`, `type`, `size`, `loading` |
| `ins-carousel` | Image/content slider. Props: `autoplay`, `duration`, `transition`, `loop`, `layout`, `bind-to` |
| `ins-credit-card` | Credit card display tile. Props: `brand`, `last-four`, `expiry-month`, `expiry-year`, `full-year`, `active`, `compact`, `value`, `data-id` |
| `ins-input` | Text input. Props: `id`, `label`, `name`, `value`, `placeholder` |
| `ins-input-select` | Select dropdown with custom styling. Props: `id`, `label`, `value` |
| `ins-input-select-option` | Option inside `ins-input-select`. Props: `label`, `value` |
| `ins-input-tel` | Phone number input with country code selector. Props: `id`, `label`, `phonenum-value`, `country-code`, `no-areacode` |
| `ins-loader` | Loading state overlay. Props: `id`, `hidden`, `state-title`, `state-message`, `state-icon` |
| `ins-modal` | Modal dialog. Props: `id`, `no-button`, `with-backdrop`, `heading`, `height`, `width` |
| `ins-select` | Compact select control. Props: `id`, `placeholder`, `small` |
| `ins-select-option` | Option inside `ins-select`. Props: `label`, `value`, `default` |
| `ins-steps` | Step progress indicator. Props: `inline`, `id` |
| `ins-step` | Single step. Props: `description`, `complete` |
| `ins-table` | Data table with built-in pagination. Props: `id`, `static-table`, `without-search`, `without-pagination`. JS props: `pageSizeOptions`, `totalCount`, `pageNumber`, `pageSize` |
| `ins-table-row` | Table row |
| `ins-table-th` | Table header cell. Props: `sortable` |
| `ins-table-td` | Table data cell |

**Custom events fired by Insites components:**

| Event | Component | Payload |
|-------|-----------|---------|
| `insValueChange` | `ins-select`, form inputs | `event.detail` — new value |
| `insInput` | `ins-input`, `ins-input-tel` | `event.detail` — input state |
| `insChange` | `ins-input-select` | `event.detail` — selected value |
| `insClick` | `ins-button` | — |
| `insPaginationChange` | `ins-table` | `event.detail.pageSize`, `event.detail.pageNumber` |

---

## Authorization Policies

| Policy | File | Behaviour |
|--------|------|-----------|
| `is_user_logged_in` | [authorization_policies/is_user_logged_in.liquid](modules/portal/public/authorization_policies/is_user_logged_in.liquid) | Redirects to `/sign-in` if no active session |
| `has_client_profile` | [authorization_policies/has_client_profile.liquid](modules/portal/public/authorization_policies/has_client_profile.liquid) | Requires a complete portal profile |

---

## Key Functions & GraphQL Queries

### Functions

| Function path | Returns |
|---------------|---------|
| `modules/portal/users/user_details` | `is_primary_account_holder`, `company_uuid`, `company_name` |
| `modules/portal/stripe/get_stripe_settings` | `account_id`, `pk_key` |
| `modules/portal/date/format_readable_date` | Human-readable date string. Requires `datetime` param |
| `crm/controller/contacts/get` | Full CRM contact record. Requires `uuid` |
| `crm/controller/addresses/get` | Address record. Requires `type`, `uuid` |
| `crm/controller/companies/assign-contacts` | Assigns contact to company |

### GraphQL Queries

| Query path | Used in |
|------------|---------|
| `modules/portal/account/get_current_user` | `my-details`, `payment-methods` |
| `modules/portal/banners/get_banner` | `banner` partial, `overview` partial |
| `modules/portal/credit_cards/get_credit_card` | `payment-methods` |
| `modules/portal/overview/get_request` | `overview` partial |
| `modules/portal/orders/get_order` | `payment_summary` partial |
| `modules/portal/users/get_pah_users` | `users/list` partial |
| `modules/portal/users/get_non_pah_users` | `users/list` partial |

---

## Feature Flags (Constants)

Checked via `context.constants.*` — configured per Insites instance.

| Constant | Effect when `'true'` |
|----------|---------------------|
| `ecommerce_addon` | Shows Order History nav link; includes ecommerce overview cards and cart drawer |
| `events_addon` | Shows My Events nav group (Upcoming / Previous) in sidebar |
