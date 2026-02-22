/**
 * Tests for warning utility functions
 */

import { warn, logError, shouldEnableWarnings } from '../../src/utils/warnings';

describe('warn', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalWarn = console.warn;

  beforeEach(() => {
    console.warn = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.warn = originalWarn;
  });

  it('logs warning in development when enabled', () => {
    process.env.NODE_ENV = 'development';
    warn('Test warning', true);
    expect(console.warn).toHaveBeenCalledWith('[useSEO Warning]: Test warning');
  });

  it('does not log when disabled', () => {
    process.env.NODE_ENV = 'development';
    warn('Test warning', false);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not log in production', () => {
    process.env.NODE_ENV = 'production';
    warn('Test warning', true);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not log in test environment even when enabled', () => {
    process.env.NODE_ENV = 'test';
    warn('Test warning', true);
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('logError', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error = originalError;
  });

  it('logs error in development', () => {
    process.env.NODE_ENV = 'development';
    logError('Test error');
    expect(console.error).toHaveBeenCalledWith(
      '[useSEO Error]: Test error',
      ''
    );
  });

  it('logs error with error object', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Test');
    logError('Test error', error);
    expect(console.error).toHaveBeenCalledWith(
      '[useSEO Error]: Test error',
      error
    );
  });

  it('does not log in production', () => {
    process.env.NODE_ENV = 'production';
    logError('Test error');
    expect(console.error).not.toHaveBeenCalled();
  });
});

describe('shouldEnableWarnings', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('returns true in development', () => {
    process.env.NODE_ENV = 'development';
    expect(shouldEnableWarnings()).toBe(true);
  });

  it('returns false in production', () => {
    process.env.NODE_ENV = 'production';
    expect(shouldEnableWarnings()).toBe(false);
  });

  it('returns false when process is undefined', () => {
    const originalProcess = global.process;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (global as any).process = undefined;

    // Re-import to test the fallback - use require to avoid caching
    jest.resetModules();
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
    const {
      shouldEnableWarnings: freshShouldEnableWarnings,
    } = require('../../src/utils/warnings');
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(freshShouldEnableWarnings()).toBe(false);

    global.process = originalProcess;
    jest.resetModules();
  });
});
