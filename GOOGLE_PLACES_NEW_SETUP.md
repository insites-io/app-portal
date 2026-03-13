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
  - Uses Places New Autocomplete Data API on the existing input (`AutocompleteSuggestion.fetchAutocompleteSuggestions`).
  - Uses `AutocompleteSessionToken`, `placePrediction.toPlace()`, and `place.fetchFields(...)` for selected result details.
  - Renders a project-owned suggestion dropdown for full styling control.
  - Added compatibility for both legacy and new address component shapes.
- `modules/portal/public/assets/scripts/address-lookup.min.js`
  - Regenerated minified asset from updated source file.

## How it works now

1. The page includes `modules/website/layout/googlemaps`, which loads:
   - `https://maps.googleapis.com/maps/api/js?...&libraries=places&v=weekly`
2. Address lookup init runs from `AddressLookup.events.initGoogleAddressLookup()`.
3. For each `[address-lookup]` field:
   - The existing input is found.
   - User input is sent to Places New Autocomplete Data API and constrained to `AU` using `includedRegionCodes = ['au']`.
   - Suggestions are rendered by a custom dropdown controlled in project code.
   - On selection:
     - `placePrediction.toPlace()` is called.
     - `place.fetchFields({ fields: ["addressComponents", "location", "formattedAddress"] })` retrieves needed details.
     - Address fields (`*_address_1`, `*_suburb`, `*_state`, `*_postcode`, `*_country`, `*_latitude`, `*_longitude`) are populated.
4. Styling for the autocomplete UI is fully controlled in project CSS/JS since the rendered dropdown is project-owned.

## Styling reference (how to edit UI)

Primary file for autocomplete styling:

- `modules/website/public/assets/styles/default.css`

Primary classes used by autocomplete dropdown:

- `.ins-address-lookup-dropdown`
  - Positions and styles the suggestion panel (border, radius, max-height, scroll).
- `.ins-address-lookup-dropdown.is-open`
  - Controls visible/open state of the suggestion panel.
- `.ins-address-lookup-item`
  - Base style for each suggestion row (padding, font, text color).
- `.ins-address-lookup-item:hover`
  - Mouse hover style for suggestion row.
- `.ins-address-lookup-item.is-active`
  - Keyboard-selected row style (ArrowUp/ArrowDown navigation).

Behavior/source wiring:

- `modules/portal/public/assets/scripts/address-lookup.js`
  - Creates the dropdown element and row items.
  - Adds/removes `.is-open` and `.is-active` state classes.
  - Handles keyboard + click selection.

## Country restriction

Address predictions are currently restricted to Australia:

- `includedRegionCodes = ['au']`

To support more countries, update these values in:

- `modules/portal/public/assets/scripts/address-lookup.js`

Then regenerate `address-lookup.min.js`.

## Validation and form behavior

- The original input remains visible and is used for typing and selection display.
- On selection, the selected formatted address is written to the same input.
- Existing hidden/structured address fields are still the source of submitted address data.

## Migration notes

- This migration follows Google’s Place class migration approach:
  - [Place class overview](https://developers.google.com/maps/documentation/javascript/place)
  - [Migration overview](https://developers.google.com/maps/documentation/javascript/places-migration-overview)
  - [Place Autocomplete migration](https://developers.google.com/maps/documentation/javascript/places-migration-autocomplete)
- No backend API contract changes were required in this codebase.
