/**
 * Jest test setup file
 * Configures the testing environment before each test
 */

import '@testing-library/jest-dom';

// Mock console.warn and console.error to prevent noise in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  // Reset document head for each test (only when running under jsdom — the
  // SSR-specific test file runs under the `node` environment where these
  // globals do not exist).
  if (typeof document !== 'undefined') {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
  }

  // Silence expected warnings during tests
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.warn = originalWarn;
  console.error = originalError;
});
