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
            createAutocompleteDropdown(lookupField) {
                const parent = lookupField.parentElement;
                if (!parent) return null;

                let dropdown = parent.querySelector(".ins-address-lookup-dropdown");
                if (dropdown) return dropdown;

                if (window.getComputedStyle(parent).position === "static") {
                    parent.style.position = "relative";
                }

                dropdown = document.createElement("div");
                dropdown.className = "ins-address-lookup-dropdown";
                parent.appendChild(dropdown);
                return dropdown;
            },
            closeAutocompleteDropdown(dropdown) {
                if (!dropdown) return;
                dropdown.innerHTML = "";
                dropdown.classList.remove("is-open");
                dropdown.dataset.activeIndex = "-1";
            },
            setActiveSuggestion(dropdown, activeIndex) {
                const items = Array.from(dropdown.querySelectorAll(".ins-address-lookup-item"));
                items.forEach((item, idx) => {
                    item.classList.toggle("is-active", idx === activeIndex);
                });
                dropdown.dataset.activeIndex = String(activeIndex);
            },
            renderAutocompleteSuggestions(dropdown, suggestions, onSelect) {
                if (!dropdown) return;

                dropdown.innerHTML = "";
                dropdown.dataset.activeIndex = "-1";

                if (!suggestions || !suggestions.length) {
                    this.closeAutocompleteDropdown(dropdown);
                    return;
                }

                suggestions.forEach((suggestion, index) => {
                    const item = document.createElement("button");
                    item.type = "button";
                    item.className = "ins-address-lookup-item";

                    const label = suggestion.placePrediction && suggestion.placePrediction.text
                        ? suggestion.placePrediction.text.text
                        : "";
                    item.textContent = label;
                    item.dataset.index = String(index);

                    item.addEventListener("mouseenter", () => {
                        AddressLookup.methods.setActiveSuggestion(dropdown, index);
                    });

                    item.addEventListener("mousedown", event => {
                        event.preventDefault();
                    });

                    item.addEventListener("click", async () => {
                        await onSelect(suggestion);
                    });

                    dropdown.appendChild(item);
                });

                dropdown.classList.add("is-open");
            },
            async initPlacesNewAutocompleteOnInput(lookupField, name, field) {
                const places = google.maps.places;
                if (!places || !places.AutocompleteSuggestion || !places.AutocompleteSessionToken) {
                    return false;
                }

                const dropdown = this.createAutocompleteDropdown(lookupField);
                if (!dropdown) return false;

                let suggestions = [];
                let debounceTimer = null;
                let blurTimer = null;
                let sessionToken = new places.AutocompleteSessionToken();

                // Per-input region override via `address-lookup-regions` attribute on the host field:
                //   absent             → defaults to "au" (preserves prior behaviour for sign-up/checkout/billing forms)
                //   "*"                → no region restriction (worldwide; used by the locator search)
                //   "au,nz" (csv list) → ISO-2 region codes passed to Places
                const regionAttr = (field.getAttribute('address-lookup-regions') || 'au').trim().toLowerCase();
                const regionCodes = regionAttr === '*'
                    ? null
                    : regionAttr.split(',').map(s => s.trim()).filter(Boolean);

                const fetchSuggestions = async value => {
                    const request = {
                        input: value,
                        sessionToken
                    };
                    if (regionCodes && regionCodes.length) {
                        request.includedRegionCodes = regionCodes;
                    }
                    const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
                    return response && response.suggestions ? response.suggestions : [];
                };

                const onSelectSuggestion = async suggestion => {
                    const place = suggestion.placePrediction.toPlace();
                    await AddressLookup.methods.fillAddress(place, name);

                    const fallbackText = suggestion.placePrediction && suggestion.placePrediction.text
                        ? suggestion.placePrediction.text.text
                        : lookupField.value;
                    lookupField.value = place.formattedAddress || fallbackText;
                    AddressLookup.methods.closeAutocompleteDropdown(dropdown);
                    sessionToken = new places.AutocompleteSessionToken();
                };

                lookupField.addEventListener("input", () => {
                    const value = lookupField.value ? lookupField.value.trim() : "";
                    if (!value) {
                        suggestions = [];
                        AddressLookup.methods.closeAutocompleteDropdown(dropdown);
                        return;
                    }

                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async () => {
                        try {
                            suggestions = await fetchSuggestions(value);
                            AddressLookup.methods.renderAutocompleteSuggestions(dropdown, suggestions, onSelectSuggestion);
                        } catch (error) {
                            AddressLookup.methods.closeAutocompleteDropdown(dropdown);
                        }
                    }, 180);
                });

                lookupField.addEventListener("keydown", async event => {
                    if (!suggestions.length || !dropdown.classList.contains("is-open")) return;

                    const items = Array.from(dropdown.querySelectorAll(".ins-address-lookup-item"));
                    let activeIndex = parseInt(dropdown.dataset.activeIndex || "-1", 10);

                    if (event.key === "ArrowDown") {
                        event.preventDefault();
                        activeIndex = (activeIndex + 1) % items.length;
                    } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        activeIndex = (activeIndex - 1 + items.length) % items.length;
                    } else if (event.key === "Enter") {
                        if (activeIndex >= 0 && activeIndex < suggestions.length) {
                            event.preventDefault();
                            await onSelectSuggestion(suggestions[activeIndex]);
                        }
                        return;
                    } else if (event.key === "Escape") {
                        AddressLookup.methods.closeAutocompleteDropdown(dropdown);
                        return;
                    } else {
                        return;
                    }

                    AddressLookup.methods.setActiveSuggestion(dropdown, activeIndex);
                });

                lookupField.addEventListener("blur", () => {
                    blurTimer = setTimeout(() => {
                        AddressLookup.methods.closeAutocompleteDropdown(dropdown);
                    }, 120);
                });

                lookupField.addEventListener("focus", () => {
                    clearTimeout(blurTimer);
                    if (dropdown.children.length) {
                        dropdown.classList.add("is-open");
                    }
                });

                document.addEventListener("click", event => {
                    if (!field.contains(event.target)) {
                        AddressLookup.methods.closeAutocompleteDropdown(dropdown);
                    }
                });

                field.dataset.googlePlacesInitialized = "true";
                return true;
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
                        AddressLookup.methods.initPlacesNewAutocompleteOnInput(lookupField, name, field)
                            .finally(() => {
                                clearInterval(setStateInterval);
                            });
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
