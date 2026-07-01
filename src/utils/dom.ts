/**
 * @fileoverview DOM manipulation utilities for SEO tag management
 * @module use-seo/utils/dom
 */

import { logError } from './warnings';

/** Marker attribute to identify tags created by useSEO */
export const SEO_MARKER = 'data-use-seo';

/**
 * Escapes a string for safe use in a CSS selector attribute value.
 * Handles characters that could break or alter the selector.
 *
 * @param value - The value to escape
 * @returns The escaped value safe for use in CSS selectors
 *
 * @internal
 */
export function escapeSelectorValue(value: string): string {
  return value.replace(/["\\]/g, '\\$&');
}

/** Cached DOM availability check result */
let cachedCanUseDOM: boolean | null = null;

/**
 * Checks if DOM is available (client-side environment).
 * Result is cached after first call for performance.
 *
 * @returns True if running in a browser environment with DOM access
 *
 * @example
 * ```typescript
 * if (canUseDOM()) {
 *   document.title = 'New Title';
 * }
 * ```
 */
export function canUseDOM(): boolean {
  cachedCanUseDOM ??=
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function';
  return cachedCanUseDOM;
}

/**
 * Resets the cached DOM availability check.
 * Useful for testing scenarios.
 *
 * @internal
 */
export function resetCanUseDOMCache(): void {
  cachedCanUseDOM = null;
}

/**
 * Key identifier for meta tags.
 */
export interface MetaKey {
  name?: string;
  property?: string;
  httpEquiv?: string;
}

/**
 * Creates a new meta element without checking for existing ones.
 * Useful for properties that can have multiple values (e.g., og:image).
 *
 * @param key - The meta tag identifier (name, property, or httpEquiv)
 * @returns The newly created meta element
 *
 * @example
 * ```typescript
 * const meta = createMeta({ property: 'og:image' });
 * meta.setAttribute('content', 'https://example.com/image.jpg');
 * ```
 */
export function createMeta(key: MetaKey): HTMLMetaElement {
  const { name, property, httpEquiv } = key;
  const meta = document.createElement('meta');

  if (property) {
    meta.setAttribute('property', property);
  } else if (httpEquiv) {
    meta.setAttribute('http-equiv', httpEquiv);
  } else if (name) {
    meta.setAttribute('name', name);
  }

  meta.setAttribute(SEO_MARKER, 'true');
  document.head.appendChild(meta);

  return meta;
}

/**
 * Gets or creates a meta element with the specified key.
 * Handles duplicate prevention by removing extra matching elements.
 *
 * If `key` does not contain at least one non-empty `name`, `property`, or
 * `httpEquiv`, the function returns `null` instead of falling back to a
 * generic `meta` selector that would match (and overwrite) the first meta
 * element in the document head.
 *
 * @param key - The meta tag identifier (name, property, or httpEquiv)
 * @param preventDuplicates - Whether to remove duplicate meta tags
 * @param trackedElements - Optional `Set<Element>` that the caller uses to
 *   track elements it OWNS for later cleanup (e.g. `clearSEOTags`). Two
 *   things happen with it:
 *   1. Ownership: when this call creates a brand-new element (no existing
 *      match), that element is `add()`ed to the Set. An existing element
 *      returned via the reuse path is deliberately NOT added, even if it
 *      carries the SEO marker — it may have been created by a different
 *      `useSEO` instance sharing the same document, and adopting it into
 *      this instance's Set would let this instance's cleanup delete an
 *      element another instance still depends on.
 *   2. Dedup cleanup: any duplicate element removed by the dedup loop is
 *      `delete()`d from the Set so detached references don't linger and
 *      prevent garbage collection.
 *   Backwards-compatible: omit to keep the previous behavior (no tracking).
 * @returns The meta element (existing or newly created), or `null` if no
 *   key was provided
 *
 * @example
 * ```typescript
 * const meta = getOrCreateMeta({ name: 'description' }, true);
 * meta?.setAttribute('content', 'Page description');
 *
 * // With caller-side tracking Set:
 * const tracked = new Set<Element>();
 * getOrCreateMeta({ name: 'description' }, true, tracked);
 * ```
 */
export function getOrCreateMeta(
  key: MetaKey,
  preventDuplicates: boolean,
  trackedElements?: Set<Element>
): HTMLMetaElement | null {
  const { name, property, httpEquiv } = key;

  // Build selector based on key type
  const attr = property ? 'property' : httpEquiv ? 'http-equiv' : 'name';
  const value = property ?? httpEquiv ?? name ?? '';

  // Refuse to operate without a key — otherwise the selector would degrade
  // to `meta` and we would silently mutate (or duplicate) some unrelated
  // pre-existing meta element.
  if (!value) {
    return null;
  }

  const escaped = escapeSelectorValue(value);
  const selector = `meta[${attr}="${escaped}"]`;

  let meta: HTMLMetaElement | null = document.querySelector(selector);

  // Remove duplicates if needed
  if (preventDuplicates && meta) {
    const all = document.querySelectorAll(selector);
    for (let i = 1; i < all.length; i++) {
      const dup = all[i];
      if (!dup) continue;
      dup.parentElement?.removeChild(dup);
      // Propagate the removal to the caller's tracking Set so a previously
      // tracked duplicate doesn't linger as a detached reference.
      trackedElements?.delete(dup);
    }
  }

  // Create new meta if not found
  if (!meta) {
    meta = document.createElement('meta');
    if (property) {
      meta.setAttribute('property', property);
    } else if (httpEquiv) {
      meta.setAttribute('http-equiv', httpEquiv);
    } else if (name) {
      meta.setAttribute('name', name);
    }
    meta.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta);
    // Ownership is decided HERE, not by the caller inspecting the marker:
    // only an element this call actually created is added to the Set. A
    // reused element (returned above) is skipped even when it carries the
    // marker, since it may be owned by a different `useSEO` instance.
    trackedElements?.add(meta);
  }

  return meta;
}

/**
 * Gets or creates a link element with the specified relationship.
 * Supports uniqueness constraints for certain link types.
 *
 * @param rel - The link relationship type
 * @param unique - If true, ensures only one link with this rel exists
 * @param keySelector - Additional selector to identify specific links (e.g., '[hreflang="en"]')
 * @param trackedElements - Optional `Set<Element>` that the caller uses to
 *   track elements it OWNS for later cleanup (e.g. `clearSEOTags`). Two
 *   things happen with it:
 *   1. Ownership: when this call creates a brand-new element (no existing
 *      match), that element is `add()`ed to the Set. An existing element
 *      returned via the reuse path is deliberately NOT added, even if it
 *      carries the SEO marker — it may have been created by a different
 *      `useSEO` instance sharing the same document, and adopting it into
 *      this instance's Set would let this instance's cleanup delete an
 *      element another instance still depends on.
 *   2. Dedup cleanup: when the unique constraint removes duplicate
 *      elements, those duplicates are also `delete()`d from the Set so
 *      detached references don't linger and prevent garbage collection.
 *   Backwards-compatible: omit to keep the previous behavior (no tracking).
 * @returns The link element (existing or newly created)
 *
 * @example
 * ```typescript
 * const link = getOrCreateLink('canonical', true);
 * link.setAttribute('href', 'https://example.com/page');
 *
 * // With key selector for hreflang
 * const hreflangLink = getOrCreateLink('alternate', false, '[hreflang="en"]');
 *
 * // With caller-side tracking Set:
 * const tracked = new Set<Element>();
 * getOrCreateLink('canonical', true, undefined, tracked);
 * ```
 */
export function getOrCreateLink(
  rel: string,
  unique: boolean,
  keySelector?: string,
  trackedElements?: Set<Element>
): HTMLLinkElement {
  const escapedRel = escapeSelectorValue(rel);
  let selector = `link[rel="${escapedRel}"]`;
  if (keySelector) {
    selector += keySelector;
  }

  let link: HTMLLinkElement | null = document.querySelector(selector);

  // Handle unique constraint
  if (unique && !keySelector) {
    const all = document.querySelectorAll(`link[rel="${escapedRel}"]`);
    if (all.length > 1) {
      for (let i = 1; i < all.length; i++) {
        const dup = all[i];
        if (!dup) continue;
        dup.parentElement?.removeChild(dup);
        // Propagate the removal to the caller's tracking Set so a previously
        // tracked duplicate doesn't linger as a detached reference.
        trackedElements?.delete(dup);
      }
      link = all[0] as HTMLLinkElement;
    }
  }

  // Create new link if not found
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(link);
    // Ownership is decided HERE, not by the caller inspecting the marker:
    // only an element this call actually created is added to the Set. A
    // reused element (returned above) is skipped even when it carries the
    // marker, since it may be owned by a different `useSEO` instance.
    trackedElements?.add(link);
  }

  return link;
}

/**
 * Removes elements from the DOM that match the provided selector and have the SEO marker.
 * Optionally also removes them from a tracking Set to prevent memory leaks.
 *
 * @param selector - CSS selector for elements to remove
 * @param trackedElements - Optional Set of tracked elements to also remove from
 *
 * @example
 * ```typescript
 * // Remove all OG image meta tags created by useSEO
 * removeMarkedElements('meta[property^="og:image"]');
 *
 * // Remove and also clean up from tracking Set
 * removeMarkedElements('meta[property^="og:image"]', addedElements);
 * ```
 */
export function removeMarkedElements(
  selector: string,
  trackedElements?: Set<Element>
): void {
  if (!canUseDOM()) return;

  const elements = document.querySelectorAll(
    `${selector}[${SEO_MARKER}="true"]`
  );
  elements.forEach((el) => {
    el.parentElement?.removeChild(el);
    trackedElements?.delete(el);
  });
}

/**
 * Escapes a JSON string for safe embedding inside an HTML `<script>` element.
 *
 * `<script>` content is parsed as raw text, so any literal `</script>`
 * substring (or `<!--`, `<![CDATA[`) inside a JSON value would break out of
 * the script tag and allow HTML injection. The U+2028 / U+2029 line
 * separators are also escaped because they are valid JSON but illegal in
 * JavaScript string literals (legacy compatibility).
 *
 * This is the canonical safe-JSON-in-HTML pattern used by libraries like
 * `serialize-javascript` and Next.js.
 *
 * @param json - A JSON string produced by `JSON.stringify`
 * @returns The same JSON, with HTML-significant characters escaped as Unicode
 *
 * @internal
 */
function escapeJsonForHtml(json: string): string {
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/[\u2028]/g, '\\u2028')
    .replace(/[\u2029]/g, '\\u2029');
}

/**
 * Computes a fast, non-cryptographic 32-bit FNV-1a hash of the given string.
 *
 * FNV-1a is small (a few lines), allocation-free, and well-distributed for
 * short strings. It is intentionally NOT cryptographic \u2014 it is only used here
 * as an identity key for "did this JSON-LD payload change between renders".
 * Collisions are extremely rare for the kinds of structured-data payloads we
 * see in practice, and a collision only causes a false negative (the script
 * is reused when it shouldn't be) which the consumer can fix by changing any
 * field. We accept that trade-off in exchange for zero dependencies and ~O(n)
 * speed.
 *
 * The hash is returned as a base-36 string for compact storage in `Map` keys
 * and `data-*` attributes.
 *
 * @param str - The input string to hash
 * @returns A short base-36 string representing the FNV-1a hash
 *
 * @internal
 *
 * @since 0.2.3
 */
export function fnv1aHash(str: string): string {
  // FNV offset basis for 32-bit hashes
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // FNV prime multiplication using the 32-bit-safe Math.imul intrinsic
    hash = Math.imul(hash, 0x01000193);
  }
  // Coerce to an unsigned 32-bit integer before encoding as base-36
  return (hash >>> 0).toString(36);
}

/**
 * Computes a stable hash for a JSON-LD payload. The hash is derived from the
 * raw `JSON.stringify` output (NOT the HTML-escaped form) so that semantically
 * identical payloads share a hash regardless of the escape transformation.
 *
 * Returns `null` when the payload cannot be serialized (circular references,
 * BigInt, etc.) \u2014 callers should treat that as "not hashable" and fall back
 * to recreating the script unconditionally.
 *
 * @param data - A structured-data object
 * @returns A stable short hash string, or `null` if unhashable
 *
 * @internal
 *
 * @since 0.2.3
 */
export function hashJsonLd(data: object): string | null {
  let json: string;
  try {
    json = JSON.stringify(data);
  } catch {
    return null;
  }
  if (typeof json !== 'string') return null;
  return fnv1aHash(json);
}

/**
 * Serializes a JSON-LD payload to the exact string that should be assigned to
 * a `<script type="application/ld+json">` element's `textContent`. Mirrors the
 * serialization performed by {@link createJsonLdScript} so the hook's
 * incremental reconciliation can compare the previously-rendered serialized
 * content against the new one (used to defend against the rare case where two
 * different payloads share a `hashJsonLd` value).
 *
 * Returns `null` when the payload cannot be serialized (circular references,
 * BigInt, top-level `undefined`, etc.).
 *
 * @param data - A structured-data object
 * @param index - Index for tracking multiple scripts (used in error logging)
 * @returns The HTML-escaped JSON string, or `null` if unserializable
 *
 * @internal
 *
 * @since 0.2.4
 */
export function serializeJsonLdContent(
  data: object,
  index: number
): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  let json: string;
  try {
    json = JSON.stringify(data);
  } catch (error) {
    logError(`Failed to serialize structured data at index ${index}`, error);
    return null;
  }

  // JSON.stringify can return undefined for values like a top-level `undefined`
  // or a function. Guard against this so we don't emit an empty script tag.
  if (typeof json !== 'string') {
    return null;
  }

  return escapeJsonForHtml(json);
}

/**
 * Creates a JSON-LD script element with structured data.
 *
 * The serialized JSON has `<`, `>`, `&`, U+2028 and U+2029 escaped as
 * Unicode escapes so that string fields containing literal `</script>`,
 * `<!--`, or `<![CDATA[` cannot break out of the `<script>` element.
 *
 * If `JSON.stringify` throws (e.g. because of a circular reference or a
 * BigInt value), the error is logged via `logError` and `null` is returned;
 * the surrounding hook simply skips the script instead of crashing.
 *
 * @param data - The structured data object
 * @param index - Index for tracking multiple scripts
 * @returns The script element, or null if creation failed
 *
 * @example
 * ```typescript
 * const script = createJsonLdScript({
 *   '@context': 'https://schema.org',
 *   '@type': 'Article',
 *   headline: 'Article Title',
 * }, 0);
 * ```
 */
export function createJsonLdScript(
  data: object,
  index: number
): HTMLScriptElement | null {
  const content = serializeJsonLdContent(data, index);
  if (content === null) {
    return null;
  }

  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute(SEO_MARKER, 'true');
  script.setAttribute('data-seo-index', String(index));
  script.textContent = content;
  return script;
}

/**
 * Ensures essential meta tags exist in the document head.
 * Creates charset and viewport meta tags if missing.
 *
 * @param addedElements - Set to track elements added by the hook
 *
 * @example
 * ```typescript
 * const addedElements = new Set<Element>();
 * ensureEssentialMeta(addedElements);
 * ```
 */
export function ensureEssentialMeta(addedElements: Set<Element>): void {
  if (!canUseDOM()) return;

  // Ensure charset meta exists
  if (!document.querySelector('meta[charset]')) {
    const charsetMeta = document.createElement('meta');
    charsetMeta.setAttribute('charset', 'UTF-8');
    charsetMeta.setAttribute(SEO_MARKER, 'true');
    document.head.insertBefore(charsetMeta, document.head.firstChild);
    addedElements.add(charsetMeta);
  }

  // Ensure viewport meta exists
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    viewportMeta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0'
    );
    viewportMeta.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(viewportMeta);
    addedElements.add(viewportMeta);
  }
}
