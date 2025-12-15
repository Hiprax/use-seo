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

  it('handles empty key gracefully', () => {
    const meta = getOrCreateMeta({}, true);
    expect(meta).toBeInstanceOf(HTMLMetaElement);
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

    const result = createJsonLdScript(circular, 0);
    expect(result).toBeNull();
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
