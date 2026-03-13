let addressValueChanged = false;

var AddressLookup = (function () {
    // google address lookup field
    let searchAddressElement; 

    return {
        methods: {
            getAddressComponentLongName(item) {
                return item.long_name || item.longText || "";
            },
            getAddressComponentShortName(item) {
                return item.short_name || item.shortText || this.getAddressComponentLongName(item);
            },
            getAddressComponents(place) {
                return place.addressComponents || place.address_components || [];
            },
            getGeometry(place) {
                const location = place.location || (place.geometry && place.geometry.location);
                if (!location) {
                    return { latitude: "", longitude: "" };
                }

                const latitude = typeof location.lat === "function" ? location.lat() : location.lat;
                const longitude = typeof location.lng === "function" ? location.lng() : location.lng;
                return {
                    latitude,
                    longitude
                };
            },
            applyPlaceAutocompleteTheme(lookupField, placeAutocomplete) {
                if (!lookupField || !placeAutocomplete) return;

                if (!document.getElementById("place-autocomplete-theme-style")) {
                    const style = document.createElement("style");
                    style.id = "place-autocomplete-theme-style";
                    style.textContent = `
                        gmp-place-autocomplete.ins-place-autocomplete-theme::part(input) {
                            background:  #ffffff !important;
                            color: var(--ins-pa-color, inherit) !important;
                            border-left: 0px !important;
                            border-right: 0px !important;
                            border-top: 1px solid #DFDFDF !important;
                            border-bottom: 1px solid #DFDFDF !important;
                            border-radius: var(--ins-pa-radius, 0) !important;
                            padding: var(--ins-pa-padding, 0) !important;
                            font-family: var(--ins-pa-font-family, inherit) !important;
                            font-size: var(--ins-pa-font-size, inherit) !important;
                            font-weight: var(--ins-pa-font-weight, inherit) !important;
                            line-height: var(--ins-pa-line-height, normal) !important;
                            box-shadow: var(--ins-pa-shadow, none) !important;
                            min-height: var(--ins-pa-min-height, auto) !important;
                            height: var(--ins-pa-height, auto) !important;
                            box-sizing: var(--ins-pa-box-sizing, border-box) !important;
                        }

                        gmp-place-autocomplete.ins-place-autocomplete-theme::part(prediction-list) {
                            background: var(--ins-pa-bg, #ffffff) !important;
                            color: var(--ins-pa-color, inherit) !important;
                        }
                            // gmp-place-autocomplete.ins-place-autocomplete-theme::part(prediction-item) {
                            //     background-color: red !important;
                            //     cursor: default;
                            // }
                    `;
                    document.head.appendChild(style);
                }

                const computedStyle = window.getComputedStyle(lookupField);
                const backgroundColor = computedStyle.backgroundColor === "rgba(0, 0, 0, 0)" || computedStyle.backgroundColor === "transparent"
                    ? "#ffffff"
                    : computedStyle.backgroundColor;

                placeAutocomplete.classList.add("ins-place-autocomplete-theme");
                placeAutocomplete.style.setProperty("--ins-pa-bg", backgroundColor);
                placeAutocomplete.style.setProperty("--ins-pa-color", computedStyle.color || "inherit");
                placeAutocomplete.style.setProperty("--ins-pa-border", computedStyle.border || "0");
                placeAutocomplete.style.setProperty("--ins-pa-radius", computedStyle.borderRadius || "0");
                placeAutocomplete.style.setProperty("--ins-pa-padding", computedStyle.padding || "0");
                placeAutocomplete.style.setProperty("--ins-pa-font-family", computedStyle.fontFamily || "inherit");
                placeAutocomplete.style.setProperty("--ins-pa-font-size", computedStyle.fontSize || "inherit");
                placeAutocomplete.style.setProperty("--ins-pa-font-weight", computedStyle.fontWeight || "inherit");
                placeAutocomplete.style.setProperty("--ins-pa-line-height", computedStyle.lineHeight || "normal");
                placeAutocomplete.style.setProperty("--ins-pa-shadow", computedStyle.boxShadow || "none");
                placeAutocomplete.style.setProperty("--ins-pa-min-height", computedStyle.minHeight || "auto");
                placeAutocomplete.style.setProperty("--ins-pa-height", computedStyle.height || "auto");
                placeAutocomplete.style.setProperty("--ins-pa-box-sizing", computedStyle.boxSizing || "border-box");
            },
            syncPlaceAutocompleteInput(lookupField, placeAutocomplete) {
                if (!lookupField || !placeAutocomplete) return;

                const applyInputProps = () => {
                    const autocompleteInput = placeAutocomplete.inputElement;
                    if (!autocompleteInput) return false;

                    // Keep visual style by reusing the original input classes.
                    autocompleteInput.className = lookupField.className || "";

                    [
                        "autocomplete",
                        "aria-label",
                        "aria-describedby",
                        "aria-invalid",
                        "maxlength",
                        "minlength",
                        "inputmode"
                    ].forEach(attr => {
                        const value = lookupField.getAttribute(attr);
                        if (value !== null) {
                            autocompleteInput.setAttribute(attr, value);
                        }
                    });

                    if (lookupField.hasAttribute("required")) {
                        autocompleteInput.setAttribute("required", "required");
                    }

                    if (lookupField.value) {
                        autocompleteInput.value = lookupField.value;
                    }

                    // Ensure the widget input visually matches the existing field.
                    const computedStyle = window.getComputedStyle(lookupField);
                    [
                        "backgroundColor",
                        "color",
                        "fontFamily",
                        "fontSize",
                        "fontWeight",
                        "lineHeight",
                        "border",
                        "borderRadius",
                        "padding",
                        "boxShadow",
                        "minHeight",
                        "height",
                        "boxSizing"
                    ].forEach(styleKey => {
                        const value = computedStyle[styleKey];
                        if (value) {
                            autocompleteInput.style[styleKey] = value;
                        }
                    });

                    return true;
                };

                if (applyInputProps()) return;

                // inputElement can be attached after the element is mounted.
                let retries = 0;
                const maxRetries = 10;
                const retryInterval = setInterval(() => {
                    retries++;
                    if (applyInputProps() || retries >= maxRetries) {
                        clearInterval(retryInterval);
                    }
                }, 100);
            },
            async fillAddress(place, type) {
                if (!place) return;

                // Fetch fields for Place (New) if available and not already present.
                if (typeof place.fetchFields === "function" && !place.addressComponents) {
                    await place.fetchFields({
                        fields: ["addressComponents", "location", "formattedAddress"]
                    });
                }

                const address = AddressLookup.methods.getAddressComponents(place);
                const geometry = AddressLookup.methods.getGeometry(place);

                AddressLookup.methods.resetAddress(type);
                AddressLookup.methods.unselectAddressCards(type);

                if (address && address.length) {
                    AddressLookup.methods.mapGoogleAddress(address, type, geometry);
                    addressValueChanged = true;
                }
            },
            resetAddress(type) {
                let addressField = document.querySelectorAll(`[${type}-address-field]`);
                for (let i = 0; i < addressField.length; i++) {
                    addressField[i].value = "";
                }
            },
            unselectAddressCards(type) {
                let cards = document.querySelectorAll(`ins-checkbox-card[name="${type}-address-cards"]`);
                    cards.forEach(el => {
                        el.classList.remove('is-invalid');
                        el.removeAttribute('selected');
                        el.selected = false;
                    });
            },
            mapGoogleAddress(address, name, geometry) {
                //clear values
                if(document.getElementById(`${name}_address_1`))
                    document.getElementById(`${name}_address_1`).value = "";
                if(document.getElementById(`${name}_address_2`))
                    document.getElementById(`${name}_address_2`).value = "";
                if(document.getElementById(`${name}_suburb`))
                    document.getElementById(`${name}_suburb`).value = "";
                if(document.getElementById(`${name}_state`))
                    document.getElementById(`${name}_state`).value = "";
                if(document.getElementById(`${name}_postcode`))
                    document.getElementById(`${name}_postcode`).value = "";
                if(document.getElementById(`${name}_country`))
                    document.getElementById(`${name}_country`).value = "";

                if(document.getElementById(`${name}_longitude`))
                    document.getElementById(`${name}_longitude`).value = geometry.longitude;
                if(document.getElementById(`${name}_latitude`))
                    document.getElementById(`${name}_latitude`).value = geometry.latitude;

                address.forEach(item => {
                    let addressType = item.types[0];
                    // Update fields as needed on project.
                    switch (addressType) {
                        case "street_number":
                            if(document.getElementById(`${name}_address_1`))
                                document.getElementById(`${name}_address_1`).value = AddressLookup.methods.getAddressComponentShortName(item) + " ";
                            break;

                        case "premise":
                            if(document.getElementById(`${name}_address_1`))
                                document.getElementById(`${name}_address_1`).value = AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            break;

                        case "route":
                            if(document.getElementById(`${name}_address_1`))
                                document.getElementById(`${name}_address_1`).value += AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            break;

                        case "neighborhood":
                            if(document.getElementById(`${name}_address_2`))
                                document.getElementById(`${name}_address_2`).value += AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            break;

                        case "sublocality_level_1":
                            if(document.getElementById(`${name}_address_2`))
                                document.getElementById(`${name}_address_2`).value += AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            break;

                        case "locality":
                            if (address.length > 7 &&
                                address.length < 9 &&
                                AddressLookup.methods.getAddressComponentLongName(address[6]) !== "Canada") {

                                if(document.getElementById(`${name}_address_2`))
                                    document.getElementById(`${name}_address_2`).value += AddressLookup.methods.getAddressComponentLongName(item) + " ";

                            } else {
                                if(document.getElementById(`${name}_suburb`))
                                    document.getElementById(`${name}_suburb`).value = AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            }
                            break;

                        case "postal_town":
                            if(document.getElementById(`${name}_suburb`))
                                document.getElementById(`${name}_suburb`).value += AddressLookup.methods.getAddressComponentLongName(item);
                            break;

                        case "administrative_area_level_2":
                            if (address.length <= 7) {
                                if(document.getElementById(`${name}_state`))
                                    document.getElementById(`${name}_state`).value = AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            } else{
                                if(document.getElementById(`${name}_state`))
                                document.getElementById(`${name}_state`).value = AddressLookup.methods.getAddressComponentLongName(item) + " ";
                            }
                            break;

                        case "administrative_area_level_1":
                            if (address.length < 8){
                                if(document.getElementById(`${name}_state`))
                                    document.getElementById(`${name}_state`).value = AddressLookup.methods.getAddressComponentShortName(item);
                            }else{
                                if(document.getElementById(`${name}_suburb`))
                                    document.getElementById(`${name}_suburb`).value += AddressLookup.methods.getAddressComponentShortName(item);
                            }                                
                            break;

                        case "country":
                            if(document.getElementById(`${name}_country`))
                                document.getElementById(`${name}_country`).value = AddressLookup.methods.getAddressComponentLongName(item);
                            break;

                        case "postal_code":
                        case "postal_code_prefix":
                            if(document.getElementById(`${name}_postcode`))
                                document.getElementById(`${name}_postcode`).value = AddressLookup.methods.getAddressComponentShortName(item);
                            break;
                    }
                });
            }
        },
        events: {
            initGoogleAddressLookup: function () {
                let lookupFields = document.querySelectorAll('[address-lookup]');
                for(let i = 0; i < lookupFields.length; i++) {
                    searchAddressElement = lookupFields[i];
                    this.initEventListeners(searchAddressElement);
                    searchAddressElement.addEventListener('didLoad', () => {
                        this.initEventListeners(searchAddressElement);
                    });
                }
            },
            initEventListeners: function (field) {
                let name = field.getAttribute('name');
                let setStateInterval = setInterval(() => {
                    let lookupField = field.querySelector('input');
                    if (field.dataset.googlePlacesInitialized === "true") {
                        clearInterval(setStateInterval);
                        return;
                    }

                    if (lookupField && typeof google !== "undefined" && google.maps && google.maps.places) {
                        const canUseNewAutocomplete = typeof google.maps.places.PlaceAutocompleteElement === "function";
                        const existingAutocomplete = field.querySelector('gmp-place-autocomplete');

                        if (!canUseNewAutocomplete) {
                            clearInterval(setStateInterval);
                            return;
                        }

                        if (!existingAutocomplete) {
                            const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});
                            placeAutocomplete.includedRegionCodes = ['au'];
                            placeAutocomplete.placeholder = lookupField.getAttribute('placeholder') || '';

                            lookupField.parentNode.insertBefore(placeAutocomplete, lookupField);
                            AddressLookup.methods.applyPlaceAutocompleteTheme(lookupField, placeAutocomplete);
                            AddressLookup.methods.syncPlaceAutocompleteInput(lookupField, placeAutocomplete);

                            // Keep original field for compatibility with existing form logic.
                            lookupField.style.display = "none";
                            lookupField.setAttribute("aria-hidden", "true");
                            lookupField.tabIndex = -1;

                            placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
                                const place = placePrediction.toPlace();
                                await AddressLookup.methods.fillAddress(place, name);
                                if (place.formattedAddress) {
                                    lookupField.value = place.formattedAddress;
                                    if (placeAutocomplete.inputElement) {
                                        placeAutocomplete.inputElement.value = place.formattedAddress;
                                    }
                                }
                            });
                        }

                        field.dataset.googlePlacesInitialized = "true";

                        clearInterval(setStateInterval);
                    }
                }, 300);
                
            },
        }
    }
})(); 

// Initialize on window load
window.AddressLookup = AddressLookup;

// Set timeout, make sure INS components has been loaded
setTimeout(() => {
    AddressLookup.events.initGoogleAddressLookup();
}, 200);
