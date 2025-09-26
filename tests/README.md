# Ecommerce Functionality Unit Tests

This directory contains comprehensive unit tests for the ecommerce functionality of the Insites CMS-based client portal application.

## Overview

The test suite covers all the specified test criteria for the ecommerce functionality, including:

- **Shop Mega Menu**: Visibility, accessibility, category structure, and navigation
- **Cart Functionality**: Icon display, quantity indication, drawer functionality
- **Homepage Sections**: New Arrivals and What's Hot product displays
- **Navigation**: Product list pages, filtering, and sorting

## Test Structure

### Main Test Files

#### `ecommerce-functionality.test.js`
Main test file containing comprehensive tests for all ecommerce functionality. This file includes:

- Shop mega menu tests (visibility, categories, navigation)
- Cart functionality tests (icon, drawer, quantity display)
- Homepage section tests (New Arrivals, What's Hot)
- Navigation and routing tests
- Mobile menu integration tests
- Error handling tests

#### Component-Specific Test Files

##### `components/shop-mega-menu.test.js`
Focused tests for the Shop mega menu component:

- **Menu Visibility**: Tests for conditional rendering based on ecommerce addon
- **Category Structure**: Tests for main categories and subcategories display
- **Navigation Functionality**: Tests for category and subcategory navigation
- **Special Menu Items**: Tests for "All", "New Arrivals", and "Sale" options
- **Mobile Menu Integration**: Tests for mobile-specific menu behavior
- **Error Handling**: Tests for graceful handling of missing data

##### `components/cart-functionality.test.js`
Focused tests for the cart icon and drawer functionality:

- **Cart Icon Visibility**: Tests for conditional rendering and accessibility
- **Cart Quantity Display**: Tests for quantity indication and styling
- **Cart Drawer Functionality**: Tests for opening/closing and content display
- **Cart Item Management**: Tests for adding, removing, and updating items
- **Mobile Cart Integration**: Tests for mobile-specific cart behavior
- **Error Handling**: Tests for cart loading and network errors

##### `components/homepage-sections.test.js`
Focused tests for the homepage product sections:

- **New Arrivals Section**: Tests for 8-product display and date sorting
- **What's Hot Section**: Tests for featured product filtering
- **Product Card Rendering**: Tests for product display structure
- **Carousel Functionality**: Tests for carousel behavior and responsiveness
- **Section Links**: Tests for navigation links and event handling
- **Performance**: Tests for lazy loading and error states

## Test Criteria Coverage

### ✅ Shop Mega Menu Tests

1. **Visibility and Accessibility**
   - Shop mega menu is visible when ecommerce addon is enabled
   - Proper accessibility attributes (ARIA labels, roles)
   - Hidden when ecommerce addon is disabled

2. **Category Structure**
   - Displays available categories and subcategories
   - Handles nested subcategory structure
   - Graceful handling of empty categories

3. **Navigation**
   - Category clicks navigate to Product List Page
   - "All" selection navigates to all products
   - "New Arrivals" navigates with newest sort
   - "Sale" navigates with sale filter

4. **Footer Integration**
   - Shop link visible in footer
   - Navigates to all products page

### ✅ Cart Functionality Tests

1. **Cart Icon**
   - Visible and accessible from header
   - Shows quantity when items are present
   - Hides quantity when cart is empty
   - Handles two-digit quantities with special styling

2. **Cart Drawer**
   - Opens when cart icon is clicked
   - Shows empty cart message when empty
   - Displays cart items when populated
   - Proper close functionality

### ✅ Homepage Sections Tests

1. **New Arrivals Section**
   - Displays exactly 8 products in carousel
   - Shows products with most recent `created_at` date
   - Includes link to all products

2. **What's Hot Section**
   - Displays products with `featured` flag set to true
   - Includes link to all products

3. **Product Navigation**
   - Product clicks navigate to Product Details Page
   - Section links navigate to appropriate pages

## Configuration Files

### `jest.config.js`
Jest configuration file with:

- Test environment setup (jsdom)
- Test file patterns and coverage configuration
- Module name mapping for Liquid template simulation
- Transform configuration for JavaScript files

### `setup.js`
Test setup file providing:

- Global DOM API mocks (ResizeObserver, IntersectionObserver)
- Mock utilities for Liquid template simulation
- Test data generators (products, cart, menu data)
- Global error handling

### `package.json`
Package configuration with:

- Test scripts for different scenarios
- Jest and Babel dependencies
- Coverage reporting configuration

## Running Tests

### Prerequisites

Install dependencies:
```bash
cd tests
npm install
```

### Test Commands

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run specific test suites:
```bash
# Shop mega menu tests
npm run test:shop-menu

# Cart functionality tests
npm run test:cart

# Homepage sections tests
npm run test:homepage

# All ecommerce tests
npm run test:ecommerce
```

Run tests in CI mode:
```bash
npm run test:ci
```

## Test Data and Mocking

### Mock Context Objects
The tests use mock context objects that simulate the Liquid template context:

```javascript
const mockContext = testUtils.createMockContext({
  constants: { ecommerce_addon: 'true' },
  current_user: { id: 'test-user-123' },
  device: { device_type: 'desktop' }
});
```

### Mock Product Data
Generated product data with realistic attributes:

```javascript
const mockProducts = testUtils.createMockProducts(10);
// Creates 10 products with id, name, slug, created_at, featured, price, category
```

### Mock Cart Data
Generated cart data with items and totals:

```javascript
const mockCart = testUtils.createMockCart(3);
// Creates cart with 3 items, proper quantities, and calculated totals
```

## Test Utilities

### Global Test Utilities (`testUtils`)

- `createMockContext(overrides)`: Creates mock Liquid context
- `createMockProducts(count)`: Generates mock product data
- `createMockCart(itemCount)`: Generates mock cart data
- `createMockMenu()`: Generates mock menu structure
- `renderTemplate(template, context)`: Simulates Liquid rendering
- `mockGraphQLResponse(data)`: Creates mock GraphQL responses
- `waitFor(ms)`: Async utility for timing

## Coverage and Quality

### Coverage Targets
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Test Quality Standards
- Each test has clear, descriptive names
- Tests are isolated and independent
- Proper setup and teardown in beforeEach/afterEach
- Comprehensive error handling tests
- Edge case coverage (empty data, malformed data, network errors)

## Integration with Liquid Templates

Since this is a Liquid-based application, the tests simulate Liquid template behavior:

1. **Conditional Rendering**: Tests verify `{% if %}` blocks work correctly
2. **Data Binding**: Tests verify template variables are properly bound
3. **Include Statements**: Tests verify `{% include %}` functionality
4. **GraphQL Queries**: Tests verify data fetching and processing

## Error Handling

The test suite includes comprehensive error handling tests:

1. **Missing Data**: Tests for graceful handling of null/undefined data
2. **Network Errors**: Tests for API failures and retry logic
3. **Validation Errors**: Tests for data validation and sanitization
4. **User Errors**: Tests for invalid user input handling

## Mobile Responsiveness

Tests include mobile-specific scenarios:

1. **Mobile Menu**: Tests for mobile menu integration
2. **Mobile Cart**: Tests for mobile cart drawer behavior
3. **Responsive Carousels**: Tests for different screen sizes
4. **Touch Interactions**: Tests for mobile-specific interactions

## Performance Testing

Basic performance considerations are tested:

1. **Lazy Loading**: Tests for image lazy loading
2. **Loading States**: Tests for loading indicators
3. **Error States**: Tests for error message display
4. **Async Operations**: Tests for proper async handling

## Continuous Integration

The test suite is designed for CI/CD integration:

- **CI Mode**: `npm run test:ci` for headless execution
- **Coverage Reporting**: Generates coverage reports for CI
- **Exit Codes**: Proper exit codes for CI success/failure
- **Parallel Execution**: Tests can run in parallel for speed

## Maintenance

### Adding New Tests

1. Create test files in appropriate directories
2. Follow existing naming conventions (`*.test.js`)
3. Use provided test utilities and mock data
4. Include both positive and negative test cases
5. Add error handling tests

### Updating Tests

1. Update mock data when application data structure changes
2. Update test utilities when new functionality is added
3. Maintain test coverage above target thresholds
4. Update documentation when test structure changes

## Troubleshooting

### Common Issues

1. **Mock Data Issues**: Ensure mock data matches actual data structure
2. **Async Issues**: Use proper async/await or Promise handling
3. **DOM Issues**: Ensure proper DOM mocking in setup.js
4. **Coverage Issues**: Check that all code paths are tested

### Debug Mode

Run tests in debug mode for detailed output:
```bash
npm run test:debug
```

This will show:
- Detailed test execution information
- Open handles detection
- Force exit on completion
- Verbose output for debugging

## Conclusion

This comprehensive test suite provides complete coverage of the specified ecommerce functionality test criteria. The tests are designed to be maintainable, reliable, and provide confidence in the application's ecommerce features.

The modular structure allows for easy maintenance and extension as new features are added to the application. The use of mock data and utilities ensures tests are fast and reliable while accurately simulating the real application behavior.
