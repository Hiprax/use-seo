/**
 * @fileoverview URL and language validation utilities
 * @module use-seo/utils/validation
 */

import { canUseDOM } from './dom';

/**
 * Validates if a string is a valid URL.
 * Supports both absolute URLs and relative URLs (when baseUrl is available).
 *
 * @param url - The URL string to validate
 * @param allowRelative - Whether to allow relative URLs (requires DOM)
 * @returns True if the URL is valid
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('/path/to/page', true); // true (relative URL)
 * isValidUrl('not-a-url'); // false
 * ```
 */
export function isValidUrl(url: string, allowRelative = false): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Try parsing as absolute URL first
  try {
    new URL(url);
    return true;
  } catch {
    // Not a valid absolute URL
  }

  // Try parsing as relative URL if allowed and DOM is available
  if (allowRelative && canUseDOM()) {
    try {
      new URL(url, window.location.href);
      return true;
    } catch {
      // Not a valid relative URL either
    }
  }

  return false;
}

/**
 * Normalizes a URL for use as a canonical URL.
 * Removes hash fragments and normalizes the URL structure.
 *
 * @param url - The URL to normalize
 * @returns The normalized URL, or the original if normalization fails
 *
 * @example
 * ```typescript
 * normalizeCanonical('https://example.com/page#section');
 * // Returns: 'https://example.com/page'
 *
 * normalizeCanonical('/relative/path');
 * // Returns: 'https://current-domain.com/relative/path'
 * ```
 */
export function normalizeCanonical(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const baseUrl = canUseDOM() ? window.location.href : undefined;
    const parsed = new URL(url, baseUrl);
    // Remove hash fragment for canonical URLs
    parsed.hash = '';
    return parsed.toString();
  } catch {
    // Return original if parsing fails
    return url;
  }
}

/**
 * Validates and normalizes a BCP 47 language tag.
 * Uses Intl.getCanonicalLocales when available, with fallback validation.
 *
 * @param lang - The language tag to validate
 * @returns The normalized language tag, or undefined if invalid
 *
 * @example
 * ```typescript
 * normalizeLanguageTag('en'); // 'en'
 * normalizeLanguageTag('EN-us'); // 'en-US'
 * normalizeLanguageTag('invalid!!'); // undefined
 * ```
 */
export function normalizeLanguageTag(lang?: string): string | undefined {
  if (!lang || typeof lang !== 'string') {
    return undefined;
  }

  const trimmed = lang.trim();
  if (!trimmed) {
    return undefined;
  }

  // Try using Intl.getCanonicalLocales for proper normalization
  if (typeof Intl !== 'undefined' && Intl.getCanonicalLocales) {
    try {
      const canonical = Intl.getCanonicalLocales(trimmed);
      return canonical.length > 0 ? canonical[0] : undefined;
    } catch {
      // Intl validation failed, try fallback
    }
  }

  // Fallback: Basic BCP 47 pattern validation
  // Pattern: language[-script][-region][-variant]
  const bcp47Pattern = /^[a-zA-Z]{2,3}(?:-[a-zA-Z]{4})?(?:-[a-zA-Z]{2}|\d{3})?(?:-(?:[a-zA-Z\d]{5,8}|\d[a-zA-Z\d]{3}))*$/;
  
  if (bcp47Pattern.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}

/**
 * Checks if a URL contains image-related path or query indicators.
 * Used to determine if URL validation should be applied.
 *
 * @param key - The meta tag key (name or property)
 * @returns True if the key suggests an image/URL field
 *
 * @internal
 */
export function isUrlField(key: string): boolean {
  if (!key) return false;
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes('url') ||
    lowerKey.includes('image') ||
    lowerKey.includes('href') ||
    lowerKey.includes('canonical')
  );
}

/**
 * Infers MIME type from a URL's file extension.
 *
 * @param url - The URL to check
 * @returns The inferred MIME type, or undefined if not determinable
 *
 * @example
 * ```typescript
 * inferImageMimeType('https://example.com/image.jpg'); // 'image/jpeg'
 * inferImageMimeType('https://example.com/image.png'); // 'image/png'
 * inferImageMimeType('https://example.com/page'); // undefined
 * ```
 */
export function inferImageMimeType(url: string): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  // Extract extension from URL, handling query strings and hash fragments
  const pathMatch = url.match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
  if (!pathMatch?.[1]) {
    return undefined;
  }

  const ext = pathMatch[1].toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    avif: 'image/avif',
  };

  return mimeTypes[ext];
}

