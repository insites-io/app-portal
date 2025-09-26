/**
 * Jest Setup File for Ecommerce Tests
 * 
 * This file sets up the testing environment and provides
 * global utilities for testing the ecommerce functionality.
 */

// Mock DOM APIs that might be used in the application
global.ResizeObserver = class ResizeObserver {
    constructor(cb) {
        this.cb = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Mock fetch API for GraphQL requests
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
};

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock console methods to avoid noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Global test utilities
global.testUtils = {
    /**
     * Mock Liquid template context
     */
    createMockContext: (overrides = {}) => ({
        constants: {
            ecommerce_addon: 'true',
            events_addon: 'false',
            ...overrides.constants
        },
        current_user: {
            id: 'test-user-123',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            ...overrides.current_user
        },
        device: {
            device_type: 'desktop',
            ...overrides.device
        },
        environment: 'test',
        params: {},
        ...overrides
    }),

    /**
     * Mock product data
     */
    createMockProducts: (count = 10) => {
        return Array(count).fill().map((_, i) => ({
            id: `product-${i + 1}`,
            name: `Product ${i + 1}`,
            slug: `product-${i + 1}`,
            created_at: new Date(Date.now() - i * 86400000).toISOString(),
            featured: i < 3, // First 3 products are featured
            price: 99.99 + (i * 10),
            category: i % 2 === 0 ? 'electronics' : 'clothing'
        }));
    },

    /**
     * Mock cart data
     */
    createMockCart: (itemCount = 0) => {
        const items = Array(itemCount).fill().map((_, i) => ({
            id: `cart-item-${i + 1}`,
            product_id: `product-${i + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            product: {
                name: `Product ${i + 1}`,
                price: 99.99
            }
        }));

        return {
            id: 'cart-123',
            items: items,
            total_items: items.reduce((sum, item) => sum + item.quantity, 0),
            total_price: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        };
    },

    /**
     * Mock menu data
     */
    createMockMenu: () => ({
        categories: [{
                id: 'cat-1',
                name: 'Electronics',
                slug: 'electronics',
                subcategories: [
                    { id: 'sub-1', name: 'Phones', slug: 'phones' },
                    { id: 'sub-2', name: 'Laptops', slug: 'laptops' }
                ]
            },
            {
                id: 'cat-2',
                name: 'Clothing',
                slug: 'clothing',
                subcategories: [
                    { id: 'sub-3', name: 'Men', slug: 'men' },
                    { id: 'sub-4', name: 'Women', slug: 'women' }
                ]
            }
        ]
    }),

    /**
     * Simulate Liquid template rendering
     */
    renderTemplate: (template, context = {}) => {
        // This is a simplified simulation of Liquid template rendering
        // In a real implementation, you might use a Liquid parser
        let rendered = template;

        // Replace basic Liquid syntax
        rendered = rendered.replace(/\{\%\s*if\s+([^%]+)\s*\%\}([\s\S]*?)\{\%\s*endif\s*\%\}/g, (match, condition, content) => {
            // Simple condition evaluation
            if (condition.includes('ecommerce_addon') && context.constants && context.constants.ecommerce_addon === 'true') {
                return content;
            }
            return '';
        });

        rendered = rendered.replace(/\{\%\s*comment\s*\%\}[\s\S]*?\{\%\s*endcomment\s*\%\}/g, '');

        return rendered;
    },

    /**
     * Mock GraphQL response
     */
    mockGraphQLResponse: (data) => ({
        data: data,
        loading: false,
        error: null
    }),

    /**
     * Wait for async operations
     */
    waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};

// Setup fetch mock responses
beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});