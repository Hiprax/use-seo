/**
 * @fileoverview Warning utilities for development feedback
 * @module use-seo/utils/warnings
 */

/**
 * Checks if we're in a development environment.
 * Uses multiple fallbacks for different bundler configurations.
 *
 * @returns True if in development mode
 */
function isDevelopment(): boolean {
  // Check for process.env.NODE_ENV (most common)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  // Fallback: assume production if we can't determine
  return false;
}

/**
 * Logs a warning message in development mode.
 * No-op in production for performance.
 *
 * @param message - The warning message to display
 * @param enabled - Override flag to enable/disable warnings
 *
 * @example
 * ```typescript
 * warn('Title is too long', true);
 * // Console: [useSEO Warning]: Title is too long
 * ```
 */
export function warn(message: string, enabled: boolean): void {
  if (enabled && isDevelopment()) {
    console.warn(`[useSEO Warning]: ${message}`);
  }
}

/**
 * Logs an error message.
 * Only logs in non-production for security.
 *
 * @param message - The error message to display
 * @param error - Optional error object for additional context
 *
 * @internal
 */
export function logError(message: string, error?: unknown): void {
  if (isDevelopment()) {
    console.error(`[useSEO Error]: ${message}`, error ?? '');
  }
}

/**
 * Checks if warnings should be enabled by default.
 *
 * @returns True if in development mode
 */
export function shouldEnableWarnings(): boolean {
  return isDevelopment();
}

