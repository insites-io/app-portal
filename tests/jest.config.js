/**
 * Jest Configuration for Ecommerce Functionality Tests
 * 
 * This configuration is set up to test the ecommerce functionality
 * of the Insites CMS-based application.
 */

module.exports = {
    // Test environment
    testEnvironment: 'jsdom',

    // Test file patterns
    testMatch: [
        '**/*.test.js',
        '**/*.spec.js'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/setup.js'],

    // Module name mapping for Liquid template simulation
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@modules/(.*)$': '<rootDir>/modules/$1'
    },

    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'modules/**/*.{js,liquid}',
        '!modules/**/*.min.js',
        '!modules/**/node_modules/**',
        '!**/vendor/**'
    ],

    // Transform configuration
    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    // Test timeout
    testTimeout: 10000,

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Global variables for testing
    globals: {
        'process.env': {
            NODE_ENV: 'test'
        }
    }
};