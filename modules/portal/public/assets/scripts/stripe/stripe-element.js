let stripeCard = document.getElementById('stripe-card');
let stripeCardModal = document.getElementById('stripe-modal');
let cardOptionsList = document.getElementById('card-options-list');
let noCardNotif = document.getElementById('no-card');
let cardHolder = document.getElementById('add-credit-card-button-holder');
let cardFields = document.getElementById('credit-card-fields');

// Defaul size of the ins-credit-card component once it is created.
// Ecommerce is using different layout size
let cardLayout = 'large-4 medium-12 small-12'; 

// Create an instance of Elements.
let elements = stripe.elements();
let card;
// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
let style = {
    base: {
        color: '#404040',
        fontFamily: '"Work Sans", sans-serif',
        fontWeight: '400',
        fontSize: '14px',
        '::placeholder': {
            color: '#8C94A4'
        }
    },
    invalid: {
        color: '#F27474',
        iconColor: '#F27474'
    }
};
// Handle Form Elements.
let stripeBtn = document.querySelectorAll('.card-form-submit');
let stripeCancelBtn = document.querySelectorAll('.card-form-cancel');
let errorElement = document.getElementById('card-errors');

let StripeElement = (() => {
    return {
        methods: {
            makeCardElement(token) {
                if (cardOptionsList && token) {
                    let grid = cardOptionsList.getAttribute('card-grid') || cardLayout;
                    let divEl = document.createElement("div");
                        divEl.className = `${grid} cell card-options`;
                    let insCardEl = document.createElement("ins-credit-card");
                        insCardEl.setAttribute('full-year', true);
                        insCardEl.setAttribute('brand', token.card.brand);
                        insCardEl.setAttribute('last-four', token.card.last4);
                        insCardEl.setAttribute('expiry-month', token.card.exp_month);
                        insCardEl.setAttribute('expiry-year', token.card.exp_year);
                        insCardEl.setAttribute('compact', '');
                        insCardEl.setAttribute('active', true);
                        insCardEl.value = token.card.id;
                    divEl.appendChild(insCardEl);
                    cardOptionsList.appendChild(divEl);
                    StripeElement.init.dynamicCCEventListener(insCardEl, true);
                    StripeElement.methods.checkCardCount();
                }
            },
            validateStripeRequirements() {
                if (emailField && emailField.value) {
                    this.setButtonLoading(true);
                    this.tokenizedStripeCC();
                } else {
                    App.events.notyf('error', "Email is required.");
                }
            },
            async tokenizedStripeCC() {
                stripe.createToken(card).then(async(result) => {
                    // Step 1: Check if Stripe itself returned an error (e.g. card_declined, invalid_number).
                    // If so, surface the message inline and stop — do not call the backend.
                    if (result.error) {
                        if (errorElement) errorElement.textContent = result.error.message;
                        this.setButtonLoading(false);
                        return;
                    }

                    // Step 2: Stripe confirmed the card — now attempt to save it via the backend.
                    let response = await this.createStripeCardModel(result.token);
                    console.log('createStripeCardModel response:', response);

                    // Step 3: If the backend save failed, surface the error and stop.
                    // Check both response.state AND stripe_card_id — the API can return state: true
                    // with an empty stripe_card_id if Stripe failed silently on the backend.
                    // If the backend returned a stripe_error message, show it inline.
                    if (!response || !response.state || !response.data?.stripe_card_id) {
                        if (errorElement && response?.data?.stripe_error) {
                            errorElement.textContent = response.data.stripe_error;
                        }
                        this.setButtonLoading(false);
                        return;
                    }

                    // Step 4: Card saved successfully — update the UI.
                    this.setStripeCardField(result.token);
                    this.setButtonLoading(false);
                    App.events.notyf('success', "Credit card has been added.");
                    this.makeCardElement(result.token);
                    card.clear();
                    if (errorElement) errorElement.textContent = '';

                    if (stripeCardModal) {
                        stripeCardModal.close();
                    }

                    //toggle guest card form
                    StripeElement.events.toggleGuestCard('add');
                });
            },
            setButtonLoading(state) {
                stripeCancelBtn.forEach(el => {
                    el.disabled = state;
                });
                stripeBtn.forEach(el => {
                    el.loading = state;
                });
            },
            // AXIOS Create credit card model
            async createStripeCardModel(token) {
                let data = {
                    "email": emailField.value,
                    "first_name": stripeFirstName.value,
                    "last_name": stripeLastName.value,
                    "creditcard": token.id,
                    "card_brand": token.card.brand
                }
                let response = await StripeModel.creditcard.createCreditCard(data);
                return response;
                // Insert the token ID into the form checkout - Optional if no element / not checkout form
                if (response.state && payByCardField)
                    payByCardField.setAttribute('value', token.id);
            },
            // Set checkout form with the token ID.
            setStripeCardField(token) {
                // Set token ID into the card field - Optional if no element / not checkout form
                if (payByCardField)
                    payByCardField.setAttribute('value', token.id);
            },
            checkCardCount() {
                let cards = cardFields.querySelectorAll('.card-options');
                if (cards.length <= 0){
                    if(noCardNotif) noCardNotif.classList.remove('hide'); 
                    if(cardHolder) cardHolder.classList.add('hide');
                }
                else{
                    if(noCardNotif) noCardNotif.classList.add('hide');
                    if(cardHolder) cardHolder.classList.remove('hide');  
                }
            }
        },
        events: {
            selectCard(selectedEl) {
                let cards = Array.from(document.getElementsByTagName('ins-credit-card'));
                if (cards) {
                    // remove error state of credit cards
                    cards.forEach(element => {
                        element.classList.remove('is-invalid');
                        element.active = false
                    });
                }
                // set selected state
                selectedEl.active = true;
                if (stripeCard)
                    stripeCard.value = selectedEl.value;
                stripeCard.setAttribute('value', selectedEl.value)
            },
            async removeCard(selectedEl) {
                let confirm = await App.events.swal('warning',
                    'Remove card?',
                    'Are you sure you want to remove this credit card?',
                    'Remove',
                    true,
                    'icon-trash',
                    'remove-card-swal');
                if (confirm) {
                    if (selectedEl.dataset.id) {
                        let response = await StripeModel.creditcard.removeCreditCard(selectedEl.dataset.id);
                        if (response.state && response.data.items) {
                            // API successfully removed card
                        }
                    }
                    if (selectedEl.active && stripeCard)
                        stripeCard.value = "";
                    selectedEl.parentNode.remove();
                    App.events.notyf('success', "Credit card has been removed.");
                    StripeElement.methods.checkCardCount();
                    StripeElement.events.toggleGuestCard('remove');
                }
            },
            toggleGuestCard(state){ 
                if(state === 'remove'){
                    if(cardOptionsList.querySelectorAll('ins-credit-card').length < 1){
                        if(guestAddCardForm){
                            guestAddCardForm.classList.remove("hide");
                        }
                        if (submitButtons) {
                            const btns = submitButtons.querySelectorAll('ins-button'); // selects all descendants
                            btns.forEach(btn => {
                                btn.classList.add('hide');
                            });
                        }
                    }
                }
                else{
                    if(guestAddCardForm){
                        guestAddCardForm.classList.add("hide");
                    }
                    if (submitButtons) {
                        const btns = submitButtons.querySelectorAll('ins-button'); // selects all descendants
                        btns.forEach(btn => {
                            btn.classList.remove('hide');
                        });
                    }
                }
            }
        },
        init: {
            dynamicCCEventListener(element, click = false) {
                setTimeout(() => {
                    element.addEventListener('insClick', () => {
                        StripeElement.events.selectCard(element);
                    });
                    element.addEventListener('insClose', () => {
                        StripeElement.events.removeCard(element);
                    });
                    if (click && element && element.querySelector('.ins-credit-card-wrap'))
                        element.querySelector('.ins-credit-card-wrap').click();
                }, 500);
            },
            resetForm() {
                // Clear the Stripe card element (card number, expiry, CVC)
                card.clear();
                // Clear any inline error message
                if (errorElement) errorElement.textContent = '';
            },
            eventListeners() {
                // Cancel — close modal and reset the card form fields
                stripeCancelBtn.forEach(el => {
                    el.addEventListener('insClick', () => {
                        StripeElement.init.resetForm();
                        stripeCardModal.close();
                    });
                });

                // Reset the form whenever the modal is opened so "Add New" always starts clean
                if (stripeCardModal) {
                    stripeCardModal.addEventListener('insOpen', () => {
                        StripeElement.init.resetForm();
                    });
                }
                // Handle real-time validation errors from the card Element.
                card.on('change', function(event) {
                    if (errorElement && event.error) {
                        errorElement.textContent = event.error.message;
                    } else {
                        errorElement.textContent = '';
                    }
                });
                stripeBtn.forEach(el => {
                    el.addEventListener('insClick', (event) => {
                        //Check if a layout is passed. The layout must be in the following format: 'large-6 medium-4 small-12'.
                        const isValidLayout = /^large-\d+\s+medium-\d+\s+small-\d+$/.test(event.detail.data);
                        cardLayout = isValidLayout? event.detail.data : cardLayout;

                        StripeElement.methods.validateStripeRequirements();
                    });
                })
            },
            stripeElements() {
                // Create an instance of the card Element.
                card = elements.create('card', { style: style });
                // Add an instance of the card Element into the `card-element` <div>.
                card.mount('#card-element');

                // After creating the card element, inject global styles into iframe
                //let iframe = document.querySelector('#card-element iframe');
                //let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                // Create a style element for global styles
                //let globalStyle = iframeDoc.createElement('style');
                //globalStyle.textContent = `
                    //* {
                        //font-weight: 400 !important;
                        //-webkit-font-smoothing: antialiased !important;  /* For Chrome and Safari on macOS */
                        //-moz-osx-font-smoothing: grayscale !important;   /* For Firefox on macOS */
                    //}
                //`;
                //iframeDoc.head.appendChild(globalStyle);
                StripeElement.init.eventListeners();
            }
        }
    }
})();
// Make sure component rendered
setTimeout(() => {
    StripeElement.init.stripeElements();
}, 500);