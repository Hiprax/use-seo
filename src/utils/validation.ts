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
 * Uses Intl.getCanonicalLocales when available, with a tightened RFC 5646
 * fallback regex for runtimes that lack `Intl` (very old browsers / minimal
 * Node builds).
 *
 * The fallback supports the abbreviated RFC 5646 grammar:
 *
 * - language: 2-3 ALPHA, optionally followed by up to three 3-letter
 *   extlang subtags (e.g., `zh-cmn`)
 * - script: 4 ALPHA (e.g., `Hant`)
 * - region: 2 ALPHA or 3 DIGIT (e.g., `US`, `419`)
 * - variant: 5-8 alphanumerics or 4-char digit-led (e.g., `1996`, `rozaj`)
 * - extension: single-character singleton (not `x`) followed by one or more
 *   2-8-char alphanumeric subtags (e.g., `-u-ca-buddhist`, `-t-en-latn`)
 * - private-use: `x-` followed by one or more 1-8-char alphanumeric subtags
 *   (e.g., `-x-private`, or the whole tag `x-foo`)
 *
 * @param lang - The language tag to validate
 * @returns The normalized language tag, or undefined if invalid
 *
 * @example
 * ```typescript
 * normalizeLanguageTag('en'); // 'en'
 * normalizeLanguageTag('EN-us'); // 'en-US'
 * normalizeLanguageTag('zh-Hant-TW'); // 'zh-Hant-TW'
 * normalizeLanguageTag('en-US-u-ca-buddhist'); // 'en-US-u-ca-buddhist'
 * normalizeLanguageTag('en-x-private'); // 'en-x-private'
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

  // Fallback: Tightened BCP 47 (RFC 5646 abbreviated form) pattern.
  // Pieces (case-insensitive):
  const language = '[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}';
  const script = '[A-Za-z]{4}';
  const region = '(?:[A-Za-z]{2}|\\d{3})';
  const variant = '(?:[A-Za-z\\d]{5,8}|\\d[A-Za-z\\d]{3})';
  // Singleton is any single ALPHA/DIGIT except 'x'/'X' (private-use marker).
  const extension = '[A-WY-Za-wy-z0-9](?:-[A-Za-z\\d]{2,8})+';
  const privateUse = '[xX](?:-[A-Za-z\\d]{1,8})+';

  const langTag =
    `^${language}` +
    `(?:-${script})?` +
    `(?:-${region})?` +
    `(?:-${variant})*` +
    `(?:-${extension})*` +
    `(?:-${privateUse})?$`;

  // A whole tag may also be private-use only ("x-..."), which the langtag
  // form above does not allow.
  const bcp47Pattern = new RegExp(`(?:${langTag})|^${privateUse}$`);

  if (bcp47Pattern.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}

/**
 * Checks if a meta-tag key identifies a URL-bearing field.
 *
 * Uses an allow-list of well-known SEO/Open-Graph/Twitter URL properties
 * plus boundary-aware suffix matches (camelCase or `:` / `_` / `-` boundary)
 * for `url`, `href`, `image`, and `src`. This is intentionally conservative
 * to avoid false positives on names like `imagealt`, `urltext`, or
 * `hreflang`, which are NOT URL fields.
 *
 * @param key - The meta tag key (name, property, or http-equiv)
 * @returns True if the key represents a URL-valued field
 *
 * @internal
 */
export function isUrlField(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const lower = key.toLowerCase();

  // Exact-match allow-list of common URL identifiers and well-known
  // properties that always carry a URL value.
  const exact = new Set<string>([
    'url',
    'href',
    'src',
    'canonical',
    // Open Graph URL-bearing properties
    'og:url',
    'og:image',
    'og:image:url',
    'og:image:secure_url',
    'og:audio',
    'og:audio:url',
    'og:audio:secure_url',
    'og:video',
    'og:video:url',
    'og:video:secure_url',
    // Twitter Card URL-bearing properties
    'twitter:image',
    'twitter:image:src',
    'twitter:url',
    'twitter:player',
    'twitter:player:stream',
    // Article extensions
    'article:author',
    'article:publisher',
    // Apple touch / manifest
    'msapplication-tileimage',
    'msapplication-config',
  ]);
  // NOTE: `article:tag` and `article:section` intentionally do NOT match here
  // — they carry plain text labels (e.g., "Technology", "react"), not URLs.
  if (exact.has(lower)) return true;

  // Boundary-aware suffix patterns. Boundaries are camelCase (Capital letter
  // in the original key, NOT the lowercased one) or the separators
  // `:`, `_`, `-`, `.`. `urltext` and `imagealt` do NOT match — they have no
  // boundary between the suffix and the trailing word.
  const camelBoundary = /[a-z\d](?:Url|Href|Src|Image)$/;
  if (camelBoundary.test(key)) return true;

  const separatorBoundary = /(?:^|[:_\-.])(?:url|href|src|image)$/;
  return separatorBoundary.test(lower);
}

/**
 * Infers MIME type from a URL's file extension.
 *
 * Supported extensions (case-insensitive): `jpg`, `jpeg`, `png`, `apng`,
 * `gif`, `webp`, `svg`, `ico`, `avif`, `bmp`, `tiff`, `tif`, `heic`,
 * `heif`, `jxl`.
 *
 * @param url - The URL to check
 * @returns The inferred MIME type, or undefined if not determinable
 *
 * @example
 * ```typescript
 * inferImageMimeType('https://example.com/image.jpg'); // 'image/jpeg'
 * inferImageMimeType('https://example.com/image.png'); // 'image/png'
 * inferImageMimeType('https://example.com/photo.heic'); // 'image/heic'
 * inferImageMimeType('https://example.com/page'); // undefined
 * ```
 */
export function inferImageMimeType(url: string): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  // Consider only the path segment: strip any query/hash first so an
  // extension embedded in a query value (e.g. `/render?file=photo.png`) on an
  // extensionless path is NOT mistaken for the resource extension.
  //
  // The pattern is `[?#][\s\S]*` (match everything from the first `?`/`#` to
  // the end), NOT `[?#].*$`. The trailing `$` anchor in the old form forced
  // super-linear backtracking on adversarial input such as a long run of `#`
  // (each `#` is a fresh match start, and `.` cannot cross the trailing
  // newline the `$` demands) — a polynomial-ReDoS footgun. `[\s\S]*` has no
  // following token to fail against, so it consumes to the end in one pass
  // with no backtracking. `replace` still returns a plain `string`, so there
  // is no `undefined` case to guard under `noUncheckedIndexedAccess`.
  const path = url.replace(/[?#][\s\S]*/, '');
  const pathMatch = path.match(/\.([a-z0-9]+)$/i);
  if (!pathMatch?.[1]) {
    return undefined;
  }

  const ext = pathMatch[1].toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    apng: 'image/apng',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    avif: 'image/avif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    heic: 'image/heic',
    heif: 'image/heif',
    jxl: 'image/jxl',
  };

  return mimeTypes[ext];
}
