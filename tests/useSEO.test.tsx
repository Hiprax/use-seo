/**
 * Comprehensive tests for useSEO hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSEO } from '../src/useSEO';
import { resetCanUseDOMCache, SEO_MARKER } from '../src/utils/dom';

// Helper to get meta content
function getMetaContent(selector: string): string | null {
  const meta = document.querySelector(selector);
  return meta?.getAttribute('content') ?? null;
}

// Helper to get link href
function getLinkHref(selector: string): string | null {
  const link = document.querySelector(selector);
  return link?.getAttribute('href') ?? null;
}

describe('useSEO Hook', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  describe('Basic Functionality', () => {
    it('sets document title', () => {
      renderHook(() => useSEO({ title: 'Test Page' }));
      expect(document.title).toBe('Test Page');
    });

    it('sets meta description', () => {
      renderHook(() =>
        useSEO({ description: 'Test description for the page' })
      );
      expect(getMetaContent('meta[name="description"]')).toBe(
        'Test description for the page'
      );
    });

    it('sets meta keywords', () => {
      renderHook(() => useSEO({ keywords: 'test, seo, react' }));
      expect(getMetaContent('meta[name="keywords"]')).toBe('test, seo, react');
    });

    it('sets author meta', () => {
      renderHook(() => useSEO({ author: 'John Doe' }));
      expect(getMetaContent('meta[name="author"]')).toBe('John Doe');
    });

    it('sets html lang attribute', () => {
      renderHook(() => useSEO({ language: 'en' }));
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });
  });

  describe('Title Formatting', () => {
    it('applies title suffix', () => {
      renderHook(() => useSEO({ title: 'Contact', titleSuffix: 'My Site' }));
      expect(document.title).toBe('Contact | My Site');
    });

    it('applies title prefix', () => {
      renderHook(() => useSEO({ title: 'Contact', titlePrefix: 'My Site' }));
      expect(document.title).toBe('My Site | Contact');
    });

    it('applies title template with %s', () => {
      renderHook(() =>
        useSEO({ title: 'Contact', titleTemplate: '%s - My Website' })
      );
      expect(document.title).toBe('Contact - My Website');
    });

    it('applies title template with {title}', () => {
      renderHook(() =>
        useSEO({ title: 'Contact', titleTemplate: '{title} | Brand' })
      );
      expect(document.title).toBe('Contact | Brand');
    });
  });

  describe('Open Graph', () => {
    it('sets og:type', () => {
      renderHook(() => useSEO({ ogType: 'article' }));
      expect(getMetaContent('meta[property="og:type"]')).toBe('article');
    });

    it('defaults og:type to website', () => {
      renderHook(() => useSEO({ title: 'Test' }));
      expect(getMetaContent('meta[property="og:type"]')).toBe('website');
    });

    it('sets og:title', () => {
      renderHook(() => useSEO({ ogTitle: 'OG Title' }));
      expect(getMetaContent('meta[property="og:title"]')).toBe('OG Title');
    });

    it('falls back og:title to formatted title', () => {
      renderHook(() => useSEO({ title: 'Page Title' }));
      expect(getMetaContent('meta[property="og:title"]')).toBe('Page Title');
    });

    it('sets og:description', () => {
      renderHook(() => useSEO({ ogDescription: 'OG Description' }));
      expect(getMetaContent('meta[property="og:description"]')).toBe(
        'OG Description'
      );
    });

    it('falls back og:description to description', () => {
      renderHook(() => useSEO({ description: 'Page description' }));
      expect(getMetaContent('meta[property="og:description"]')).toBe(
        'Page description'
      );
    });

    it('sets og:site_name', () => {
      renderHook(() => useSEO({ ogSiteName: 'My Website' }));
      expect(getMetaContent('meta[property="og:site_name"]')).toBe(
        'My Website'
      );
    });

    it('sets og:url', () => {
      renderHook(() => useSEO({ ogUrl: 'https://example.com/page' }));
      expect(getMetaContent('meta[property="og:url"]')).toBe(
        'https://example.com/page'
      );
    });

    it('sets og:locale', () => {
      renderHook(() => useSEO({ ogLocale: 'en_US' }));
      expect(getMetaContent('meta[property="og:locale"]')).toBe('en_US');
    });

    it('sets og:locale:alternate', () => {
      renderHook(() => useSEO({ ogLocaleAlternates: ['en_GB', 'de_DE'] }));
      const alternates = document.querySelectorAll(
        'meta[property="og:locale:alternate"]'
      );
      expect(alternates.length).toBe(2);
    });

    it('sets single og:image', () => {
      renderHook(() =>
        useSEO({
          ogImage: 'https://example.com/image.jpg',
          ogImageWidth: 1200,
          ogImageHeight: 630,
          ogImageAlt: 'Image alt text',
        })
      );
      expect(getMetaContent('meta[property="og:image"]')).toBe(
        'https://example.com/image.jpg'
      );
      expect(getMetaContent('meta[property="og:image:width"]')).toBe('1200');
      expect(getMetaContent('meta[property="og:image:height"]')).toBe('630');
      expect(getMetaContent('meta[property="og:image:alt"]')).toBe(
        'Image alt text'
      );
    });

    it('sets og:image:secure_url for https images', () => {
      renderHook(() => useSEO({ ogImage: 'https://example.com/image.jpg' }));
      expect(getMetaContent('meta[property="og:image:secure_url"]')).toBe(
        'https://example.com/image.jpg'
      );
    });

    it('infers og:image:type from extension', () => {
      renderHook(() => useSEO({ ogImage: 'https://example.com/image.png' }));
      expect(getMetaContent('meta[property="og:image:type"]')).toBe(
        'image/png'
      );
    });

    it('sets multiple og:images', () => {
      renderHook(() =>
        useSEO({
          ogImages: [
            {
              url: 'https://example.com/image1.jpg',
              width: 1200,
              height: 630,
              alt: 'Image 1',
            },
            {
              url: 'https://example.com/image2.png',
              width: 800,
              height: 600,
              type: 'image/png',
            },
          ],
        })
      );
      const images = document.querySelectorAll('meta[property="og:image"]');
      expect(images.length).toBe(2);
    });

    it('sets og:image secureUrl when provided', () => {
      renderHook(() =>
        useSEO({
          ogImages: [
            {
              url: 'http://example.com/image.jpg',
              secureUrl: 'https://example.com/image.jpg',
            },
          ],
        })
      );
      expect(getMetaContent('meta[property="og:image:secure_url"]')).toBe(
        'https://example.com/image.jpg'
      );
    });
  });

  describe('Twitter Card', () => {
    it('sets twitter:card', () => {
      renderHook(() => useSEO({ twitterCard: 'summary' }));
      expect(getMetaContent('meta[name="twitter:card"]')).toBe('summary');
    });

    it('defaults twitter:card to summary_large_image', () => {
      renderHook(() => useSEO({ title: 'Test' }));
      expect(getMetaContent('meta[name="twitter:card"]')).toBe(
        'summary_large_image'
      );
    });

    it('sets twitter:title', () => {
      renderHook(() => useSEO({ twitterTitle: 'Twitter Title' }));
      expect(getMetaContent('meta[name="twitter:title"]')).toBe(
        'Twitter Title'
      );
    });

    it('falls back twitter:title to og:title or title', () => {
      renderHook(() => useSEO({ title: 'Page Title' }));
      expect(getMetaContent('meta[name="twitter:title"]')).toBe('Page Title');
    });

    it('sets twitter:description', () => {
      renderHook(() => useSEO({ twitterDescription: 'Twitter description' }));
      expect(getMetaContent('meta[name="twitter:description"]')).toBe(
        'Twitter description'
      );
    });

    it('sets twitter:image', () => {
      renderHook(() =>
        useSEO({ twitterImage: 'https://example.com/twitter.jpg' })
      );
      expect(getMetaContent('meta[name="twitter:image"]')).toBe(
        'https://example.com/twitter.jpg'
      );
    });

    it('falls back twitter:image to og:image', () => {
      renderHook(() => useSEO({ ogImage: 'https://example.com/og.jpg' }));
      expect(getMetaContent('meta[name="twitter:image"]')).toBe(
        'https://example.com/og.jpg'
      );
    });

    it('falls back twitter:image to first ogImages entry', () => {
      renderHook(() =>
        useSEO({
          ogImages: [{ url: 'https://example.com/first.jpg' }],
        })
      );
      expect(getMetaContent('meta[name="twitter:image"]')).toBe(
        'https://example.com/first.jpg'
      );
    });

    it('sets twitter:image:alt', () => {
      renderHook(() =>
        useSEO({
          twitterImage: 'https://example.com/image.jpg',
          twitterImageAlt: 'Alt text',
        })
      );
      expect(getMetaContent('meta[name="twitter:image:alt"]')).toBe('Alt text');
    });

    it('sets twitter:creator', () => {
      renderHook(() => useSEO({ twitterCreator: '@johndoe' }));
      expect(getMetaContent('meta[name="twitter:creator"]')).toBe('@johndoe');
    });

    it('sets twitter:site', () => {
      renderHook(() => useSEO({ twitterSite: '@mysite' }));
      expect(getMetaContent('meta[name="twitter:site"]')).toBe('@mysite');
    });
  });

  describe('Article Dates', () => {
    it('sets article:published_time', () => {
      renderHook(() => useSEO({ publishedTime: '2024-01-15T10:30:00Z' }));
      expect(getMetaContent('meta[property="article:published_time"]')).toBe(
        '2024-01-15T10:30:00Z'
      );
    });

    it('sets article:modified_time', () => {
      renderHook(() => useSEO({ modifiedTime: '2024-02-01T14:20:00Z' }));
      expect(getMetaContent('meta[property="article:modified_time"]')).toBe(
        '2024-02-01T14:20:00Z'
      );
    });

    it('sets article:expiration_time', () => {
      renderHook(() => useSEO({ expirationTime: '2025-12-31T23:59:59Z' }));
      expect(getMetaContent('meta[property="article:expiration_time"]')).toBe(
        '2025-12-31T23:59:59Z'
      );
    });
  });

  describe('Canonical and Links', () => {
    it('sets canonical link', () => {
      renderHook(() => useSEO({ canonical: 'https://example.com/page' }));
      expect(getLinkHref('link[rel="canonical"]')).toBe(
        'https://example.com/page'
      );
    });

    it('auto-generates canonical from current URL', () => {
      renderHook(() => useSEO({ autoCanonical: true }));
      expect(getLinkHref('link[rel="canonical"]')).toContain('example.com');
    });

    it('sets prev pagination link', () => {
      renderHook(() => useSEO({ prev: 'https://example.com/page?page=1' }));
      expect(getLinkHref('link[rel="prev"]')).toBe(
        'https://example.com/page?page=1'
      );
    });

    it('sets next pagination link', () => {
      renderHook(() => useSEO({ next: 'https://example.com/page?page=3' }));
      expect(getLinkHref('link[rel="next"]')).toBe(
        'https://example.com/page?page=3'
      );
    });

    it('sets hreflang links', () => {
      renderHook(() =>
        useSEO({
          hreflangs: [
            { href: 'https://example.com/', hrefLang: 'x-default' },
            { href: 'https://example.com/en/', hrefLang: 'en' },
            { href: 'https://example.com/de/', hrefLang: 'de' },
          ],
        })
      );
      const hreflangs = document.querySelectorAll(
        'link[rel="alternate"][hreflang]'
      );
      expect(hreflangs.length).toBe(3);
      expect(hreflangs[0]?.getAttribute('hreflang')).toBe('x-default');
      expect(hreflangs[1]?.getAttribute('hreflang')).toBe('en');
      expect(hreflangs[2]?.getAttribute('hreflang')).toBe('de');
    });
  });

  describe('Robots', () => {
    it('sets robots meta from string', () => {
      renderHook(() => useSEO({ robots: 'noindex,nofollow' }));
      expect(getMetaContent('meta[name="robots"]')).toBe('noindex,nofollow');
    });

    it('sets robots meta from object', () => {
      renderHook(() =>
        useSEO({
          robots: {
            index: false,
            follow: false,
            noarchive: true,
          },
        })
      );
      const content = getMetaContent('meta[name="robots"]');
      expect(content).toContain('noindex');
      expect(content).toContain('nofollow');
      expect(content).toContain('noarchive');
    });

    it('sets googlebot meta', () => {
      renderHook(() =>
        useSEO({
          robots: {
            index: true,
            googlebot: 'noindex',
          },
        })
      );
      expect(getMetaContent('meta[name="googlebot"]')).toBe('noindex');
    });

    it('handles deprecated noindex flag', () => {
      renderHook(() => useSEO({ noindex: true }));
      expect(getMetaContent('meta[name="robots"]')).toContain('noindex');
    });

    it('handles deprecated nofollow flag', () => {
      renderHook(() => useSEO({ nofollow: true }));
      expect(getMetaContent('meta[name="robots"]')).toContain('nofollow');
    });

    it('handles deprecated noarchive flag', () => {
      renderHook(() => useSEO({ noarchive: true }));
      expect(getMetaContent('meta[name="robots"]')).toContain('noarchive');
    });

    it('handles deprecated nosnippet flag', () => {
      renderHook(() => useSEO({ nosnippet: true }));
      expect(getMetaContent('meta[name="robots"]')).toContain('nosnippet');
    });

    it('handles deprecated noimageindex flag', () => {
      renderHook(() => useSEO({ noimageindex: true }));
      expect(getMetaContent('meta[name="robots"]')).toContain('noimageindex');
    });

    it('robots prop takes priority over deprecated flags', () => {
      renderHook(() =>
        useSEO({
          robots: 'index,follow',
          noindex: true,
          nofollow: true,
        })
      );
      expect(getMetaContent('meta[name="robots"]')).toBe('index,follow');
    });

    it('removes robots meta when not needed', () => {
      const { rerender } = renderHook(
        (props: { robots?: string }) => useSEO(props),
        { initialProps: { robots: 'noindex' } as { robots?: string } }
      );
      expect(getMetaContent('meta[name="robots"]')).toBe('noindex');

      rerender({});
      // The marked robots meta should be removed from the DOM
      const markedRobots = document.querySelector(
        `meta[name="robots"][${SEO_MARKER}="true"]`
      );
      expect(markedRobots).toBeNull();
    });
  });

  describe('Structured Data (JSON-LD)', () => {
    it('adds single structured data script', () => {
      renderHook(() =>
        useSEO({
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Test Article',
          },
        })
      );
      const script = document.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(script).not.toBeNull();
      const content = JSON.parse(script?.textContent ?? '{}') as Record<
        string,
        unknown
      >;
      expect(content['@type']).toBe('Article');
    });

    it('adds multiple structured data scripts', () => {
      renderHook(() =>
        useSEO({
          structuredData: [
            { '@context': 'https://schema.org', '@type': 'Article' },
            { '@context': 'https://schema.org', '@type': 'BreadcrumbList' },
          ],
        })
      );
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      expect(scripts.length).toBe(2);
    });

    it('marks structured data scripts with SEO marker', () => {
      renderHook(() =>
        useSEO({
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Article',
          },
        })
      );
      const script = document.querySelector(
        `script[type="application/ld+json"][${SEO_MARKER}="true"]`
      );
      expect(script).not.toBeNull();
    });
  });

  describe('Additional Tags', () => {
    it('adds additional meta tags', () => {
      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { name: 'theme-color', content: '#000000' },
            { property: 'fb:app_id', content: '123456' },
            { httpEquiv: 'content-language', content: 'en' },
          ],
        })
      );
      expect(getMetaContent('meta[name="theme-color"]')).toBe('#000000');
      expect(getMetaContent('meta[property="fb:app_id"]')).toBe('123456');
      expect(getMetaContent('meta[http-equiv="content-language"]')).toBe('en');
    });

    it('adds additional link tags', () => {
      renderHook(() =>
        useSEO({
          additionalLinkTags: [
            { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
            {
              rel: 'preconnect',
              href: 'https://fonts.googleapis.com',
              crossOrigin: 'anonymous',
            },
          ],
        })
      );
      expect(getLinkHref('link[rel="icon"]')).toBe('/favicon.ico');
      expect(getLinkHref('link[rel="preconnect"]')).toBe(
        'https://fonts.googleapis.com'
      );
    });

    it('skips additional tags without content/href', () => {
      renderHook(() =>
        useSEO({
          additionalMetaTags: [{ name: 'empty', content: '' }],
          additionalLinkTags: [{ rel: 'empty', href: '' }],
        })
      );
      expect(document.querySelector('meta[name="empty"]')).toBeNull();
      expect(document.querySelector('link[rel="empty"]')).toBeNull();
    });
  });

  describe('Essential Meta Tags', () => {
    it('ensures charset meta exists', () => {
      renderHook(() => useSEO({ title: 'Test' }));
      const charset = document.querySelector('meta[charset]');
      expect(charset).not.toBeNull();
      expect(charset?.getAttribute('charset')).toBe('UTF-8');
    });

    it('ensures viewport meta exists', () => {
      renderHook(() => useSEO({ title: 'Test' }));
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).not.toBeNull();
      expect(viewport?.getAttribute('content')).toContain('width=device-width');
    });

    it('does not duplicate essential meta tags', () => {
      // Add existing charset
      const charset = document.createElement('meta');
      charset.setAttribute('charset', 'UTF-8');
      document.head.appendChild(charset);

      renderHook(() => useSEO({ title: 'Test' }));
      expect(document.querySelectorAll('meta[charset]').length).toBe(1);
    });
  });

  describe('Hook Return Methods', () => {
    it('updateMetaTag updates meta with key object', () => {
      const { result } = renderHook(() => useSEO({}));

      act(() => {
        result.current.updateMetaTag({ name: 'custom-meta' }, 'custom value');
      });

      expect(getMetaContent('meta[name="custom-meta"]')).toBe('custom value');
    });

    it('updateMetaTag supports legacy string signature', () => {
      const { result } = renderHook(() => useSEO({}));

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
        (result.current.updateMetaTag as any)('custom-meta', 'custom value');
      });

      expect(getMetaContent('meta[name="custom-meta"]')).toBe('custom value');
    });

    it('updateMetaTag validates URLs', () => {
      const { result } = renderHook(() =>
        useSEO({
          validateUrls: true,
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      act(() => {
        // Use a URL with invalid characters that can't be a valid relative or absolute URL
        result.current.updateMetaTag({ property: 'og:url' }, 'http://[invalid');
      });

      // Should not set invalid URL (http://[invalid is truly invalid)
      // og:url should be null because autoCanonical is false and we didn't set ogUrl
      expect(getMetaContent('meta[property="og:url"]')).toBeNull();
    });

    it('updateLinkTag creates link tags', () => {
      const { result } = renderHook(() => useSEO({}));

      act(() => {
        result.current.updateLinkTag(
          'stylesheet',
          'https://example.com/style.css',
          {
            type: 'text/css',
          }
        );
      });

      expect(getLinkHref('link[rel="stylesheet"]')).toBe(
        'https://example.com/style.css'
      );
    });

    it('updateLinkTag supports legacy signature', () => {
      const { result } = renderHook(() => useSEO({}));

      act(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
        result.current.updateLinkTag(
          'icon',
          'https://example.com/favicon.ico',
          'image/x-icon',
          '16x16'
        );
      });

      const link = document.querySelector('link[rel="icon"]');
      expect(link?.getAttribute('href')).toBe(
        'https://example.com/favicon.ico'
      );
      expect(link?.getAttribute('type')).toBe('image/x-icon');
      expect(link?.getAttribute('sizes')).toBe('16x16');
    });

    it('clearSEOTags removes all added elements', () => {
      const { result } = renderHook(() =>
        useSEO({
          title: 'Test',
          description: 'Description',
          ogTitle: 'OG Title',
        })
      );

      // Should have meta tags
      expect(document.querySelector('meta[name="description"]')).not.toBeNull();
      expect(
        document.querySelector('meta[property="og:title"]')
      ).not.toBeNull();

      act(() => {
        result.current.clearSEOTags();
      });

      // Elements with the SEO marker that were tracked should be removed
      const markedDescription = document.querySelector(
        `meta[name="description"][${SEO_MARKER}="true"]`
      );
      expect(markedDescription).toBeNull();

      const markedOgTitle = document.querySelector(
        `meta[property="og:title"][${SEO_MARKER}="true"]`
      );
      expect(markedOgTitle).toBeNull();
    });

    it('getCurrentSEO returns current config snapshot', () => {
      const { result } = renderHook(() =>
        useSEO({
          title: 'Test Title',
          description: 'Test Description',
        })
      );

      const config = result.current.getCurrentSEO();
      expect(config.title).toBe('Test Title');
      expect(config.description).toBe('Test Description');
    });
  });

  describe('Change Detection', () => {
    it('does not update when props have not changed', () => {
      const onTitleChange = jest.fn();
      const originalTitle = document.title;

      Object.defineProperty(document, 'title', {
        set: onTitleChange,
        get: () => 'Test',
        configurable: true,
      });

      const { rerender } = renderHook((props) => useSEO(props), {
        initialProps: { title: 'Test' },
      });

      const initialCalls = onTitleChange.mock.calls.length;

      // Rerender with same props
      rerender({ title: 'Test' });

      // Should not call set again for same value
      expect(onTitleChange.mock.calls.length).toBe(initialCalls);

      // Restore
      Object.defineProperty(document, 'title', {
        value: originalTitle,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('URL Validation', () => {
    it('skips invalid URLs when validateUrls is true', () => {
      renderHook(() =>
        useSEO({
          ogImage: 'http://[invalid',
          validateUrls: true,
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      // Truly invalid URL should not be set as og:image
      expect(getMetaContent('meta[property="og:image"]')).toBeNull();
    });

    it('allows relative URLs', () => {
      renderHook(() =>
        useSEO({
          canonical: '/page',
          validateUrls: true,
          enableWarnings: false,
        })
      );

      // Relative URL should be normalized
      const canonical = getLinkHref('link[rel="canonical"]');
      expect(canonical).toContain('/page');
    });
  });

  describe('Prevent Duplicates', () => {
    it('prevents duplicate meta tags when preventDuplicates is true', () => {
      // Add existing meta
      const existing = document.createElement('meta');
      existing.setAttribute('name', 'description');
      existing.setAttribute('content', 'existing');
      document.head.appendChild(existing);

      renderHook(() =>
        useSEO({
          description: 'new description',
          preventDuplicates: true,
        })
      );

      expect(document.querySelectorAll('meta[name="description"]').length).toBe(
        1
      );
      expect(getMetaContent('meta[name="description"]')).toBe(
        'new description'
      );
    });
  });

  describe('Warnings', () => {
    it('warns about short titles when enableWarnings is true', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          title: 'Short',
          enableWarnings: true,
        })
      );

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('warns about long titles when enableWarnings is true', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          title: 'A'.repeat(70),
          enableWarnings: true,
        })
      );

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('warns about missing title', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() => useSEO({ enableWarnings: true }));

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('warns about missing image alt text', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          ogImage: 'https://example.com/image.jpg',
          enableWarnings: true,
        })
      );

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});

describe('useSEO Default Export', () => {
  it('exports useSEO as default', async () => {
    const module = await import('../src/useSEO');
    expect(module.default).toBe(module.useSEO);
  });
});

describe('Additional Edge Cases', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('updateLinkTag validates URLs and skips invalid ones', () => {
    const { result } = renderHook(() =>
      useSEO({ validateUrls: true, enableWarnings: true })
    );

    act(() => {
      // Use truly invalid URL
      result.current.updateLinkTag('stylesheet', 'http://[invalid', {});
    });

    // Should not have created a link with invalid URL
    // (canonical may exist from auto-canonical, but not the invalid stylesheet)
    expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
  });

  it('updateLinkTag supports legacy signature with all parameters', () => {
    const { result } = renderHook(() => useSEO({}));

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
      (result.current.updateLinkTag as any)(
        'preload',
        'https://example.com/font.woff2',
        'font/woff2',
        undefined,
        undefined,
        undefined,
        'anonymous'
      );
    });

    const link = document.querySelector('link[rel="preload"]');
    expect(link?.getAttribute('type')).toBe('font/woff2');
    expect(link?.getAttribute('crossorigin')).toBe('anonymous');
  });

  it('skips empty href in updateLinkTag', () => {
    const { result } = renderHook(() => useSEO({}));

    act(() => {
      result.current.updateLinkTag('stylesheet', '', {});
      result.current.updateLinkTag('stylesheet', '   ', {});
    });

    expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
  });

  it('warns about description length', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    // Short description
    renderHook(() =>
      useSEO({
        description: 'Short',
        enableWarnings: true,
      })
    );

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('warns about long description', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        description: 'A'.repeat(170),
        enableWarnings: true,
      })
    );

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('warns about too many keywords', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        keywords: Array(15).fill('keyword').join(','),
        enableWarnings: true,
      })
    );

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('warns about missing canonical when autoCanonical is false', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        autoCanonical: false,
        enableWarnings: true,
      })
    );

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('handles link tag with unique option in modern signature', () => {
    const { result } = renderHook(() => useSEO({}));

    act(() => {
      result.current.updateLinkTag(
        'manifest',
        'https://example.com/manifest1.json',
        {},
        true
      );
    });

    act(() => {
      result.current.updateLinkTag(
        'manifest',
        'https://example.com/manifest2.json',
        {},
        true
      );
    });

    // With unique=true, there should only be one manifest link
    expect(document.querySelectorAll('link[rel="manifest"]').length).toBe(1);
  });

  it('handles additionalLinkTags with all attributes', () => {
    renderHook(() =>
      useSEO({
        additionalLinkTags: [
          {
            rel: 'preload',
            href: 'https://example.com/font.woff2',
            as: 'font',
            type: 'font/woff2',
            crossOrigin: 'anonymous',
            media: 'all',
            sizes: '16x16',
            hrefLang: 'en',
          },
        ],
      })
    );

    const link = document.querySelector('link[rel="preload"]');
    expect(link?.getAttribute('as')).toBe('font');
    expect(link?.getAttribute('type')).toBe('font/woff2');
    expect(link?.getAttribute('crossorigin')).toBe('anonymous');
  });

  it('handles invalid structured data gracefully', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        structuredData: [
          null as unknown as { [key: string]: unknown },
          { '@type': 'Article' },
        ],
        enableWarnings: true,
      })
    );

    // Should have created one valid script (not the null one)
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scripts.length).toBe(1);
    warnSpy.mockRestore();
  });

  it('skips empty content in updateMetaTag', () => {
    const { result } = renderHook(() => useSEO({}));

    act(() => {
      result.current.updateMetaTag({ name: 'test-empty' }, '');
      result.current.updateMetaTag({ name: 'test-whitespace' }, '   ');
    });

    expect(document.querySelector('meta[name="test-empty"]')).toBeNull();
    expect(document.querySelector('meta[name="test-whitespace"]')).toBeNull();
  });

  it('does not warn about OG image alt when ogImages have alt', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        title: 'A title that is long enough for good SEO practices',
        description:
          'A test description that is definitely long enough for good SEO practices and meets the minimum character requirement',
        canonical: 'https://example.com/test',
        ogImages: [
          {
            url: 'https://example.com/image.jpg',
            alt: 'Image has alt text',
          },
        ],
        twitterImageAlt: 'Twitter image alt',
        enableWarnings: true,
      })
    );

    // Should not warn about missing alt since it's provided
    const altWarnings = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('OG image')
    );
    expect(altWarnings.length).toBe(0);
    warnSpy.mockRestore();
  });

  it('titleSeparator prop customizes the separator', () => {
    renderHook(() =>
      useSEO({
        title: 'Contact',
        titleSuffix: 'My Site',
        titleSeparator: ' - ',
      })
    );
    expect(document.title).toBe('Contact - My Site');
  });

  it('titleSeparator prop works with titlePrefix', () => {
    renderHook(() =>
      useSEO({
        title: 'Contact',
        titlePrefix: 'My Site',
        titleSeparator: ' :: ',
      })
    );
    expect(document.title).toBe('My Site :: Contact');
  });

  it('skips invalid ogImage URL when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        ogImage: 'http://[invalid',
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    // og:image should not be set for invalid URL
    expect(getMetaContent('meta[property="og:image"]')).toBeNull();
    warnSpy.mockRestore();
  });

  it('sets valid ogImage URL when validateUrls is true', () => {
    renderHook(() =>
      useSEO({
        ogImage: 'https://example.com/valid.jpg',
        validateUrls: true,
        enableWarnings: false,
        autoCanonical: false,
      })
    );

    expect(getMetaContent('meta[property="og:image"]')).toBe(
      'https://example.com/valid.jpg'
    );
  });

  it('skips invalid ogImages entries when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        ogImages: [
          { url: 'http://[invalid', alt: 'Bad image' },
          { url: 'https://example.com/valid.jpg', alt: 'Good image' },
        ],
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    // Only the valid image should be created
    const images = document.querySelectorAll('meta[property="og:image"]');
    expect(images.length).toBe(1);
    expect(images[0]?.getAttribute('content')).toBe(
      'https://example.com/valid.jpg'
    );
    warnSpy.mockRestore();
  });

  it('skips invalid twitterImage URL when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        twitterImage: 'http://[invalid',
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    // twitter:image should not be set for invalid URL
    expect(getMetaContent('meta[name="twitter:image"]')).toBeNull();
    warnSpy.mockRestore();
  });

  it('additionalMetaTags without any key identifier are skipped', () => {
    renderHook(() =>
      useSEO({
        additionalMetaTags: [
          // This tag has no name, property, or httpEquiv - should be skipped
          { content: 'no-key-tag' } as { content: string },
          // This tag has a name - should be created
          { name: 'valid-tag', content: 'valid content' },
        ],
      })
    );

    expect(getMetaContent('meta[name="valid-tag"]')).toBe('valid content');
    // The tag without any key should not have been created
    // We can verify by checking there's no meta with content "no-key-tag"
    const allMetas = document.querySelectorAll('meta');
    const noKeyMeta = Array.from(allMetas).find(
      (m) => m.getAttribute('content') === 'no-key-tag'
    );
    expect(noKeyMeta).toBeUndefined();
  });

  it('elements removed via removeMarkedElements are cleaned from addedElements', () => {
    // Render hook with ogImages, then re-render with different ogImages.
    // The removeMarkedElements call should clean elements from the Set,
    // preventing stale references (memory leak).
    const { result, rerender } = renderHook(
      (
        props: {
          ogImages?: { url: string; alt?: string }[];
          enableWarnings?: boolean;
        } = {}
      ) => useSEO(props),
      {
        initialProps: {
          ogImages: [
            {
              url: 'https://example.com/image1.jpg',
              alt: 'Image 1',
            },
          ],
          enableWarnings: false,
        },
      }
    );

    // First render should have og:image tags
    expect(getMetaContent('meta[property="og:image"]')).toBe(
      'https://example.com/image1.jpg'
    );

    // Re-render with different images
    rerender({
      ogImages: [
        {
          url: 'https://example.com/image2.jpg',
          alt: 'Image 2',
        },
      ],
      enableWarnings: false,
    });

    // The new image should be present
    expect(getMetaContent('meta[property="og:image"]')).toBe(
      'https://example.com/image2.jpg'
    );

    // clearSEOTags should clear everything that is still tracked
    act(() => {
      result.current.clearSEOTags();
    });

    // After clearing, og:image for image2 should be removed
    // The old image1 references should NOT remain (memory leak fix)
    const remainingOgImages = document.querySelectorAll(
      `meta[property="og:image"][${SEO_MARKER}="true"]`
    );
    expect(remainingOgImages.length).toBe(0);
  });

  it('ogImages takes precedence over ogImage when both provided', () => {
    renderHook(() =>
      useSEO({
        ogImage: 'https://example.com/single.jpg',
        ogImages: [
          { url: 'https://example.com/multi1.jpg', alt: 'Multi 1' },
          { url: 'https://example.com/multi2.jpg', alt: 'Multi 2' },
        ],
      })
    );

    const images = document.querySelectorAll('meta[property="og:image"]');
    expect(images.length).toBe(2);
    expect(images[0]?.getAttribute('content')).toBe(
      'https://example.com/multi1.jpg'
    );
    expect(images[1]?.getAttribute('content')).toBe(
      'https://example.com/multi2.jpg'
    );
  });

  it('falls back twitter:title to ogTitle when ogTitle is set', () => {
    renderHook(() =>
      useSEO({
        title: 'Page Title',
        ogTitle: 'OG Specific Title',
      })
    );

    // twitter:title should fall back to ogTitle, not title
    expect(getMetaContent('meta[name="twitter:title"]')).toBe(
      'OG Specific Title'
    );
  });

  it('falls back twitter:description to ogDescription', () => {
    renderHook(() =>
      useSEO({
        description: 'Page description',
        ogDescription: 'OG specific description',
      })
    );

    // twitter:description should fall back to ogDescription, not description
    expect(getMetaContent('meta[name="twitter:description"]')).toBe(
      'OG specific description'
    );
  });

  it('og:url falls back to effective canonical URL', () => {
    renderHook(() =>
      useSEO({
        canonical: 'https://example.com/canonical-page',
        autoCanonical: false,
      })
    );

    expect(getMetaContent('meta[property="og:url"]')).toBe(
      'https://example.com/canonical-page'
    );
  });

  it('replaces JSON-LD scripts on re-render', () => {
    const { rerender } = renderHook(
      (props: { structuredData?: object }) => useSEO(props),
      {
        initialProps: {
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'First',
          },
        },
      }
    );

    let scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scripts.length).toBe(1);
    expect(scripts[0]?.textContent).toContain('First');

    rerender({
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Second',
      },
    });

    scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    expect(scripts[0]?.textContent).toContain('Second');
    expect(scripts[0]?.textContent).not.toContain('First');
  });

  it('cleans up ogLocaleAlternates on re-render', () => {
    const { rerender } = renderHook(
      (props: { ogLocaleAlternates?: string[] }) => useSEO(props),
      {
        initialProps: {
          ogLocaleAlternates: ['en_GB', 'de_DE'],
        },
      }
    );

    let alternates = document.querySelectorAll(
      'meta[property="og:locale:alternate"]'
    );
    expect(alternates.length).toBe(2);

    rerender({ ogLocaleAlternates: ['fr_FR'] });

    alternates = document.querySelectorAll(
      'meta[property="og:locale:alternate"]'
    );
    expect(alternates.length).toBe(1);
    expect(alternates[0]?.getAttribute('content')).toBe('fr_FR');
  });

  it('updates hreflang links on re-render', () => {
    const { rerender } = renderHook(
      (
        props: { hreflangs?: { href: string; hrefLang: string }[] } = {}
      ) => useSEO(props),
      {
        initialProps: {
          hreflangs: [
            { href: 'https://example.com/en/', hrefLang: 'en' },
            { href: 'https://example.com/de/', hrefLang: 'de' },
          ],
        },
      }
    );

    let hreflangs = document.querySelectorAll(
      'link[rel="alternate"][hreflang]'
    );
    expect(hreflangs.length).toBe(2);

    rerender({
      hreflangs: [
        { href: 'https://example.com/fr/', hrefLang: 'fr' },
      ],
    });

    hreflangs = document.querySelectorAll(
      `link[rel="alternate"][hreflang][${SEO_MARKER}="true"]`
    );
    // Old hreflang links should be removed, only the new one should exist
    expect(hreflangs.length).toBe(1);
    const frLink = document.querySelector(
      'link[rel="alternate"][hreflang="fr"]'
    );
    expect(frLink).not.toBeNull();
    expect(frLink?.getAttribute('href')).toBe('https://example.com/fr/');
  });

  it('updateMetaTag with httpEquiv via legacy signature', () => {
    const { result } = renderHook(() => useSEO({}));

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
      (result.current.updateMetaTag as any)(
        'refresh',
        '5',
        undefined,
        'refresh'
      );
    });

    expect(getMetaContent('meta[http-equiv="refresh"]')).toBe('5');
  });

  it('getCurrentSEO returns a copy that does not mutate internal state', () => {
    const { result, rerender } = renderHook(
      (props: { title?: string }) => useSEO(props),
      { initialProps: { title: 'Original' } }
    );

    const snapshot1 = result.current.getCurrentSEO();
    expect(snapshot1.title).toBe('Original');

    rerender({ title: 'Updated' });

    const snapshot2 = result.current.getCurrentSEO();
    expect(snapshot2.title).toBe('Updated');
    // Original snapshot should not be affected
    expect(snapshot1.title).toBe('Original');
  });
});
