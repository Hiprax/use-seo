/**
 * @fileoverview DOM manipulation utilities for SEO tag management
 * @module use-seo/utils/dom
 */

/** Marker attribute to identify tags created by useSEO */
export const SEO_MARKER = 'data-use-seo';

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
 * @param key - The meta tag identifier (name, property, or httpEquiv)
 * @param preventDuplicates - Whether to remove duplicate meta tags
 * @returns The meta element (existing or newly created)
 *
 * @example
 * ```typescript
 * const meta = getOrCreateMeta({ name: 'description' }, true);
 * meta.setAttribute('content', 'Page description');
 * ```
 */
export function getOrCreateMeta(
  key: MetaKey,
  preventDuplicates: boolean
): HTMLMetaElement {
  const { name, property, httpEquiv } = key;

  // Build selector based on key type
  const attr = property ? 'property' : httpEquiv ? 'http-equiv' : 'name';
  const value = property ?? httpEquiv ?? name ?? '';
  const selector = value ? `meta[${attr}="${value}"]` : 'meta';

  let meta: HTMLMetaElement | null = document.querySelector(selector);

  // Remove duplicates if needed
  if (preventDuplicates && meta && value) {
    const all = document.querySelectorAll(`meta[${attr}="${value}"]`);
    for (let i = 1; i < all.length; i++) {
      all[i]?.parentElement?.removeChild(all[i] as Node);
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
 * @returns The link element (existing or newly created)
 *
 * @example
 * ```typescript
 * const link = getOrCreateLink('canonical', true);
 * link.setAttribute('href', 'https://example.com/page');
 *
 * // With key selector for hreflang
 * const hreflangLink = getOrCreateLink('alternate', false, '[hreflang="en"]');
 * ```
 */
export function getOrCreateLink(
  rel: string,
  unique: boolean,
  keySelector?: string
): HTMLLinkElement {
  let selector = `link[rel="${rel}"]`;
  if (keySelector) {
    selector += keySelector;
  }

  let link: HTMLLinkElement | null = document.querySelector(selector);

  // Handle unique constraint
  if (unique && !keySelector) {
    const all = document.querySelectorAll(`link[rel="${rel}"]`);
    if (all.length > 1) {
      for (let i = 1; i < all.length; i++) {
        all[i]?.parentElement?.removeChild(all[i] as Node);
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
  }

  return link;
}

/**
 * Removes elements from the DOM that match the provided selector and have the SEO marker.
 *
 * @param selector - CSS selector for elements to remove
 *
 * @example
 * ```typescript
 * // Remove all OG image meta tags created by useSEO
 * removeMarkedElements('meta[property^="og:image"]');
 * ```
 */
export function removeMarkedElements(selector: string): void {
  if (!canUseDOM()) return;

  const elements = document.querySelectorAll(
    `${selector}[${SEO_MARKER}="true"]`
  );
  elements.forEach((el) => {
    el.parentElement?.removeChild(el);
  });
}

/**
 * Creates a JSON-LD script element with structured data.
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
  if (!data || typeof data !== 'object') {
    return null;
  }

  try {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute(SEO_MARKER, 'true');
    script.setAttribute('data-seo-index', String(index));
    script.textContent = JSON.stringify(data);
    return script;
  } catch {
    return null;
  }
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
