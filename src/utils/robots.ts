/**
 * @fileoverview Robots meta tag directive utilities
 * @module use-seo/utils/robots
 */

import type { RobotsOptions, RobotsObject } from '../types';

/**
 * Result of building robots directives.
 */
export interface RobotsResult {
  /** The robots meta tag content */
  robots?: string;
  /** The googlebot meta tag content (if different from robots) */
  googlebot?: string;
}

/**
 * Converts a RobotsObject to a comma-separated directive string.
 *
 * Boolean fields use a tri-state semantics:
 * - `true`  → emit the positive directive (e.g. `index`, `follow`)
 * - `false` → emit the negative directive (e.g. `noindex`, `nofollow`)
 * - `undefined` → omit the directive entirely (search-engine default applies)
 *
 * The positive forms (`index`, `follow`) are valid robots directives per
 * Google's spec — they are useful for explicitly overriding a parent
 * directive (e.g. one injected via Tag Manager or via a deprecated boolean
 * flag) without producing an empty robots tag.
 *
 * @param opt - The robots configuration object
 * @returns Comma-separated robots directives string
 *
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag Google: Robots meta tag specification}
 *
 * @example
 * ```typescript
 * robotsObjectToString({ index: false, follow: true, noarchive: true });
 * // Returns: 'noindex,follow,noarchive'
 *
 * robotsObjectToString({ index: true, follow: true });
 * // Returns: 'index,follow' (positive form is now emitted explicitly)
 * ```
 */
function robotsObjectToString(opt: RobotsObject): string {
  const parts: string[] = [];

  // Index/noindex — emit positive form when explicitly true so users can
  // override a parent `<meta name="robots" content="noindex">` (e.g.
  // injected via Tag Manager) instead of the directive silently dropping.
  if (opt.index === false) {
    parts.push('noindex');
  } else if (opt.index === true) {
    parts.push('index');
  }

  // Follow/nofollow — same rationale as index above.
  if (opt.follow === false) {
    parts.push('nofollow');
  } else if (opt.follow === true) {
    parts.push('follow');
  }

  // Other directives. These don't have a useful "positive" form in the wild
  // (the search engine default IS the positive form), so we only emit when
  // explicitly true.
  if (opt.noarchive === true) {
    parts.push('noarchive');
  }

  if (opt.nosnippet === true) {
    parts.push('nosnippet');
  }

  if (opt.noimageindex === true) {
    parts.push('noimageindex');
  }

  // Max directives
  if (opt.maxSnippet !== undefined) {
    // Google: max-snippet takes an integer; `0` means "no snippet". The
    // legacy `'none'` value maps to `0` (emitting `max-snippet:none` is
    // invalid and Google would ignore it).
    const v = opt.maxSnippet === 'none' ? 0 : opt.maxSnippet;
    parts.push(`max-snippet:${v}`);
  }

  if (opt.maxImagePreview) {
    parts.push(`max-image-preview:${opt.maxImagePreview}`);
  }

  if (opt.maxVideoPreview !== undefined) {
    // Google: max-video-preview takes an integer; `0` means "static image
    // only" (no video preview). Legacy `'none'` maps to `0`.
    const v = opt.maxVideoPreview === 'none' ? 0 : opt.maxVideoPreview;
    parts.push(`max-video-preview:${v}`);
  }

  // Time-limited indexing. Per Google's spec, the value is appended verbatim
  // (consumers should pass an RFC 850 or ISO 8601 datetime string).
  if (opt.unavailableAfter) {
    parts.push(`unavailable_after: ${opt.unavailableAfter}`);
  }

  return parts.join(',');
}

/**
 * Builds robots and googlebot meta tag content from configuration.
 *
 * **Precedence within `useSEO`:** when both the `robots` prop and the
 * deprecated boolean flags (`noindex`, `nofollow`, `noarchive`, `nosnippet`,
 * `noimageindex`) are passed at the same time, the `robots` prop wins
 * outright — the flags are only consulted when `robots` is `undefined`.
 * To explicitly override a deprecated flag (or a parent robots tag) with
 * a positive directive, pass `robots: { index: true, follow: true }`; the
 * serializer will emit `index,follow` rather than dropping silently.
 *
 * @param options - The robots configuration (string or object)
 * @returns Object with robots and optional googlebot directive strings
 *
 * @example
 * ```typescript
 * // String input
 * buildRobots('noindex,nofollow');
 * // Returns: { robots: 'noindex,nofollow' }
 *
 * // Explicit positive directives (useful to override a parent robots tag)
 * buildRobots({ index: true, follow: true });
 * // Returns: { robots: 'index,follow' }
 *
 * // Mixed object input
 * buildRobots({
 *   index: true,
 *   follow: true,
 *   maxSnippet: 150,
 *   googlebot: { maxVideoPreview: 0 },
 * });
 * // Returns: { robots: 'index,follow,max-snippet:150', googlebot: 'max-video-preview:0' }
 * ```
 */
export function buildRobots(options?: RobotsOptions): RobotsResult {
  if (!options) {
    return {};
  }

  // Handle string shorthand
  if (typeof options === 'string') {
    const trimmed = options.trim();
    return trimmed ? { robots: trimmed } : {};
  }

  // Handle object configuration
  const robots = robotsObjectToString(options);

  let googlebot: string | undefined;
  if (options.googlebot) {
    if (typeof options.googlebot === 'string') {
      googlebot = options.googlebot.trim() || undefined;
    } else {
      googlebot = robotsObjectToString(options.googlebot) || undefined;
    }
  }

  return {
    robots: robots || undefined,
    googlebot,
  };
}

/**
 * Builds robots options from deprecated boolean flags.
 * Used for backwards compatibility with older API.
 *
 * @param flags - Object containing deprecated boolean flags
 * @returns RobotsObject or undefined if no flags are set
 *
 * @example
 * ```typescript
 * buildRobotsFromFlags({ noindex: true, nofollow: false });
 * // Returns: { index: false, follow: true }
 * ```
 *
 * @deprecated This is for backwards compatibility only
 */
export function buildRobotsFromFlags(flags: {
  noindex?: boolean;
  nofollow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
}): RobotsObject | undefined {
  const { noindex, nofollow, noarchive, nosnippet, noimageindex } = flags;

  // Check if any flag is set
  if (!noindex && !nofollow && !noarchive && !nosnippet && !noimageindex) {
    return undefined;
  }

  return {
    index: noindex ? false : undefined,
    follow: nofollow ? false : undefined,
    noarchive: noarchive ?? undefined,
    nosnippet: nosnippet ?? undefined,
    noimageindex: noimageindex ?? undefined,
  };
}
