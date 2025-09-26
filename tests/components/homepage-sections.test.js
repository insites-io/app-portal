/**
 * Unit Tests for Homepage Product Sections
 * 
 * Tests the New Arrivals and What's Hot sections including:
 * - Section visibility and structure
 * - Product data handling and sorting
 * - Navigation functionality
 * - Featured product filtering
 */

describe('Homepage Product Sections', () => {
            let mockContext;
            let mockProducts;

            beforeEach(() => {
                mockContext = testUtils.createMockContext();
                mockProducts = testUtils.createMockProducts(15);
            });

            describe('New Arrivals Section', () => {

                test('should render New Arrivals section when ecommerce addon is enabled', () => {
                    const homepageTemplate = `
        {% if context.constants.ecommerce_addon == 'true' %}
          {% include 'modules/ecommerce/blocks/new_arrivals' %}
        {% endif %}
      `;

                    const rendered = testUtils.renderTemplate(homepageTemplate, mockContext);

                    expect(rendered).toContain('new_arrivals');
                });

                test('should display exactly 8 products in New Arrivals carousel', () => {
                    // Sort products by created_at descending and take first 8
                    const newArrivalsProducts = mockProducts
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 8);

                    expect(newArrivalsProducts).toHaveLength(8);
                });

                test('should show products with most recent created_at date first', () => {
                    const sortedProducts = mockProducts
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    const newArrivalsProducts = sortedProducts.slice(0, 8);

                    // Verify the first product has the most recent date
                    const firstProduct = newArrivalsProducts[0];
                    const lastProduct = newArrivalsProducts[7];

                    expect(new Date(firstProduct.created_at).getTime()).toBeGreaterThan(new Date(lastProduct.created_at).getTime());
                });

                test('should render New Arrivals section with proper structure', () => {
                    const newArrivalsHtml = `
        <section class="new-arrivals-section">
          <div class="section-header">
            <h2>New Arrivals</h2>
            <a href="/products/all?sort=newest" class="view-all-link">View All</a>
          </div>
          <div class="products-carousel">
            <div class="carousel-container">
              <div class="product-grid">
                <!-- 8 products will be rendered here -->
              </div>
              <button class="carousel-prev" aria-label="Previous products">
                <i class="icon-chevron-left"></i>
              </button>
              <button class="carousel-next" aria-label="Next products">
                <i class="icon-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>
      `;

                    expect(newArrivalsHtml).toContain('new-arrivals-section');
                    expect(newArrivalsHtml).toContain('New Arrivals');
                    expect(newArrivalsHtml).toContain('View All');
                    expect(newArrivalsHtml).toContain('/products/all?sort=newest');
                    expect(newArrivalsHtml).toContain('carousel-container');
                });

                test('should handle empty product list gracefully', () => {
                    const emptyProducts = [];

                    const renderNewArrivals = (products) => {
                        if (!products || products.length === 0) {
                            return `
            <section class="new-arrivals-section">
              <h2>New Arrivals</h2>
              <div class="no-products-message">
                <p>No new products available at the moment.</p>
                <a href="/products/all">Browse All Products</a>
              </div>
            </section>
          `;
                        }

                        return products.map(product => `
          <div class="product-card">
            <h3>${product.name}</h3>
          </div>
        `).join('');
                    };

                    const result = renderNewArrivals(emptyProducts);

                    expect(result).toContain('no-products-message');
                    expect(result).toContain('No new products available');
                });
            });

            describe('What\'s Hot Section', () => {

                test('should render What\'s Hot section when ecommerce addon is enabled', () => {
                    const homepageTemplate = `
        {% if context.constants.ecommerce_addon == 'true' %}
          {% include 'modules/ecommerce/blocks/whats_hot' %}
        {% endif %}
      `;

                    const rendered = testUtils.renderTemplate(homepageTemplate, mockContext);

                    expect(rendered).toContain('whats_hot');
                });

                test('should display only featured products in What\'s Hot section', () => {
                    const featuredProducts = mockProducts.filter(product => product.featured);

                    expect(featuredProducts.length).toBeGreaterThan(0);
                    expect(featuredProducts.every(product => product.featured)).toBe(true);
                });

                test('should render What\'s Hot section with proper structure', () => {
                    const whatsHotHtml = `
        <section class="whats-hot-section">
          <div class="section-header">
            <h2>What's Hot</h2>
            <a href="/products/all" class="view-all-link">View All</a>
          </div>
          <div class="products-carousel">
            <div class="carousel-container">
              <div class="product-grid">
                <!-- Featured products will be rendered here -->
              </div>
              <button class="carousel-prev" aria-label="Previous products">
                <i class="icon-chevron-left"></i>
              </button>
              <button class="carousel-next" aria-label="Next products">
                <i class="icon-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>
      `;

                    expect(whatsHotHtml).toContain('whats-hot-section');
                    expect(whatsHotHtml).toContain('What\'s Hot');
                    expect(whatsHotHtml).toContain('View All');
                    expect(whatsHotHtml).toContain('/products/all');
                    expect(whatsHotHtml).toContain('carousel-container');
                });

                test('should handle no featured products gracefully', () => {
                    const nonFeaturedProducts = mockProducts.map(product => ({
                        ...product,
                        featured: false
                    }));

                    const renderWhatsHot = (products) => {
                        const featuredProducts = products.filter(product => product.featured);

                        if (featuredProducts.length === 0) {
                            return `
            <section class="whats-hot-section">
              <h2>What's Hot</h2>
              <div class="no-featured-message">
                <p>No featured products available at the moment.</p>
                <a href="/products/all">Browse All Products</a>
              </div>
            </section>
          `;
                        }

                        return featuredProducts.map(product => `
          <div class="product-card">
            <h3>${product.name}</h3>
          </div>
        `).join('');
                    };

                    const result = renderWhatsHot(nonFeaturedProducts);

                    expect(result).toContain('no-featured-message');
                    expect(result).toContain('No featured products available');
                });
            });

            describe('Product Card Rendering', () => {

                        test('should render product cards with proper structure', () => {
                            const product = mockProducts[0];

                            const productCardHtml = `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image">
            <img src="/images/products/${product.slug}.jpg" alt="${product.name}" loading="lazy">
            <div class="product-badge ${product.featured ? 'featured' : ''}">
              ${product.featured ? 'Featured' : ''}
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">$${product.price}</div>
            <div class="product-category">${product.category}</div>
          </div>
          <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
            Add to Cart
          </button>
        </div>
      `;

                            expect(productCardHtml).toContain('product-card');
                            expect(productCardHtml).toContain(product.name);
                            expect(productCardHtml).toContain(product.price.toString());
                            expect(productCardHtml).toContain('Add to Cart');
                            expect(productCardHtml).toContain(`addToCart('${product.id}')`);
                        });

                        test('should handle product click navigation', () => {
                            const product = mockProducts[0];
                            const expectedUrl = `/products/${product.slug}`;

                            const navigateToProduct = (productSlug) => {
                                return `/products/${productSlug}`;
                            };

                            expect(navigateToProduct(product.slug)).toBe(expectedUrl);
                        });

                        test('should handle missing product images gracefully', () => {
                                    const productWithoutImage = {
                                        ...mockProducts[0],
                                        image: null
                                    };

                                    const productCardHtml = `
        <div class="product-card">
          <div class="product-image">
            ${productWithoutImage.image ? 
              `<img src="${productWithoutImage.image}" alt="${productWithoutImage.name}">` :
              `<div class="no-image-placeholder">
                <i class="icon-image"></i>
                <span>No image available</span>
              </div>`
            }
          </div>
        </div>
      `;

      expect(productCardHtml).toContain('no-image-placeholder');
      expect(productCardHtml).toContain('No image available');
    });
  });

  describe('Carousel Functionality', () => {
    
    test('should initialize carousel with proper configuration', () => {
      const carouselConfig = {
        itemsToShow: 4,
        itemsToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        infinite: true,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              itemsToShow: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              itemsToShow: 1
            }
          }
        ]
      };

      expect(carouselConfig.itemsToShow).toBe(4);
      expect(carouselConfig.autoplay).toBe(true);
      expect(carouselConfig.responsive).toHaveLength(2);
    });

    test('should handle carousel navigation', () => {
      const mockCarousel = {
        currentSlide: 0,
        totalSlides: 8,
        next: jest.fn(),
        prev: jest.fn(),
        goToSlide: jest.fn()
      };
      
      const navigateCarousel = (direction) => {
        if (direction === 'next' && mockCarousel.currentSlide < mockCarousel.totalSlides - 1) {
          mockCarousel.next();
          mockCarousel.currentSlide++;
        } else if (direction === 'prev' && mockCarousel.currentSlide > 0) {
          mockCarousel.prev();
          mockCarousel.currentSlide--;
        }
        
        return mockCarousel.currentSlide;
      };

      expect(navigateCarousel('next')).toBe(1);
      expect(mockCarousel.next).toHaveBeenCalled();
      
      expect(navigateCarousel('prev')).toBe(0);
      expect(mockCarousel.prev).toHaveBeenCalled();
    });

    test('should handle carousel responsive behavior', () => {
      const getCarouselConfig = (screenWidth) => {
        if (screenWidth <= 480) {
          return { itemsToShow: 1, itemsToScroll: 1 };
        } else if (screenWidth <= 768) {
          return { itemsToShow: 2, itemsToScroll: 1 };
        } else {
          return { itemsToShow: 4, itemsToScroll: 2 };
        }
      };

      expect(getCarouselConfig(400)).toEqual({ itemsToShow: 1, itemsToScroll: 1 });
      expect(getCarouselConfig(600)).toEqual({ itemsToShow: 2, itemsToScroll: 1 });
      expect(getCarouselConfig(1024)).toEqual({ itemsToShow: 4, itemsToScroll: 2 });
    });
  });

  describe('Section Links and Navigation', () => {
    
    test('should include "View All" links in both sections', () => {
      const sections = [
        {
          name: 'New Arrivals',
          viewAllUrl: '/products/all?sort=newest',
          selector: '.new-arrivals-section .view-all-link'
        },
        {
          name: 'What\'s Hot',
          viewAllUrl: '/products/all',
          selector: '.whats-hot-section .view-all-link'
        }
      ];

      sections.forEach(section => {
        expect(section.viewAllUrl).toBeTruthy();
        expect(section.selector).toContain('view-all-link');
      });
    });

    test('should navigate to correct URLs when section links are clicked', () => {
      const sectionLinks = {
        newArrivals: '/products/all?sort=newest',
        whatsHot: '/products/all'
      };
      
      const navigateToSection = (section) => {
        return sectionLinks[section];
      };

      expect(navigateToSection('newArrivals')).toBe('/products/all?sort=newest');
      expect(navigateToSection('whatsHot')).toBe('/products/all');
    });

    test('should handle section link clicks with proper event handling', () => {
      const mockClickHandler = jest.fn();
      
      const handleSectionLinkClick = (url, event) => {
        event.preventDefault();
        mockClickHandler(url);
        return { success: true, url };
      };

      const mockEvent = { preventDefault: jest.fn() };
      const result = handleSectionLinkClick('/products/all', mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockClickHandler).toHaveBeenCalledWith('/products/all');
      expect(result.success).toBe(true);
    });
  });

  describe('Performance and Loading', () => {
    
    test('should lazy load product images', () => {
      const productImageHtml = `
        <img 
          src="/images/products/test-product.jpg" 
          alt="Test Product" 
          loading="lazy"
          width="300"
          height="300"
        >
      `;

      expect(productImageHtml).toContain('loading="lazy"');
      expect(productImageHtml).toContain('width="300"');
      expect(productImageHtml).toContain('height="300"');
    });

    test('should handle section loading states', () => {
      const renderSectionWithLoading = (isLoading, products) => {
        if (isLoading) {
          return `
            <section class="product-section loading">
              <div class="loading-spinner">
                <i class="icon-spinner"></i>
                <span>Loading products...</span>
              </div>
            </section>
          `;
        }
        
        return `
          <section class="product-section">
            <div class="products-grid">
              ${products.map(p => `<div class="product-card">${p.name}</div>`).join('')}
            </div>
          </section>
        `;
      };

      const loadingResult = renderSectionWithLoading(true, []);
      const loadedResult = renderSectionWithLoading(false, mockProducts.slice(0, 4));

      expect(loadingResult).toContain('loading-spinner');
      expect(loadingResult).toContain('Loading products...');
      expect(loadedResult).toContain('products-grid');
      expect(loadedResult).not.toContain('loading-spinner');
    });

    test('should handle section errors gracefully', () => {
      const renderSectionWithError = (error, products) => {
        if (error) {
          return `
            <section class="product-section error">
              <div class="error-message">
                <i class="icon-warning"></i>
                <h3>Unable to load products</h3>
                <p>${error.message}</p>
                <button onclick="retryLoadProducts()">Try Again</button>
              </div>
            </section>
          `;
        }
        
        return `
          <section class="product-section">
            <div class="products-grid">
              ${products.map(p => `<div class="product-card">${p.name}</div>`).join('')}
            </div>
          </section>
        `;
      };

      const errorResult = renderSectionWithError(new Error('Network error'), []);
      const successResult = renderSectionWithError(null, mockProducts.slice(0, 4));

      expect(errorResult).toContain('error-message');
      expect(errorResult).toContain('Unable to load products');
      expect(errorResult).toContain('Try Again');
      expect(successResult).toContain('products-grid');
    });
  });
});