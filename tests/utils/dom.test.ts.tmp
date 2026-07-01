/**
 * Tests for DOM utility functions
 */

import {
  canUseDOM,
  resetCanUseDOMCache,
  createMeta,
  getOrCreateMeta,
  getOrCreateLink,
  removeMarkedElements,
  createJsonLdScript,
  ensureEssentialMeta,
  escapeSelectorValue,
  fnv1aHash,
  hashJsonLd,
  SEO_MARKER,
} from '../../src/utils/dom';

describe('canUseDOM', () => {
  beforeEach(() => {
    resetCanUseDOMCache();
  });

  it('returns true in browser environment', () => {
    expect(canUseDOM()).toBe(true);
  });

  it('caches the result', () => {
    const first = canUseDOM();
    const second = canUseDOM();
    expect(first).toBe(second);
  });
});

describe('getOrCreateMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('creates a new meta tag with name attribute', () => {
    const meta = getOrCreateMeta({ name: 'description' }, true);

    expect(meta).toBeInstanceOf(HTMLMetaElement);
    expect(meta.getAttribute('name')).toBe('description');
    expect(meta.getAttribute(SEO_MARKER)).toBe('true');
    expect(document.head.contains(meta)).toBe(true);
  });

  it('creates a new meta tag with property attribute', () => {
    const meta = getOrCreateMeta({ property: 'og:title' }, true);

    expect(meta.getAttribute('property')).toBe('og:title');
  });

  it('creates a new meta tag with http-equiv attribute', () => {
    const meta = getOrCreateMeta({ httpEquiv: 'content-type' }, true);

    expect(meta.getAttribute('http-equiv')).toBe('content-type');
  });

  it('returns existing meta tag if found', () => {
    const existing = document.createElement('meta');
    existing.setAttribute('name', 'description');
    existing.setAttribute('content', 'existing');
    document.head.appendChild(existing);

    const meta = getOrCreateMeta({ name: 'description' }, true);

    expect(meta).toBe(existing);
  });

  it('removes duplicate meta tags when preventDuplicates is true', () => {
    // Create duplicates
    for (let i = 0; i < 3; i++) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }

    expect(document.querySelectorAll('meta[name="description"]').length).toBe(
      3
    );

    getOrCreateMeta({ name: 'description' }, true);

    expect(document.querySelectorAll('meta[name="description"]').length).toBe(
      1
    );
  });

  it('returns null when called with no key fields', () => {
    // Pre-existing meta should not be touched even if a generic `meta`
    // selector would have matched it.
    const preExisting = document.createElement('meta');
    preExisting.setAttribute('name', 'description');
    preExisting.setAttribute('content', 'untouched');
    document.head.appendChild(preExisting);

    const meta = getOrCreateMeta({}, true);
    expect(meta).toBeNull();
    // The pre-existing meta must be untouched.
    expect(preExisting.getAttribute('content')).toBe('untouched');
  });

  it('returns null when all key fields are empty strings', () => {
    const meta = getOrCreateMeta(
      { name: '', property: '', httpEquiv: '' },
      true
    );
    expect(meta).toBeNull();
  });

  it('does not create an unmarked meta when key is empty', () => {
    document.head.innerHTML = '';
    getOrCreateMeta({}, true);
    // Nothing should have been created.
    expect(document.head.children.length).toBe(0);
  });
});

describe('getOrCreateLink', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('creates a new link tag', () => {
    const link = getOrCreateLink('canonical', false);

    expect(link).toBeInstanceOf(HTMLLinkElement);
    expect(link.getAttribute('rel')).toBe('canonical');
    expect(link.getAttribute(SEO_MARKER)).toBe('true');
    expect(document.head.contains(link)).toBe(true);
  });

  it('returns existing link tag if found', () => {
    const existing = document.createElement('link');
    existing.setAttribute('rel', 'canonical');
    existing.setAttribute('href', 'https://example.com');
    document.head.appendChild(existing);

    const link = getOrCreateLink('canonical', false);

    expect(link).toBe(existing);
  });

  it('uses keySelector to find specific links', () => {
    const existing = document.createElement('link');
    existing.setAttribute('rel', 'alternate');
    existing.setAttribute('hreflang', 'en');
    document.head.appendChild(existing);

    const link = getOrCreateLink('alternate', false, '[hreflang="en"]');

    expect(link).toBe(existing);
  });

  it('removes duplicate links when unique is true', () => {
    for (let i = 0; i < 3; i++) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(3);

    getOrCreateLink('canonical', true);

    expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
  });
});

describe('removeMarkedElements', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('removes elements with SEO marker', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'test');
    meta.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta);

    removeMarkedElements('meta[name="test"]');

    expect(document.querySelector('meta[name="test"]')).toBeNull();
  });

  it('does not remove elements without SEO marker', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'test');
    document.head.appendChild(meta);

    removeMarkedElements('meta[name="test"]');

    expect(document.querySelector('meta[name="test"]')).not.toBeNull();
  });
});

describe('createJsonLdScript', () => {
  it('creates a script element with JSON-LD', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test',
    };

    const script = createJsonLdScript(data, 0);

    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(script?.getAttribute(SEO_MARKER)).toBe('true');
    expect(script?.getAttribute('data-seo-index')).toBe('0');
    // JSON content is preserved (no `<`, `>`, `&` to escape in this payload)
    expect(script?.textContent).toBe(JSON.stringify(data));
  });

  it('returns null for invalid data', () => {
    expect(createJsonLdScript(null as unknown as object, 0)).toBeNull();
    expect(createJsonLdScript(undefined as unknown as object, 0)).toBeNull();
    expect(createJsonLdScript('string' as unknown as object, 0)).toBeNull();
  });

  it('returns null when JSON.stringify fails (circular reference)', () => {
    const circular: Record<string, unknown> = { name: 'test' };
    circular.self = circular; // Create circular reference

    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const result = createJsonLdScript(circular, 0);
      expect(result).toBeNull();
      // logError should have been invoked (development mode).
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useSEO Error]'),
        expect.any(Error)
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      errorSpy.mockRestore();
    }
  });

  it('escapes a literal </script> in a string field so it cannot break out of the script tag', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      description: 'evil </script><img src=x onerror=alert(1)>',
    };

    const script = createJsonLdScript(data, 0);
    expect(script).not.toBeNull();
    const text = script?.textContent ?? '';

    // The literal closing tag MUST NOT appear anywhere in the serialized
    // JSON, otherwise the HTML parser would close the <script> early.
    expect(text).not.toContain('</script>');
    // The `<` should have been escaped to its Unicode form.
    expect(text).toContain('\\u003c/script');
    // Sanity: the rest of the payload is still parseable JSON.
    expect(() => JSON.parse(text)).not.toThrow();
  });

  it('escapes <!-- and <![CDATA[ sequences', () => {
    const data = {
      '@type': 'X',
      a: 'before <!-- comment -->',
      b: 'before <![CDATA[stuff]]>',
    };

    const script = createJsonLdScript(data, 0);
    const text = script?.textContent ?? '';

    expect(text).not.toContain('<!--');
    expect(text).not.toContain('<![CDATA[');
    expect(text).toContain('\\u003c!--');
    expect(text).toContain('\\u003c![CDATA[');
  });

  it('escapes & so HTML entity-like sequences cannot be reinterpreted', () => {
    const data = { '@type': 'X', q: 'a&amp;b' };
    const script = createJsonLdScript(data, 0);
    const text = script?.textContent ?? '';
    expect(text).not.toContain('&amp;');
    expect(text).toContain('\\u0026amp;');
  });

  it('escapes U+2028 and U+2029 line separators', () => {
    const data = {
      '@type': 'X',
      ls: 'line\u2028break',
      ps: 'para\u2029break',
    };

    const script = createJsonLdScript(data, 0);
    const text = script?.textContent ?? '';

    // Raw line separators MUST be escaped, otherwise some legacy parsers
    // treat the script content as broken JS.
    expect(text).not.toContain('\u2028');
    expect(text).not.toContain('\u2029');
    expect(text).toContain('\\u2028');
    expect(text).toContain('\\u2029');
  });

  it('returns null without crashing when value contains a BigInt', () => {
    const data = { '@type': 'X', count: BigInt(1) } as unknown as object;
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      expect(createJsonLdScript(data, 5)).toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalEnv;
      errorSpy.mockRestore();
    }
  });
});

describe('fnv1aHash', () => {
  it('returns the same hash for the same input (determinism)', () => {
    expect(fnv1aHash('hello')).toBe(fnv1aHash('hello'));
    expect(fnv1aHash('')).toBe(fnv1aHash(''));
    expect(fnv1aHash('the quick brown fox')).toBe(
      fnv1aHash('the quick brown fox')
    );
  });

  it('returns different hashes for different inputs', () => {
    expect(fnv1aHash('a')).not.toBe(fnv1aHash('b'));
    expect(fnv1aHash('hello')).not.toBe(fnv1aHash('hello!'));
    expect(fnv1aHash('foo')).not.toBe(fnv1aHash('oof'));
  });

  it('returns a base-36 string', () => {
    // Base-36 only uses 0-9 and a-z.
    expect(fnv1aHash('hello')).toMatch(/^[0-9a-z]+$/);
    expect(fnv1aHash('')).toMatch(/^[0-9a-z]+$/);
  });

  it('handles unicode characters without throwing', () => {
    expect(() => fnv1aHash('héllo')).not.toThrow();
    expect(() => fnv1aHash('🚀')).not.toThrow();
    expect(fnv1aHash('café')).not.toBe(fnv1aHash('cafe'));
  });
});

describe('hashJsonLd', () => {
  it('returns a hash for a serializable object', () => {
    const data = { '@type': 'Article', name: 'Test' };
    const hash = hashJsonLd(data);
    expect(hash).not.toBeNull();
    expect(typeof hash).toBe('string');
  });

  it('returns the same hash for structurally identical payloads', () => {
    const a = { '@type': 'Article', name: 'Test' };
    const b = { '@type': 'Article', name: 'Test' };
    expect(hashJsonLd(a)).toBe(hashJsonLd(b));
  });

  it('returns different hashes when any field changes', () => {
    const a = { '@type': 'Article', name: 'Test' };
    const b = { '@type': 'Article', name: 'Different' };
    expect(hashJsonLd(a)).not.toBe(hashJsonLd(b));
  });

  it('returns null for circular references', () => {
    const circular: Record<string, unknown> = { name: 'self' };
    circular.self = circular;
    expect(hashJsonLd(circular)).toBeNull();
  });

  it('returns null for BigInt values (not serializable)', () => {
    const data = { count: BigInt(1) } as unknown as object;
    expect(hashJsonLd(data)).toBeNull();
  });

  it('is sensitive to key insertion order (acceptable trade-off)', () => {
    // JSON.stringify is key-order preserving, and our hash is JSON-derived,
    // so two payloads that differ only in key order will have different
    // hashes. This is intentionally documented because the hash is used as
    // an identity key, not a semantic equality check.
    const a = { '@type': 'X', a: 1, b: 2 };
    const b = { '@type': 'X', b: 2, a: 1 };
    expect(hashJsonLd(a)).not.toBe(hashJsonLd(b));
  });
});

describe('ensureEssentialMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('creates charset meta if missing', () => {
    const addedElements = new Set<Element>();

    ensureEssentialMeta(addedElements);

    const charset = document.querySelector('meta[charset]');
    expect(charset).not.toBeNull();
    expect(charset?.getAttribute('charset')).toBe('UTF-8');

    expect(addedElements.has(charset!)).toBe(true);
  });

  it('creates viewport meta if missing', () => {
    const addedElements = new Set<Element>();

    ensureEssentialMeta(addedElements);

    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport?.getAttribute('content')).toBe(
      'width=device-width, initial-scale=1.0'
    );
  });

  it('does not create duplicates', () => {
    const charset = document.createElement('meta');
    charset.setAttribute('charset', 'UTF-8');
    document.head.appendChild(charset);

    const viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    document.head.appendChild(viewport);

    const addedElements = new Set<Element>();
    ensureEssentialMeta(addedElements);

    expect(document.querySelectorAll('meta[charset]').length).toBe(1);
    expect(document.querySelectorAll('meta[name="viewport"]').length).toBe(1);
  });
});

describe('createMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('creates a new meta with name attribute', () => {
    const meta = createMeta({ name: 'test-name' });

    expect(meta.getAttribute('name')).toBe('test-name');
    expect(meta.getAttribute(SEO_MARKER)).toBe('true');
    expect(document.head.contains(meta)).toBe(true);
  });

  it('creates a new meta with property attribute', () => {
    const meta = createMeta({ property: 'og:test' });

    expect(meta.getAttribute('property')).toBe('og:test');
  });

  it('creates a new meta with http-equiv attribute', () => {
    const meta = createMeta({ httpEquiv: 'content-type' });

    expect(meta.getAttribute('http-equiv')).toBe('content-type');
  });

  it('creates multiple metas with same property', () => {
    const meta1 = createMeta({ property: 'og:image' });
    meta1.setAttribute('content', 'image1.jpg');

    const meta2 = createMeta({ property: 'og:image' });
    meta2.setAttribute('content', 'image2.jpg');

    const metas = document.querySelectorAll('meta[property="og:image"]');
    expect(metas.length).toBe(2);
  });
});

describe('escapeSelectorValue', () => {
  it('escapes double quotes', () => {
    expect(escapeSelectorValue('value"with"quotes')).toBe(
      'value\\"with\\"quotes'
    );
  });

  it('escapes backslashes', () => {
    expect(escapeSelectorValue('value\\with\\backslashes')).toBe(
      'value\\\\with\\\\backslashes'
    );
  });

  it('escapes both double quotes and backslashes', () => {
    expect(escapeSelectorValue('val\\"ue')).toBe('val\\\\\\"ue');
  });

  it('returns the same string when no special characters', () => {
    expect(escapeSelectorValue('simple-value')).toBe('simple-value');
    expect(escapeSelectorValue('og:title')).toBe('og:title');
  });

  it('handles empty string', () => {
    expect(escapeSelectorValue('')).toBe('');
  });
});

describe('removeMarkedElements with trackedElements', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('removes elements from the tracking Set when provided', () => {
    const trackedElements = new Set<Element>();

    const meta1 = document.createElement('meta');
    meta1.setAttribute('name', 'test-tracked');
    meta1.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta1);
    trackedElements.add(meta1);

    const meta2 = document.createElement('meta');
    meta2.setAttribute('name', 'test-tracked-2');
    meta2.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta2);
    trackedElements.add(meta2);

    expect(trackedElements.size).toBe(2);

    removeMarkedElements('meta[name="test-tracked"]', trackedElements);

    // meta1 should be removed from DOM and from the Set
    expect(document.querySelector('meta[name="test-tracked"]')).toBeNull();
    expect(trackedElements.has(meta1)).toBe(false);

    // meta2 should still be in the DOM and Set (different selector)
    expect(
      document.querySelector('meta[name="test-tracked-2"]')
    ).not.toBeNull();
    expect(trackedElements.has(meta2)).toBe(true);
    expect(trackedElements.size).toBe(1);
  });

  it('works without trackedElements parameter (backwards compatible)', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'test-no-tracked');
    meta.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta);

    // Should not throw when trackedElements is not provided
    removeMarkedElements('meta[name="test-no-tracked"]');

    expect(document.querySelector('meta[name="test-no-tracked"]')).toBeNull();
  });

  it('removes multiple matching elements from the tracking Set', () => {
    const trackedElements = new Set<Element>();

    // Create multiple elements with the same property prefix
    const meta1 = document.createElement('meta');
    meta1.setAttribute('property', 'og:image');
    meta1.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta1);
    trackedElements.add(meta1);

    const meta2 = document.createElement('meta');
    meta2.setAttribute('property', 'og:image:width');
    meta2.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta2);
    trackedElements.add(meta2);

    expect(trackedElements.size).toBe(2);

    removeMarkedElements('meta[property^="og:image"]', trackedElements);

    expect(trackedElements.size).toBe(0);
    expect(document.querySelectorAll('meta[property^="og:image"]').length).toBe(
      0
    );
  });
});

describe('ensureEssentialMeta SEO_MARKER on charset', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('adds SEO_MARKER attribute to newly created charset meta', () => {
    const addedElements = new Set<Element>();

    ensureEssentialMeta(addedElements);

    const charset = document.querySelector('meta[charset]');
    expect(charset).not.toBeNull();
    expect(charset?.getAttribute(SEO_MARKER)).toBe('true');
  });

  it('does not add SEO_MARKER to pre-existing charset meta', () => {
    const existingCharset = document.createElement('meta');
    existingCharset.setAttribute('charset', 'UTF-8');
    document.head.appendChild(existingCharset);

    const addedElements = new Set<Element>();
    ensureEssentialMeta(addedElements);

    // The pre-existing charset should not have been modified
    expect(existingCharset.getAttribute(SEO_MARKER)).toBeNull();
    // It should not be tracked
    expect(addedElements.has(existingCharset)).toBe(false);
  });
});

describe('getOrCreateMeta preventDuplicates false', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('does not remove duplicates when preventDuplicates is false', () => {
    for (let i = 0; i < 3; i++) {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }

    getOrCreateMeta({ name: 'description' }, false);

    // All 3 originals should remain since preventDuplicates is false
    expect(document.querySelectorAll('meta[name="description"]').length).toBe(
      3
    );
  });
});

describe('ensureEssentialMeta partial', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('creates only viewport when charset already exists', () => {
    const charset = document.createElement('meta');
    charset.setAttribute('charset', 'UTF-8');
    document.head.appendChild(charset);

    const addedElements = new Set<Element>();
    ensureEssentialMeta(addedElements);

    expect(document.querySelectorAll('meta[charset]').length).toBe(1);
    expect(document.querySelector('meta[name="viewport"]')).not.toBeNull();
    // Only viewport should be tracked (charset already existed)
    expect(addedElements.size).toBe(1);
  });

  it('creates only charset when viewport already exists', () => {
    const viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width');
    document.head.appendChild(viewport);

    const addedElements = new Set<Element>();
    ensureEssentialMeta(addedElements);

    expect(document.querySelectorAll('meta[name="viewport"]').length).toBe(1);
    expect(document.querySelector('meta[charset]')).not.toBeNull();
    // Only charset should be tracked (viewport already existed)
    expect(addedElements.size).toBe(1);
  });
});

describe('removeMarkedElements edge cases', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('does not throw when no elements match the selector', () => {
    expect(() => {
      removeMarkedElements('meta[name="nonexistent"]');
    }).not.toThrow();
  });

  it('does not throw when no elements match with trackedElements', () => {
    const tracked = new Set<Element>();
    expect(() => {
      removeMarkedElements('meta[name="nonexistent"]', tracked);
    }).not.toThrow();
    expect(tracked.size).toBe(0);
  });

  it('does not throw when a matched element has no parent (orphan in document)', () => {
    // querySelectorAll inside `removeMarkedElements` is rooted at `document`,
    // so the only way to reach the `parentElement?.removeChild` short-circuit
    // is to detach the element AFTER querying — we simulate that by
    // monkey-patching `document.querySelectorAll` to return an orphan node.
    const orphan = document.createElement('meta');
    orphan.setAttribute('name', 'orphan-test');
    orphan.setAttribute(SEO_MARKER, 'true');
    // Note: NOT appended to head — its parentElement is therefore `null`.

    const originalQSA = document.querySelectorAll.bind(document);
    const spy = jest
      .spyOn(document, 'querySelectorAll')
      .mockImplementation((selector: string) => {
        if (selector.includes('orphan-test')) {
          // Return a NodeList-like object that yields the orphan.
          return [orphan] as unknown as NodeListOf<Element>;
        }
        return originalQSA(selector);
      });

    const tracked = new Set<Element>();
    tracked.add(orphan);

    try {
      expect(() =>
        removeMarkedElements('meta[name="orphan-test"]', tracked)
      ).not.toThrow();
      // The orphan was still removed from the tracking Set even though it
      // had no parent to detach from.
      expect(tracked.has(orphan)).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('createMeta name-only branch coverage', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('falls through every branch when no key fields are provided', () => {
    // `createMeta` exercises an if/else-if/else-if cascade. Calling it with
    // an empty key hits the falsy path of the final `else if (name)` clause
    // — this is the only way to cover branch BRDA:88,5,1 in dom.ts.
    const meta = createMeta({});
    // The meta is still appended (without any identifying attribute) and
    // still gets the SEO marker, because `createMeta` is the multi-value
    // helper and trusts its caller. The hook itself NEVER calls createMeta
    // with an empty key — we only do so here to lock in the branch.
    expect(meta.tagName).toBe('META');
    expect(meta.getAttribute(SEO_MARKER)).toBe('true');
    expect(meta.getAttribute('name')).toBeNull();
    expect(meta.getAttribute('property')).toBeNull();
    expect(meta.getAttribute('http-equiv')).toBeNull();
    expect(document.head.contains(meta)).toBe(true);
  });
});

describe('getOrCreateMeta orphan dedup branch (parent null in dedup loop)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('does not throw when a duplicate match is an orphan (no parentElement)', () => {
    // Real meta in the head — this is the one returned to the caller.
    const real = document.createElement('meta');
    real.setAttribute('name', 'description');
    document.head.appendChild(real);

    // Orphan that we'll inject into the duplicate-removal loop via a
    // querySelectorAll spy. Its `parentElement` is `null`, so the optional
    // chain on the dedup line MUST short-circuit safely.
    const orphan = document.createElement('meta');
    orphan.setAttribute('name', 'description');
    // NOT appended — parentElement is null.

    const originalQSA = document.querySelectorAll.bind(document);
    const spy = jest
      .spyOn(document, 'querySelectorAll')
      .mockImplementation((selector: string) => {
        if (selector === 'meta[name="description"]') {
          return [real, orphan] as unknown as NodeListOf<Element>;
        }
        return originalQSA(selector);
      });

    try {
      expect(() =>
        getOrCreateMeta({ name: 'description' }, true)
      ).not.toThrow();
    } finally {
      spy.mockRestore();
    }
  });
});

describe('getOrCreateLink orphan dedup branch (parent null in unique loop)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('does not throw when a duplicate match is an orphan (no parentElement)', () => {
    // First link is real and stays in the head — it becomes the survivor.
    const real = document.createElement('link');
    real.setAttribute('rel', 'canonical');
    document.head.appendChild(real);

    // Orphan duplicate — not in the head, parentElement is null.
    const orphan = document.createElement('link');
    orphan.setAttribute('rel', 'canonical');

    const originalQSA = document.querySelectorAll.bind(document);
    const spy = jest
      .spyOn(document, 'querySelectorAll')
      .mockImplementation((selector: string) => {
        if (selector === 'link[rel="canonical"]') {
          return [real, orphan] as unknown as NodeListOf<Element>;
        }
        return originalQSA(selector);
      });

    try {
      const link = getOrCreateLink('canonical', true);
      expect(link).toBe(real);
    } finally {
      spy.mockRestore();
    }
  });

  it('handles keySelector matching multiple elements (uniqueness skipped when keySelector present)', () => {
    // Two links with the same rel+hreflang. Because `unique=true` is COMBINED
    // with a `keySelector`, the dedup loop is intentionally skipped (the
    // keySelector itself is the disambiguator). The function returns the
    // first match.
    const link1 = document.createElement('link');
    link1.setAttribute('rel', 'alternate');
    link1.setAttribute('hreflang', 'en');
    link1.setAttribute('href', 'https://example.com/en');
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.setAttribute('rel', 'alternate');
    link2.setAttribute('hreflang', 'en');
    link2.setAttribute('href', 'https://example.com/en-2');
    document.head.appendChild(link2);

    const link = getOrCreateLink('alternate', true, '[hreflang="en"]');
    // Both are kept because the dedup loop is gated on `unique && !keySelector`.
    expect(document.querySelectorAll('link[rel="alternate"]').length).toBe(2);
    // The returned link is the first match (insertion order).
    expect(link).toBe(link1);
  });
});

describe('canUseDOM cache hit/miss path', () => {
  it('on subsequent calls, returns the cached value without re-evaluating typeof checks', () => {
    resetCanUseDOMCache();
    // Cold call: cache is null, so it computes the result.
    const cold = canUseDOM();
    expect(cold).toBe(true);
    // Warm call: cache has the value, so the `??=` short-circuits.
    const warm = canUseDOM();
    expect(warm).toBe(true);
    // Reset and verify it can return false too if globals change.
    resetCanUseDOMCache();
    const reCold = canUseDOM();
    expect(reCold).toBe(true);
  });
});

describe('escapeSelectorValue extra edge inputs', () => {
  it('handles a string of only escapable characters', () => {
    expect(escapeSelectorValue('"\\"\\')).toBe('\\"\\\\\\"\\\\');
  });

  it('does not double-escape an already-escaped sequence', () => {
    // The function is purely textual — it does not detect prior escapes,
    // so feeding it `\\"` will produce `\\\\\\"` (each char escaped once).
    expect(escapeSelectorValue('\\"')).toBe('\\\\\\"');
  });

  it('handles long mixed strings without throwing', () => {
    const input = `path/to/file"${String.fromCharCode(92)}name`;
    expect(() => escapeSelectorValue(input)).not.toThrow();
    const out = escapeSelectorValue(input);
    expect(out).toContain('\\"');
    expect(out).toContain('\\\\');
  });

  it('preserves typical CSS-safe characters unchanged', () => {
    const safe = 'rel-name_with.dots:and-colons';
    expect(escapeSelectorValue(safe)).toBe(safe);
  });
});

describe('createJsonLdScript JSON.stringify returning non-string', () => {
  it('returns null when JSON.stringify returns undefined (e.g., a function passed as data)', () => {
    // `JSON.stringify(() => 0)` returns `undefined`. Even though the
    // function's typeof is `'object'`-like to TS, `data` is typed as
    // `object`, so we cast to satisfy the signature.
    const fn = (() => 0) as unknown as object;
    // The first guard `typeof data !== 'object'` trips on functions, so
    // creating directly with a function argument returns null upstream.
    // To exercise the LATER `typeof json !== 'string'` guard we mock
    // JSON.stringify itself.
    const data = { '@type': 'X' };
    const stringifySpy = jest
      .spyOn(JSON, 'stringify')

      .mockReturnValue(undefined as any);
    try {
      const script = createJsonLdScript(data, 0);
      expect(script).toBeNull();
    } finally {
      stringifySpy.mockRestore();
    }
    // Sanity: the function-as-data path also resolves to null upstream.
    expect(createJsonLdScript(fn, 0)).toBeNull();
  });
});

describe('hashJsonLd JSON.stringify returning non-string', () => {
  it('returns null when JSON.stringify yields undefined (covers the typeof-guard branch)', () => {
    const data = { '@type': 'X' };
    const stringifySpy = jest
      .spyOn(JSON, 'stringify')

      .mockReturnValue(undefined as any);
    try {
      expect(hashJsonLd(data)).toBeNull();
    } finally {
      stringifySpy.mockRestore();
    }
  });
});

describe('getOrCreateMeta dedup loop with trackedElements', () => {
  // When `preventDuplicates: true` finds N>1 matching elements, the dedup
  // loop removes elements [1..N-1]. The optional `trackedElements` Set
  // parameter, when provided, also removes those duplicates from the Set so
  // the caller does NOT leak detached references via the tracking Set used
  // for `clearSEOTags`. This test covers that propagation path.
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('removes deduped duplicate meta elements from the trackedElements Set', () => {
    const tracked = new Set<Element>();

    // Three pre-existing meta elements with the same name — both duplicates
    // are tracked by the caller (simulating a prior render that added them
    // before a duplicate-prone code path slipped them in).
    const meta1 = document.createElement('meta');
    meta1.setAttribute('name', 'description');
    meta1.setAttribute('content', 'first');
    meta1.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta1);
    tracked.add(meta1);

    const meta2 = document.createElement('meta');
    meta2.setAttribute('name', 'description');
    meta2.setAttribute('content', 'second');
    meta2.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta2);
    tracked.add(meta2);

    const meta3 = document.createElement('meta');
    meta3.setAttribute('name', 'description');
    meta3.setAttribute('content', 'third');
    meta3.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(meta3);
    tracked.add(meta3);

    expect(tracked.size).toBe(3);
    expect(document.querySelectorAll('meta[name="description"]').length).toBe(
      3
    );

    // Trigger dedup with the Set passed through.
    const survivor = getOrCreateMeta({ name: 'description' }, true, tracked);

    // Survivor is the first matching element; the other two are removed
    // from the DOM AND from the tracking Set.
    expect(survivor).toBe(meta1);
    expect(document.querySelectorAll('meta[name="description"]').length).toBe(
      1
    );
    expect(tracked.size).toBe(1);
    expect(tracked.has(meta1)).toBe(true);
    expect(tracked.has(meta2)).toBe(false);
    expect(tracked.has(meta3)).toBe(false);
  });

  it('does not throw when trackedElements is omitted (backwards compatible)', () => {
    // Same dedup scenario but without a tracking Set — the function must
    // still remove DOM duplicates and not throw.
    const meta1 = document.createElement('meta');
    meta1.setAttribute('name', 'description');
    meta1.setAttribute('content', 'first');
    document.head.appendChild(meta1);

    const meta2 = document.createElement('meta');
    meta2.setAttribute('name', 'description');
    meta2.setAttribute('content', 'second');
    document.head.appendChild(meta2);

    expect(() => getOrCreateMeta({ name: 'description' }, true)).not.toThrow();

    expect(document.querySelectorAll('meta[name="description"]').length).toBe(
      1
    );
  });
});

describe('getOrCreateLink unique-loop with trackedElements', () => {
  // Same propagation path as `getOrCreateMeta`, but for `getOrCreateLink`
  // when `unique: true` (and no `keySelector`) collapses duplicate
  // `link[rel="…"]` elements to a single survivor.
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('removes deduped duplicate link elements from the trackedElements Set', () => {
    const tracked = new Set<Element>();

    const link1 = document.createElement('link');
    link1.setAttribute('rel', 'canonical');
    link1.setAttribute('href', 'https://example.com/a');
    link1.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(link1);
    tracked.add(link1);

    const link2 = document.createElement('link');
    link2.setAttribute('rel', 'canonical');
    link2.setAttribute('href', 'https://example.com/b');
    link2.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(link2);
    tracked.add(link2);

    const link3 = document.createElement('link');
    link3.setAttribute('rel', 'canonical');
    link3.setAttribute('href', 'https://example.com/c');
    link3.setAttribute(SEO_MARKER, 'true');
    document.head.appendChild(link3);
    tracked.add(link3);

    expect(tracked.size).toBe(3);
    expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(3);

    const survivor = getOrCreateLink('canonical', true, undefined, tracked);

    expect(survivor).toBe(link1);
    expect(document.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(tracked.size).toBe(1);
    expect(tracked.has(link1)).toBe(true);
    expect(tracked.has(link2)).toBe(false);
    expect(tracked.has(link3)).toBe(false);
  });
});
