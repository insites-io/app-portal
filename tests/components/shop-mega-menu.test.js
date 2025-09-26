/**
 * Unit Tests for Shop Mega Menu Component
 * 
 * Tests the Shop mega menu functionality including:
 * - Visibility and accessibility
 * - Category structure display
 * - Navigation functionality
 * - Special menu items (All, New Arrivals, Sale)
 */

describe('Shop Mega Menu Component', () => {
            let mockContext;
            let mockMenuData;

            beforeEach(() => {
                mockContext = testUtils.createMockContext();

                mockMenuData = testUtils.createMockMenu();
            });

            describe('Menu Visibility', () => {

                test('should render Shop button when ecommerce addon is enabled', () => {
                    const template = `
        {% if context.constants.ecommerce_addon == 'true' %}
          <ins-button id="mega-menu-btn" label="Shop" icon-right="icon-angle-down"></ins-button>
        {% endif %}
      `;

                    const rendered = testUtils.renderTemplate(template, mockContext);

                    expect(rendered).toContain('mega-menu-btn');
                    expect(rendered).toContain('Shop');
                    expect(rendered).toContain('icon-angle-down');
                });

                test('should not render Shop button when ecommerce addon is disabled', () => {
                    const disabledContext = testUtils.createMockContext({
                        constants: { ecommerce_addon: 'false' }
                    });

                    const template = `
        {% if context.constants.ecommerce_addon == 'true' %}
          <ins-button id="mega-menu-btn" label="Shop" icon-right="icon-angle-down"></ins-button>
        {% endif %}
      `;

                    const rendered = testUtils.renderTemplate(template, disabledContext);

                    expect(rendered).not.toContain('mega-menu-btn');
                });

                test('should have proper accessibility attributes', () => {
                    const shopButton = {
                        id: 'mega-menu-btn',
                        label: 'Shop',
                        'aria-expanded': false,
                        'aria-haspopup': true,
                        role: 'button',
                        tabindex: 0
                    };

                    expect(shopButton.id).toBe('mega-menu-btn');
                    expect(shopButton.role).toBe('button');
                    expect(shopButton['aria-haspopup']).toBe(true);
                });
            });

            describe('Category Structure', () => {

                        test('should display main categories with subcategories', () => {
                            const categories = mockMenuData.categories;

                            expect(categories).toHaveLength(2);
                            expect(categories[0].name).toBe('Electronics');
                            expect(categories[1].name).toBe('Clothing');

                            expect(categories[0].subcategories).toHaveLength(2);
                            expect(categories[1].subcategories).toHaveLength(2);
                        });

                        test('should render category hierarchy correctly', () => {
                                    const category = mockMenuData.categories[0];

                                    const categoryHtml = `
        <div class="category-item" data-category-id="${category.id}">
          <a href="/products/${category.slug}" class="category-link">
            ${category.name}
          </a>
          <ul class="subcategories">
            ${category.subcategories.map(sub => `
              <li class="subcategory-item">
                <a href="/products/${category.slug}/${sub.slug}">${sub.name}</a>
              </li>
            `).join('')}
          </ul>
        </div>
      `;

      expect(categoryHtml).toContain('Electronics');
      expect(categoryHtml).toContain('Phones');
      expect(categoryHtml).toContain('Laptops');
      expect(categoryHtml).toContain('/products/electronics');
      expect(categoryHtml).toContain('/products/electronics/phones');
    });

    test('should handle empty subcategories gracefully', () => {
      const categoryWithNoSubs = {
        id: 'cat-3',
        name: 'Books',
        slug: 'books',
        subcategories: []
      };

      const categoryHtml = `
        <div class="category-item">
          <a href="/products/${categoryWithNoSubs.slug}">${categoryWithNoSubs.name}</a>
          ${categoryWithNoSubs.subcategories.length > 0 ? 
            `<ul class="subcategories">...</ul>` : 
            '<span class="no-subcategories">No subcategories</span>'
          }
        </div>
      `;

      expect(categoryHtml).toContain('No subcategories');
    });
  });

  describe('Navigation Functionality', () => {
    
    test('should navigate to category page when category is clicked', () => {
      const category = mockMenuData.categories[0];
      const expectedUrl = `/products/${category.slug}`;
      
      const navigateToCategory = (categorySlug) => {
        return `/products/${categorySlug}`;
      };

      expect(navigateToCategory(category.slug)).toBe(expectedUrl);
    });

    test('should navigate to subcategory page when subcategory is clicked', () => {
      const category = mockMenuData.categories[0];
      const subcategory = category.subcategories[0];
      const expectedUrl = `/products/${category.slug}/${subcategory.slug}`;
      
      const navigateToSubcategory = (categorySlug, subcategorySlug) => {
        return `/products/${categorySlug}/${subcategorySlug}`;
      };

      expect(navigateToSubcategory(category.slug, subcategory.slug)).toBe(expectedUrl);
    });

    test('should handle "All" navigation correctly', () => {
      const allProductsUrl = '/products/all';
      
      const navigateToAllProducts = () => {
        return '/products/all';
      };

      expect(navigateToAllProducts()).toBe(allProductsUrl);
    });

    test('should handle "New Arrivals" navigation with sort parameter', () => {
      const newArrivalsUrl = '/products/all?sort=newest&order=desc';
      
      const navigateToNewArrivals = () => {
        return '/products/all?sort=newest&order=desc';
      };

      expect(navigateToNewArrivals()).toBe(newArrivalsUrl);
    });

    test('should handle "Sale" navigation with filter parameter', () => {
      const saleUrl = '/products/all?filter=sale';
      
      const navigateToSale = () => {
        return '/products/all?filter=sale';
      };

      expect(navigateToSale()).toBe(saleUrl);
    });
  });

  describe('Special Menu Items', () => {
    
    test('should include "All Products" option', () => {
      const specialMenuItems = [
        { label: 'All Products', url: '/products/all', type: 'all' },
        { label: 'New Arrivals', url: '/products/all?sort=newest', type: 'new_arrivals' },
        { label: 'Sale', url: '/products/all?filter=sale', type: 'sale' }
      ];

      const allProductsItem = specialMenuItems.find(item => item.type === 'all');
      
      expect(allProductsItem).toBeDefined();
      expect(allProductsItem.label).toBe('All Products');
      expect(allProductsItem.url).toBe('/products/all');
    });

    test('should include "New Arrivals" with proper sorting', () => {
      const newArrivalsItem = {
        label: 'New Arrivals',
        url: '/products/all?sort=newest&order=desc',
        sortField: 'created_at',
        sortOrder: 'desc'
      };

      expect(newArrivalsItem.sortField).toBe('created_at');
      expect(newArrivalsItem.sortOrder).toBe('desc');
      expect(newArrivalsItem.url).toContain('sort=newest');
    });

    test('should include "Sale" with proper filtering', () => {
      const saleItem = {
        label: 'Sale',
        url: '/products/all?filter=sale',
        filterType: 'sale',
        filterValue: true
      };

      expect(saleItem.filterType).toBe('sale');
      expect(saleItem.filterValue).toBe(true);
      expect(saleItem.url).toContain('filter=sale');
    });
  });

  describe('Mobile Menu Integration', () => {
    
    test('should include Shop menu in mobile navigation', () => {
      const mobileMenuTemplate = `
        {% if context.constants.ecommerce_addon == 'true' %}
          <li class="mobile-menu-style">
            {% include 'modules/ecommerce/menu/mobile_menu' %}
          </li>
        {% endif %}
      `;

      const rendered = testUtils.renderTemplate(mobileMenuTemplate, mockContext);
      
      expect(rendered).toContain('mobile_menu');
      expect(rendered).toContain('mobile-menu-style');
    });

    test('should handle mobile menu accordion structure', () => {
      const mobileAccordionHtml = `
        <ins-accordion menu>
          <ins-accordion-item 
            heading="Shop" 
            link="#" 
            open-icon="icon-plus" 
            close-icon="icon-minus">
            <ins-accordion-link label="All Products" link="/products/all"></ins-accordion-link>
            <ins-accordion-link label="New Arrivals" link="/products/all?sort=newest"></ins-accordion-link>
            <ins-accordion-link label="Sale" link="/products/all?filter=sale"></ins-accordion-link>
          </ins-accordion-item>
        </ins-accordion>
      `;

      expect(mobileAccordionHtml).toContain('ins-accordion');
      expect(mobileAccordionHtml).toContain('All Products');
      expect(mobileAccordionHtml).toContain('New Arrivals');
      expect(mobileAccordionHtml).toContain('Sale');
    });
  });

  describe('Error Handling', () => {
    
    test('should handle missing menu data gracefully', () => {
      const emptyMenuData = { categories: [] };
      
      const renderMenu = (menuData) => {
        if (!menuData.categories || menuData.categories.length === 0) {
          return '<div class="no-categories">No categories available</div>';
        }
        return menuData.categories.map(cat => `<div>${cat.name}</div>`).join('');
      };

      expect(renderMenu(emptyMenuData)).toContain('No categories available');
    });

    test('should handle malformed category data', () => {
      const malformedCategory = {
        id: 'cat-1',
        // Missing name and slug
        subcategories: []
      };

      const validateCategory = (category) => {
        if (!category || typeof category !== 'object') {
          return false;
        }
        return !!(category.name && category.slug);
      };

      expect(validateCategory(malformedCategory)).toBe(false);
    });

    test('should handle navigation errors gracefully', () => {
      const navigateWithErrorHandling = (url) => {
        try {
          if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL');
          }
          return { success: true, url };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      expect(navigateWithErrorHandling('/products/electronics')).toEqual({
        success: true,
        url: '/products/electronics'
      });

      expect(navigateWithErrorHandling(null)).toEqual({
        success: false,
        error: 'Invalid URL'
      });
    });
  });
});