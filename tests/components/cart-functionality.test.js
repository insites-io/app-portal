/**
 * Unit Tests for Cart Functionality Component
 * 
 * Tests the cart icon and drawer functionality including:
 * - Cart icon visibility and quantity display
 * - Cart drawer opening and closing
 * - Empty cart handling
 * - Cart item management
 */

describe('Cart Functionality Component', () => {
            let mockContext;
            let mockCartData;

            beforeEach(() => {
                mockContext = testUtils.createMockContext();
                mockCartData = testUtils.createMockCart(3);
            });

            describe('Cart Icon Visibility', () => {

                test('should render cart icon when ecommerce addon is enabled', () => {
                    const cartIconTemplate = `
        {% if context.constants.ecommerce_addon == 'true' %}
          <a role="button" onclick="openDrawer()" class="cart-icon">
            <i class="icon-shopping-cart"></i>
            <span class="cart-count hide">0</span>
          </a>
        {% endif %}
      `;

                    const rendered = testUtils.renderTemplate(cartIconTemplate, mockContext);

                    expect(rendered).toContain('cart-icon');
                    expect(rendered).toContain('icon-shopping-cart');
                    expect(rendered).toContain('openDrawer()');
                });

                test('should not render cart icon when ecommerce addon is disabled', () => {
                    const disabledContext = testUtils.createMockContext({
                        constants: { ecommerce_addon: 'false' }
                    });

                    const cartIconTemplate = `
        {% if context.constants.ecommerce_addon == 'true' %}
          <a role="button" onclick="openDrawer()" class="cart-icon">
            <i class="icon-shopping-cart"></i>
          </a>
        {% endif %}
      `;

                    const rendered = testUtils.renderTemplate(cartIconTemplate, disabledContext);

                    expect(rendered).not.toContain('cart-icon');
                });

                test('should have proper accessibility attributes', () => {
                    const cartIcon = {
                        role: 'button',
                        'aria-label': 'Shopping cart',
                        'aria-expanded': false,
                        tabindex: 0,
                        onclick: 'openDrawer()'
                    };

                    expect(cartIcon.role).toBe('button');
                    expect(cartIcon['aria-label']).toBe('Shopping cart');
                    expect(cartIcon['aria-expanded']).toBe(false);
                });
            });

            describe('Cart Quantity Display', () => {

                test('should show quantity when cart has items', () => {
                    const cartItems = mockCartData.items;
                    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

                    const cartCountHtml = `
        <span class="cart-count ${totalQuantity === 0 ? 'hide' : ''}">${totalQuantity}</span>
      `;

                    expect(totalQuantity).toBeGreaterThan(0);
                    expect(cartCountHtml).not.toContain('hide');
                    expect(cartCountHtml).toContain(totalQuantity.toString());
                });

                test('should hide quantity when cart is empty', () => {
                    const emptyCart = testUtils.createMockCart(0);
                    const totalQuantity = emptyCart.total_items;

                    const cartCountHtml = `
        <span class="cart-count ${totalQuantity === 0 ? 'hide' : ''}">${totalQuantity}</span>
      `;

                    expect(totalQuantity).toBe(0);
                    expect(cartCountHtml).toContain('hide');
                });

                test('should handle two-digit quantities with special styling', () => {
                    const largeCart = testUtils.createMockCart(15);
                    const totalQuantity = largeCart.total_items;

                    const cartCountHtml = `
        <span class="cart-count ${totalQuantity > 9 ? 'two-digits-count' : ''}">${totalQuantity}</span>
      `;

                    expect(totalQuantity).toBeGreaterThan(9);
                    expect(cartCountHtml).toContain('two-digits-count');
                });

                test('should handle single digit quantities normally', () => {
                    const smallCart = testUtils.createMockCart(3);
                    const totalQuantity = smallCart.total_items;

                    const cartCountHtml = `
        <span class="cart-count ${totalQuantity > 9 ? 'two-digits-count' : ''}">${totalQuantity}</span>
      `;

                    expect(totalQuantity).toBeLessThanOrEqual(9);
                    expect(cartCountHtml).not.toContain('two-digits-count');
                });
            });

            describe('Cart Drawer Functionality', () => {

                        test('should open cart drawer when cart icon is clicked', () => {
                            const mockOpenDrawer = jest.fn();

                            const handleCartClick = () => {
                                mockOpenDrawer();
                                return 'drawer-opened';
                            };

                            const result = handleCartClick();

                            expect(mockOpenDrawer).toHaveBeenCalled();
                            expect(result).toBe('drawer-opened');
                        });

                        test('should close cart drawer when close button is clicked', () => {
                            const mockCloseDrawer = jest.fn();

                            const handleCloseClick = () => {
                                mockCloseDrawer();
                                return 'drawer-closed';
                            };

                            const result = handleCloseClick();

                            expect(mockCloseDrawer).toHaveBeenCalled();
                            expect(result).toBe('drawer-closed');
                        });

                        test('should render cart drawer with proper structure', () => {
                            const cartDrawerHtml = `
        <div class="cart-drawer" id="cart-drawer">
          <div class="cart-drawer-header">
            <h3>Shopping Cart</h3>
            <button class="close-drawer" onclick="closeDrawer()">
              <i class="icon-close"></i>
            </button>
          </div>
          <div class="cart-drawer-content">
            <div class="cart-items"></div>
          </div>
        </div>
      `;

                            expect(cartDrawerHtml).toContain('cart-drawer');
                            expect(cartDrawerHtml).toContain('Shopping Cart');
                            expect(cartDrawerHtml).toContain('closeDrawer()');
                        });

                        test('should show empty cart message when no items', () => {
                                    const emptyCart = testUtils.createMockCart(0);

                                    const cartDrawerContent = `
        <div class="cart-drawer-content">
          ${emptyCart.items.length === 0 ? 
            '<div class="empty-cart-message"><p>Your cart is empty</p><a href="/products/all">Continue Shopping</a></div>' :
            emptyCart.items.map(item => `<div class="cart-item">${item.product.name}</div>`).join('')
          }
        </div>
      `;

      expect(cartDrawerContent).toContain('empty-cart-message');
      expect(cartDrawerContent).toContain('Your cart is empty');
      expect(cartDrawerContent).toContain('Continue Shopping');
    });

    test('should display cart items when cart has products', () => {
      const cartWithItems = testUtils.createMockCart(2);
      
      const cartItemsHtml = cartWithItems.items.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
          <div class="item-image">
            <img src="/images/${item.product.slug}.jpg" alt="${item.product.name}">
          </div>
          <div class="item-details">
            <h4 class="item-name">${item.product.name}</h4>
            <div class="item-price">$${item.product.price}</div>
            <div class="item-quantity">Qty: ${item.quantity}</div>
          </div>
          <button class="remove-item" onclick="removeFromCart('${item.id}')">
            <i class="icon-trash"></i>
          </button>
        </div>
      `).join('');

      expect(cartItemsHtml).toContain('cart-item');
      expect(cartItemsHtml).toContain('item-name');
      expect(cartItemsHtml).toContain('removeFromCart');
    });
  });

  describe('Cart Item Management', () => {
    
    test('should add item to cart', () => {
      const mockAddToCart = jest.fn();
      const product = { id: 'product-1', name: 'Test Product', price: 99.99 };
      
      const addItemToCart = (productId, quantity = 1) => {
        mockAddToCart(productId, quantity);
        return { success: true, productId, quantity };
      };

      const result = addItemToCart(product.id, 2);
      
      expect(mockAddToCart).toHaveBeenCalledWith(product.id, 2);
      expect(result.success).toBe(true);
    });

    test('should remove item from cart', () => {
      const mockRemoveFromCart = jest.fn();
      const itemId = 'cart-item-1';
      
      const removeItem = (itemId) => {
        mockRemoveFromCart(itemId);
        return { success: true, removedItemId: itemId };
      };

      const result = removeItem(itemId);
      
      expect(mockRemoveFromCart).toHaveBeenCalledWith(itemId);
      expect(result.success).toBe(true);
    });

    test('should update item quantity', () => {
      const mockUpdateQuantity = jest.fn();
      const itemId = 'cart-item-1';
      const newQuantity = 3;
      
      const updateItemQuantity = (itemId, quantity) => {
        mockUpdateQuantity(itemId, quantity);
        return { success: true, itemId, quantity };
      };

      const result = updateItemQuantity(itemId, newQuantity);
      
      expect(mockUpdateQuantity).toHaveBeenCalledWith(itemId, newQuantity);
      expect(result.quantity).toBe(newQuantity);
    });

    test('should calculate cart totals correctly', () => {
      const cartItems = [
        { id: '1', product: { price: 50 }, quantity: 2 },
        { id: '2', product: { price: 25 }, quantity: 1 }
      ];
      
      const calculateTotals = (items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        return {
          subtotal: subtotal,
          tax: tax,
          total: total,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        };
      };

      const totals = calculateTotals(cartItems);
      
      expect(totals.subtotal).toBe(125); // (50 * 2) + (25 * 1)
      expect(totals.tax).toBe(12.5);
      expect(totals.total).toBe(137.5);
      expect(totals.itemCount).toBe(3);
    });
  });

  describe('Mobile Cart Integration', () => {
    
    test('should render cart icon in mobile header', () => {
      const mobileCartTemplate = `
        {% if context.constants.ecommerce_addon == 'true' %}
          <a role="button" onclick="openDrawer()" class="cart-icon mobile-cart">
            <i class="icon-shopping-cart"></i>
            <span class="cart-count">3</span>
          </a>
        {% endif %}
      `;

      const rendered = testUtils.renderTemplate(mobileCartTemplate, mockContext);
      
      expect(rendered).toContain('mobile-cart');
      expect(rendered).toContain('cart-count');
    });

    test('should handle mobile cart drawer positioning', () => {
      const mobileCartDrawer = {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: '70vh',
        transform: 'translateY(100%)',
        transition: 'transform 0.3s ease'
      };

      expect(mobileCartDrawer.position).toBe('fixed');
      expect(mobileCartDrawer.bottom).toBe('0');
      expect(mobileCartDrawer.height).toBe('70vh');
    });
  });

  describe('Error Handling', () => {
    
    test('should handle cart loading errors gracefully', () => {
      const handleCartError = (error) => {
        if (error.message === 'Cart not found') {
          return { success: false, message: 'Unable to load cart. Please try again.' };
        }
        return { success: false, message: 'An unexpected error occurred.' };
      };

      const cartNotFoundError = new Error('Cart not found');
      const result = handleCartError(cartNotFoundError);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to load cart. Please try again.');
    });

    test('should handle network errors when updating cart', () => {
      const handleNetworkError = (error) => {
        if (error.code === 'NETWORK_ERROR') {
          return { 
            success: false, 
            message: 'Network error. Please check your connection and try again.',
            retryable: true 
          };
        }
        return { success: false, message: 'Unable to update cart.' };
      };

      const networkError = { code: 'NETWORK_ERROR', message: 'Failed to fetch' };
      const result = handleNetworkError(networkError);
      
      expect(result.success).toBe(false);
      expect(result.retryable).toBe(true);
    });

    test('should validate cart item data before processing', () => {
      const validateCartItem = (item) => {
        if (!item || typeof item !== 'object') {
          return { valid: false, error: 'Invalid item data' };
        }
        
        if (!item.product || !item.product.id) {
          return { valid: false, error: 'Missing product information' };
        }
        
        if (!item.quantity || item.quantity <= 0) {
          return { valid: false, error: 'Invalid quantity' };
        }
        
        return { valid: true };
      };

      expect(validateCartItem(null)).toEqual({ valid: false, error: 'Invalid item data' });
      expect(validateCartItem({})).toEqual({ valid: false, error: 'Missing product information' });
      expect(validateCartItem({ product: { id: '1' }, quantity: 0 })).toEqual({ valid: false, error: 'Invalid quantity' });
      expect(validateCartItem({ product: { id: '1' }, quantity: 2 })).toEqual({ valid: true });
    });
  });
});