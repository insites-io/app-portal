# Changelog: `google-places-styling` vs `master`

Generated from:
- `git log master..HEAD`
- `git diff --name-status master...HEAD`
- `git diff --stat master...HEAD`
- `git status --short`

## Branch summary

- Branch: `google-places-styling`
- Base: `master`
- Diff scope: `master...HEAD` (plus current working tree status)
- Total file delta: **27 files changed**, **590 insertions**, **89 deletions**

## Commits ahead of `master`

- `f3023d95` `[TW#25850935] - Styling for Google Places`
- `af1ed294` `[TW#25850935] - Cache Control on Lightroom Task`
- `daf852ea` `[TW#25850935] - Website and Portal v1.3.2 WIP`
- `74228cd9` `[TW#25850935] - Fixes for v1.3.2 - Registration WIP`
- `7f2c1a0f` `[TW#25850935] - Fixes for v1.3.2`

## What changed (functional)

### 1) Address search now uses Google Places (New)

- **Before:** legacy Google Places widget flow.
- **After:** Places New integration for portal address lookup, with updated mapping of selected place details into existing form fields.
- **User impact:** address selection behavior is updated, and address components/lat-lng are still written to the same hidden fields used by forms.
- **Files:**
  - `modules/portal/public/assets/scripts/address-lookup.js`
  - `modules/portal/public/assets/scripts/address-lookup.min.js`
  - `modules/website/public/views/partials/layout/googlemaps.liquid`
  - `GOOGLE_PLACES_NEW_SETUP.md`

### 2) Address autocomplete styling was updated

- Added/updated styling rules for autocomplete input/dropdown states (default, hover, selected, focus handling).
- **User impact:** visual behavior of address search input and suggestions changed to match project theme.
- **Files:**
  - `modules/website/public/assets/styles/default.css`
  - `modules/website/public/assets/styles/default.min.css`

### 3) Account/registration flow updates

- `modules/portal/public/forms/account/create-account.liquid`
- `modules/portal/public/forms/account/my_company_details.liquid`
- `modules/portal/public/forms/account/password_reset.liquid`
- `modules/portal/public/views/pages/my_company_details.liquid`
- `modules/portal/public/views/pages/api/account/email/get.liquid`
- `modules/portal/public/views/partials/account/registration_personal_details.liquid`

### 4) Pay bills / Stripe related updates

- `modules/portal/public/views/partials/pay_bills/callback_update_models.liquid`
- `modules/portal/public/views/partials/pay_bills/payment_notice_success.liquid`
- `modules/portal/public/views/partials/stripe/get_stripe_settings.liquid`
- `modules/portal/public/views/partials/stripe/payments/checkout_payment_paybill.liquid`

### 5) Website content/layout/schema updates

- `modules/website/public/views/partials/content/news/list.liquid`
- `modules/website/public/views/partials/layout/head.liquid`
- `modules/website/public/views/partials/layout/technical-head/google-fonts.liquid`
- `modules/website/public/views/partials/layout/technical-head/insites-assets.liquid`
- `modules/website/public/views/partials/layout/technical-head/vendor-assets.liquid`
- `modules/website/public/views/partials/layout/technical_foot.liquid`
- `modules/website/public/graphql/home/get_feedback.graphql`
- `modules/website/public/schema/feedback.yml`

### 6) Hosting/config additions

- `public/_headers` (added)
- `vercel.json` (added)

### 7) Binary artifact

- `modules.zip` (added, ~4.8 MB)

## What changed (technical)

- Loader/version update for Google Maps JS include (`v=weekly` in layout partial).
- Address lookup script refactoring around autocomplete initialization and selection handling.
- Styling consolidation/minification for website defaults.
- Documentation added for enablement and maintenance:
  - `GOOGLE_PLACES_NEW_SETUP.md`

## Current uncommitted changes (working tree)

These files are modified locally and not yet committed:

- `GOOGLE_PLACES_NEW_SETUP.md`
- `modules/portal/public/assets/scripts/address-lookup.js`
- `modules/portal/public/assets/scripts/address-lookup.min.js`
- `modules/website/public/assets/styles/default.css`
- `modules/website/public/assets/styles/default.min.css`

## Notes

- This changelog is branch-level and includes all work currently in `google-places-styling` relative to `master`, not just the latest single feature.
