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
 * @param opt - The robots configuration object
 * @returns Comma-separated robots directives string
 *
 * @example
 * ```typescript
 * robotsObjectToString({ index: false, follow: true, noarchive: true });
 * // Returns: 'noindex,noarchive'
 * ```
 */
function robotsObjectToString(opt: RobotsObject): string {
  const parts: string[] = [];

  // Index/noindex
  if (opt.index === false) {
    parts.push('noindex');
  }

  // Follow/nofollow
  if (opt.follow === false) {
    parts.push('nofollow');
  }

  // Other directives
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
    parts.push(`max-snippet:${opt.maxSnippet}`);
  }

  if (opt.maxImagePreview) {
    parts.push(`max-image-preview:${opt.maxImagePreview}`);
  }

  if (opt.maxVideoPreview !== undefined) {
    parts.push(`max-video-preview:${opt.maxVideoPreview}`);
  }

  return parts.join(',');
}

/**
 * Builds robots and googlebot meta tag content from configuration.
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
 * // Object input
 * buildRobots({
 *   index: true,
 *   follow: true,
 *   maxSnippet: 150,
 *   googlebot: { maxVideoPreview: 0 },
 * });
 * // Returns: { robots: 'max-snippet:150', googlebot: 'max-video-preview:0' }
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
