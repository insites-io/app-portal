# Google Places (New) Migration Guide

This project now uses **Google Place Autocomplete (New)** for portal address lookups.

## APIs to enable in Google Cloud

In your Google Cloud project, enable all of the following:

- `Maps JavaScript API`
- `Places API`
- `Places API (New)`

Reference: [Get started with Place class](https://developers.google.com/maps/documentation/javascript/place-get-started)

## Files affected in this project

- `modules/website/public/views/partials/layout/googlemaps.liquid`
  - Updated Maps JavaScript loader version to `v=weekly` (required for latest Places features).
- `modules/portal/public/assets/scripts/address-lookup.js`
  - Migrated from legacy `google.maps.places.Autocomplete` widget to `google.maps.places.PlaceAutocompleteElement`.
  - Uses new `gmp-select` event and `place.fetchFields(...)`.
  - Added compatibility for both legacy and new address component shapes.
  - Keeps a legacy fallback if `PlaceAutocompleteElement` is unavailable.
- `modules/portal/public/assets/scripts/address-lookup.min.js`
  - Regenerated minified asset from updated source file.

## How it works now

1. The page includes `modules/website/layout/googlemaps`, which loads:
   - `https://maps.googleapis.com/maps/api/js?...&libraries=places&v=weekly`
2. Address lookup init runs from `AddressLookup.events.initGoogleAddressLookup()`.
3. For each `[address-lookup]` field:
   - The existing input is found.
   - A `PlaceAutocompleteElement` is inserted and constrained to `AU` via `includedRegionCodes = ['au']`.
   - The original input remains as the compatibility field for form submission, while the autocomplete element handles user interaction.
   - The autocomplete element reuses the original input classes/attributes on its internal input element to keep existing input styling.
   - On selection (`gmp-select`):
     - `placePrediction.toPlace()` is called.
     - `place.fetchFields({ fields: ["addressComponents", "location", "formattedAddress"] })` retrieves needed details.
     - Address fields (`*_address_1`, `*_suburb`, `*_state`, `*_postcode`, `*_country`, `*_latitude`, `*_longitude`) are populated.
4. No custom CSS is injected by `address-lookup`; styling is inherited from existing input classes.

## Country restriction

Address predictions are currently restricted to Australia:

- `includedRegionCodes = ['au']`

To support more countries, update these values in:

- `modules/portal/public/assets/scripts/address-lookup.js`

Then regenerate `address-lookup.min.js`.

## Validation and form behavior

- The original input is hidden once `PlaceAutocompleteElement` is mounted.
- On selection, the selected formatted address is copied back to the original input for compatibility with existing form logic.
- Existing hidden/structured address fields are still the source of submitted address data.

## Migration notes

- This migration follows Google’s Place class migration approach:
  - [Place class overview](https://developers.google.com/maps/documentation/javascript/place)
  - [Migration overview](https://developers.google.com/maps/documentation/javascript/places-migration-overview)
  - [Place Autocomplete migration](https://developers.google.com/maps/documentation/javascript/places-migration-autocomplete)
- No backend API contract changes were required in this codebase.
