/**
 * Comprehensive tests for useSEO hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSEO } from '../src/useSEO';
import { resetCanUseDOMCache, SEO_MARKER } from '../src/utils/dom';
import * as domModule from '../src/utils/dom';

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

    it('skips og:image:secure_url for ogImages when secureUrl is invalid', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          ogImages: [
            {
              url: 'https://example.com/image.jpg',
              secureUrl: 'http://[invalid',
            },
          ],
          validateUrls: true,
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      // Primary url still emitted.
      expect(getMetaContent('meta[property="og:image"]')).toBe(
        'https://example.com/image.jpg'
      );
      // Invalid secureUrl was rejected — no secure_url meta should be present.
      expect(
        document.querySelector('meta[property="og:image:secure_url"]')
      ).toBeNull();

      // A dev warning was logged for the invalid secure_url.
      const urlWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes('Invalid URL provided for og:image:secure_url')
      );
      expect(urlWarnings.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
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

    it('cleans up article:published_time when prop transitions to undefined', () => {
      const { rerender } = renderHook(
        (props: { publishedTime?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { publishedTime: '2024-01-15T10:30:00Z' },
        }
      );

      expect(getMetaContent('meta[property="article:published_time"]')).toBe(
        '2024-01-15T10:30:00Z'
      );

      rerender({ publishedTime: undefined });

      expect(
        document.querySelector(
          `meta[property="article:published_time"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('cleans up article:modified_time when prop transitions to undefined', () => {
      const { rerender } = renderHook(
        (props: { modifiedTime?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { modifiedTime: '2024-02-01T14:20:00Z' },
        }
      );

      expect(getMetaContent('meta[property="article:modified_time"]')).toBe(
        '2024-02-01T14:20:00Z'
      );

      rerender({ modifiedTime: undefined });

      expect(
        document.querySelector(
          `meta[property="article:modified_time"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('cleans up article:expiration_time when prop transitions to undefined', () => {
      const { rerender } = renderHook(
        (props: { expirationTime?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { expirationTime: '2025-12-31T23:59:59Z' },
        }
      );

      expect(getMetaContent('meta[property="article:expiration_time"]')).toBe(
        '2025-12-31T23:59:59Z'
      );

      rerender({ expirationTime: undefined });

      expect(
        document.querySelector(
          `meta[property="article:expiration_time"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('preserves a user-authored article:published_time meta when the prop disappears', () => {
      const userPublishedTime = document.createElement('meta');
      userPublishedTime.setAttribute('property', 'article:published_time');
      userPublishedTime.setAttribute('content', '2020-01-01T00:00:00Z');
      document.head.appendChild(userPublishedTime);

      const { rerender } = renderHook(
        (props: { publishedTime?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { publishedTime: '2024-01-15T10:30:00Z' },
        }
      );

      rerender({ publishedTime: undefined });

      // User-authored element stays; it never gained the SEO marker, so the
      // cleanup-on-unset branch (which only targets marked elements) leaves
      // it untouched.
      expect(document.head.contains(userPublishedTime)).toBe(true);
      expect(userPublishedTime.getAttribute(SEO_MARKER)).toBeNull();
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
        { initialProps: { robots: 'noindex' } }
      );
      expect(getMetaContent('meta[name="robots"]')).toBe('noindex');

      rerender({});
      // The marked robots meta should be removed from the DOM
      const markedRobots = document.querySelector(
        `meta[name="robots"][${SEO_MARKER}="true"]`
      );
      expect(markedRobots).toBeNull();
    });

    it('removes hook-created googlebot meta when the directive disappears (robots retained)', () => {
      const { rerender } = renderHook(
        (
          props: {
            robots?: string | { index?: boolean; googlebot?: string };
          } = {}
        ) => useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { robots: { index: true, googlebot: 'noindex' } },
        }
      );

      expect(getMetaContent('meta[name="googlebot"]')).toBe('noindex');

      rerender({ robots: { index: true } });

      // The marked googlebot meta should be removed from the DOM, mirroring
      // the robots cleanup above, even though `robots` itself is still set.
      const markedGooglebot = document.querySelector(
        `meta[name="googlebot"][${SEO_MARKER}="true"]`
      );
      expect(markedGooglebot).toBeNull();
    });

    it('removes hook-created googlebot meta when robots is unset entirely', () => {
      const { rerender } = renderHook(
        (
          props: {
            robots?: string | { index?: boolean; googlebot?: string };
          } = {}
        ) => useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { robots: { googlebot: 'noindex' } },
        }
      );

      expect(getMetaContent('meta[name="googlebot"]')).toBe('noindex');

      rerender({ robots: undefined });

      const markedGooglebot = document.querySelector(
        `meta[name="googlebot"][${SEO_MARKER}="true"]`
      );
      expect(markedGooglebot).toBeNull();
    });

    it('preserves a user-authored googlebot meta when the hook has no googlebot directive', () => {
      const userGooglebot = document.createElement('meta');
      userGooglebot.setAttribute('name', 'googlebot');
      userGooglebot.setAttribute('content', 'noindex');
      document.head.appendChild(userGooglebot);

      renderHook(() =>
        useSEO({
          robots: { index: true },
          autoCanonical: false,
          enableWarnings: false,
        })
      );

      // The user-authored element must remain untouched: still in the DOM
      // and never gains the hook's marker.
      expect(document.head.contains(userGooglebot)).toBe(true);
      expect(userGooglebot.getAttribute(SEO_MARKER)).toBeNull();
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

    it('restores meta, OG, and JSON-LD tags on rerender with identical (but fresh) props after clearSEOTags', () => {
      const { result, rerender } = renderHook(
        (props: {
          title?: string;
          description?: string;
          structuredData?: object;
        }) => useSEO(props),
        {
          initialProps: {
            title: 'Test',
            description: 'Description',
            structuredData: {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'Regression Article',
            },
          },
        }
      );

      // Sanity: everything present before clearing.
      expect(getMetaContent('meta[name="description"]')).toBe('Description');
      expect(getMetaContent('meta[property="og:title"]')).toBe('Test');
      expect(
        document.querySelector('script[type="application/ld+json"]')
      ).not.toBeNull();

      act(() => {
        result.current.clearSEOTags();
      });

      // Confirm the clear actually removed everything hook-created — the
      // restoration assertions below would be meaningless otherwise.
      expect(
        document.querySelector(`meta[name="description"][${SEO_MARKER}="true"]`)
      ).toBeNull();
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
      expect(
        document.querySelector('script[type="application/ld+json"]')
      ).toBeNull();

      // Rerender with a FRESH object literal carrying identical values — the
      // serialized config is byte-identical to what was last applied, which
      // is exactly the scenario that used to hit the main effect's
      // early-return (stale `prevConfigRef`) and leave `<head>` empty.
      rerender({
        title: 'Test',
        description: 'Description',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Regression Article',
        },
      });

      expect(getMetaContent('meta[name="description"]')).toBe('Description');
      expect(getMetaContent('meta[property="og:title"]')).toBe('Test');
      const script = document.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(script).not.toBeNull();
      const content = JSON.parse(script?.textContent ?? '{}') as Record<
        string,
        unknown
      >;
      expect(content.headline).toBe('Regression Article');
    });

    it('restores meta, OG, and JSON-LD tags on rerender with the exact same props reference after clearSEOTags', () => {
      const sharedProps = {
        title: 'Test',
        description: 'Description',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Regression Article',
        },
      };

      const { result, rerender } = renderHook(
        (props: {
          title?: string;
          description?: string;
          structuredData?: object;
        }) => useSEO(props),
        { initialProps: sharedProps }
      );

      expect(getMetaContent('meta[name="description"]')).toBe('Description');
      expect(getMetaContent('meta[property="og:title"]')).toBe('Test');
      expect(
        document.querySelector('script[type="application/ld+json"]')
      ).not.toBeNull();

      act(() => {
        result.current.clearSEOTags();
      });

      expect(
        document.querySelector(`meta[name="description"][${SEO_MARKER}="true"]`)
      ).toBeNull();
      expect(
        document.querySelector('script[type="application/ld+json"]')
      ).toBeNull();

      // Rerender with the SAME object reference (and thus the same
      // `structuredData` reference too) — proves the fix does not
      // accidentally depend on prop-object identity changing.
      rerender(sharedProps);

      expect(getMetaContent('meta[name="description"]')).toBe('Description');
      expect(getMetaContent('meta[property="og:title"]')).toBe('Test');
      const script = document.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(script).not.toBeNull();
      const content = JSON.parse(script?.textContent ?? '{}') as Record<
        string,
        unknown
      >;
      expect(content.headline).toBe('Regression Article');
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
    // Stronger replacement for the previous `Object.defineProperty(document,
    // 'title', { set })`-counter test, which only observed `document.title`
    // assignments and was fragile (React batching / a future hook refactor
    // that bails out before touching `document.title` could pass the old
    // assertion accidentally). This block instead spies on the hook's
    // primary DOM-mutation surfaces (`document.head.appendChild` and the
    // `getOrCreateMeta` / `getOrCreateLink` helpers from the `dom` module)
    // and snapshots the head's element count + each tracked element's
    // `outerHTML`. A no-op re-render must touch NONE of those; a real
    // change must touch at least one.
    it('does not update when props have not changed (no DOM mutation on no-op re-render)', () => {
      const props = {
        title: 'A useful, descriptive page title for SEO',
        description:
          'A meta description long enough to satisfy the recommended SEO length window for serp display.',
        canonical: 'https://example.com/test-page',
        enableWarnings: false,
      };

      const appendSpy = jest.spyOn(document.head, 'appendChild');
      const getOrCreateMetaSpy = jest.spyOn(domModule, 'getOrCreateMeta');
      const getOrCreateLinkSpy = jest.spyOn(domModule, 'getOrCreateLink');
      const createMetaSpy = jest.spyOn(domModule, 'createMeta');

      const { rerender } = renderHook((p) => useSEO(p), {
        initialProps: props,
      });

      // Snapshot the head AFTER the first effect run.
      const headChildrenAfterFirst = Array.from(document.head.children);
      const outerHtmlAfterFirst = headChildrenAfterFirst.map(
        (el) => el.outerHTML
      );

      // Reset spies BEFORE the second render so we measure only that run.
      appendSpy.mockClear();
      getOrCreateMetaSpy.mockClear();
      getOrCreateLinkSpy.mockClear();
      createMetaSpy.mockClear();

      // Re-render with the SAME prop reference. The hook's change detection
      // serializes the resolved snapshot to JSON and bails out if it equals
      // the previous serialization — every mutation helper below must be
      // skipped on this run.
      rerender(props);

      // Hard assertion #1: no DOM-mutation helper was invoked on the
      // bail-out path.
      expect(appendSpy).not.toHaveBeenCalled();
      expect(getOrCreateMetaSpy).not.toHaveBeenCalled();
      expect(getOrCreateLinkSpy).not.toHaveBeenCalled();
      expect(createMetaSpy).not.toHaveBeenCalled();

      // Hard assertion #2: the head's structure (count, identity, and
      // serialized HTML) is identical to what it was after the first run.
      const headChildrenAfterSecond = Array.from(document.head.children);
      expect(headChildrenAfterSecond.length).toBe(
        headChildrenAfterFirst.length
      );
      headChildrenAfterSecond.forEach((el, idx) => {
        // Element identity is preserved (no recreation).
        expect(el).toBe(headChildrenAfterFirst[idx]);
        // The serialized markup is also unchanged (no attribute mutation).
        expect(el.outerHTML).toBe(outerHtmlAfterFirst[idx]);
      });

      appendSpy.mockRestore();
      getOrCreateMetaSpy.mockRestore();
      getOrCreateLinkSpy.mockRestore();
      createMetaSpy.mockRestore();
    });

    // Companion test: when the props DO change, the same spies MUST fire so
    // we know the bail-out branch is exclusive (a regression that always
    // bailed out would silently break SEO updates and pass the no-op test).
    it('does update when props change (DOM mutation helpers fire on real change)', () => {
      const initialProps = {
        title: 'Initial page title that is descriptive enough for SEO',
        description:
          'Initial meta description long enough to satisfy the recommended SEO length window for serp.',
        enableWarnings: false,
        autoCanonical: false,
      };

      const { rerender } = renderHook((p) => useSEO(p), {
        initialProps,
      });

      const appendSpy = jest.spyOn(document.head, 'appendChild');
      const getOrCreateMetaSpy = jest.spyOn(domModule, 'getOrCreateMeta');

      // Re-render with a structurally different prop set (different title
      // and description).
      rerender({
        ...initialProps,
        title: 'Updated page title that is descriptive enough for SEO',
        description:
          'Updated meta description long enough to satisfy the recommended SEO length window for serp.',
      });

      // The change-detection bail-out MUST be skipped — at least the
      // description-related getOrCreateMeta call has to happen, and
      // document.title must reflect the new value.
      expect(getOrCreateMetaSpy).toHaveBeenCalled();
      expect(document.title).toBe(
        'Updated page title that is descriptive enough for SEO'
      );
      expect(getMetaContent('meta[name="description"]')).toBe(
        'Updated meta description long enough to satisfy the recommended SEO length window for serp.'
      );

      appendSpy.mockRestore();
      getOrCreateMetaSpy.mockRestore();
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
        structuredData: [null, { '@type': 'Article' }],
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
          { content: 'no-key-tag' },
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

  describe('additionalMetaTags / additionalLinkTags URL validation', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
      document.title = '';
      document.documentElement.removeAttribute('lang');
      resetCanUseDOMCache();
    });

    it('skips additionalMetaTags whose property is a URL field with an invalid URL', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { property: 'og:image', content: 'http://[invalid' },
            { property: 'og:audio', content: 'http://[invalid' },
            // Non-URL field should still be created.
            { name: 'theme-color', content: '#000000' },
          ],
          validateUrls: true,
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      // Invalid URL meta tags must NOT have been added.
      expect(getMetaContent('meta[property="og:image"]')).toBeNull();
      expect(getMetaContent('meta[property="og:audio"]')).toBeNull();
      // Non-URL meta tag is still added.
      expect(getMetaContent('meta[name="theme-color"]')).toBe('#000000');

      // A warning was logged for each invalid URL.
      const urlWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes('Invalid URL provided for')
      );
      expect(urlWarnings.length).toBeGreaterThanOrEqual(2);

      warnSpy.mockRestore();
    });

    it('still adds additionalMetaTags with valid URLs when validateUrls is true', () => {
      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { property: 'og:image', content: 'https://example.com/img.jpg' },
            { property: 'og:audio', content: 'https://example.com/audio.mp3' },
          ],
          validateUrls: true,
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      expect(getMetaContent('meta[property="og:image"]')).toBe(
        'https://example.com/img.jpg'
      );
      expect(getMetaContent('meta[property="og:audio"]')).toBe(
        'https://example.com/audio.mp3'
      );
    });

    it('does NOT validate additionalMetaTags when validateUrls is false', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { property: 'og:image', content: 'http://[invalid' },
          ],
          validateUrls: false,
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      // With validateUrls disabled, the value passes through unchanged.
      expect(getMetaContent('meta[property="og:image"]')).toBe(
        'http://[invalid'
      );

      warnSpy.mockRestore();
    });

    it('skips additionalMetaTags with a URL httpEquiv (e.g. content-location) when invalid', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            // The `content-location` http-equiv ends with `location`, which is
            // NOT a URL field per our conservative isUrlField, so it passes
            // through. But for any field that IS recognized as URL via
            // httpEquiv (e.g. a custom 'href' http-equiv), we exercise the
            // path: a property matching og:image trumps name/httpEquiv per
            // the existing key precedence, so test the property branch above.
            // Here we use a recognized URL httpEquiv via the exact-match list
            // by passing a pseudo property `og:url` instead — keeps coverage.
            { property: 'og:url', content: 'http://[invalid' },
          ],
          validateUrls: true,
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      expect(getMetaContent('meta[property="og:url"]')).toBeNull();
      warnSpy.mockRestore();
    });

    it('skips additionalLinkTags with invalid href when validateUrls is true', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalLinkTags: [
            { rel: 'icon', href: 'http://[invalid' },
            // Valid one should still appear.
            { rel: 'manifest', href: 'https://example.com/manifest.json' },
          ],
          validateUrls: true,
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      expect(document.querySelector('link[rel="icon"]')).toBeNull();
      expect(getLinkHref('link[rel="manifest"]')).toBe(
        'https://example.com/manifest.json'
      );

      const urlWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes('Invalid URL provided for')
      );
      expect(urlWarnings.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
    });

    it('skips additionalMetaTags with whitespace-only name and warns', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalMetaTags: [{ name: '   ', content: 'foo' }],
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      // No meta tag with empty/whitespace name should be created.
      expect(document.querySelector('meta[name="   "]')).toBeNull();
      expect(document.querySelector('meta[name=""]')).toBeNull();

      const skipWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes(
          'additionalMetaTags entry has no non-empty name/property/httpEquiv'
        )
      );
      expect(skipWarnings.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
    });

    it('skips additionalMetaTags with whitespace-only property and warns', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalMetaTags: [{ property: '\t\n  ', content: 'foo' }],
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      expect(document.querySelector('meta[property="\t\n  "]')).toBeNull();
      expect(document.querySelector('meta[property=""]')).toBeNull();

      const skipWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes(
          'additionalMetaTags entry has no non-empty name/property/httpEquiv'
        )
      );
      expect(skipWarnings.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
    });

    it('skips additionalMetaTags with whitespace-only httpEquiv and warns', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalMetaTags: [{ httpEquiv: '   ', content: 'foo' }],
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      expect(document.querySelector('meta[http-equiv="   "]')).toBeNull();
      expect(document.querySelector('meta[http-equiv=""]')).toBeNull();

      const skipWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes(
          'additionalMetaTags entry has no non-empty name/property/httpEquiv'
        )
      );
      expect(skipWarnings.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
    });

    it('skips additionalMetaTags when ALL three key fields are whitespace-only', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.NODE_ENV = 'development';

      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { name: '  ', property: '  ', httpEquiv: '  ', content: 'foo' },
          ],
          enableWarnings: true,
          autoCanonical: false,
        })
      );

      // No meta tag with whitespace-only/empty key field should be created.
      expect(document.querySelector('meta[name="  "]')).toBeNull();
      expect(document.querySelector('meta[name=""]')).toBeNull();
      expect(document.querySelector('meta[property="  "]')).toBeNull();
      expect(document.querySelector('meta[property=""]')).toBeNull();
      expect(document.querySelector('meta[http-equiv="  "]')).toBeNull();
      expect(document.querySelector('meta[http-equiv=""]')).toBeNull();

      const skipWarnings = warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes(
          'additionalMetaTags entry has no non-empty name/property/httpEquiv'
        )
      );
      expect(skipWarnings.length).toBeGreaterThanOrEqual(1);

      warnSpy.mockRestore();
    });

    it('trims whitespace and emits when at least one key field has content', () => {
      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            // name is empty/whitespace, property is valid (with surrounding spaces).
            { name: '  ', property: '  fb:app_id  ', content: '123456' },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      // Trimmed property is used as the identifier.
      expect(getMetaContent('meta[property="fb:app_id"]')).toBe('123456');
      // The whitespace-only/untrimmed selectors should NOT match.
      expect(
        document.querySelector('meta[property="  fb:app_id  "]')
      ).toBeNull();
    });

    it('trims whitespace from name and emits when name has content', () => {
      renderHook(() =>
        useSEO({
          additionalMetaTags: [{ name: '  theme-color  ', content: '#000000' }],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      expect(getMetaContent('meta[name="theme-color"]')).toBe('#000000');
      expect(document.querySelector('meta[name="  theme-color  "]')).toBeNull();
    });

    it('trims whitespace from httpEquiv and emits when httpEquiv has content', () => {
      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { httpEquiv: '  content-language  ', content: 'en' },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      expect(getMetaContent('meta[http-equiv="content-language"]')).toBe('en');
      expect(
        document.querySelector('meta[http-equiv="  content-language  "]')
      ).toBeNull();
    });
  });

  // T5 / M5 — locks in the documented precedence: when a built-in typed
  // prop (e.g. `description`, `ogTitle`, `twitterImage`) AND an
  // `additionalMetaTags` entry both target the same `<head>` element, the
  // additional-tag entry WINS because it runs after the built-in block and
  // mutates the same element via `getOrCreateMeta(..., preventDuplicates:
  // true)`. The corresponding README section ("Tag Precedence
  // (built-in vs additional)") documents this contract — these tests
  // catch any regression that flips the order.
  describe('Tag Precedence: additionalMetaTags overrides built-in fields', () => {
    it('additionalMetaTags description overrides built-in description prop', () => {
      renderHook(() =>
        useSEO({
          description: 'Built-in description (should be overridden)',
          additionalMetaTags: [
            { name: 'description', content: 'Override description' },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      // Exactly one description meta exists (no duplicate appended).
      expect(document.querySelectorAll('meta[name="description"]').length).toBe(
        1
      );
      // Final content reflects the additionalMetaTags entry.
      expect(getMetaContent('meta[name="description"]')).toBe(
        'Override description'
      );
    });

    it('additionalMetaTags og:title overrides built-in ogTitle prop', () => {
      renderHook(() =>
        useSEO({
          ogTitle: 'Built-in OG Title',
          additionalMetaTags: [
            { property: 'og:title', content: 'Override OG Title' },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      expect(
        document.querySelectorAll('meta[property="og:title"]').length
      ).toBe(1);
      expect(getMetaContent('meta[property="og:title"]')).toBe(
        'Override OG Title'
      );
    });

    it('additionalMetaTags twitter:image overrides built-in twitterImage prop', () => {
      renderHook(() =>
        useSEO({
          twitterImage: 'https://example.com/builtin.jpg',
          additionalMetaTags: [
            {
              name: 'twitter:image',
              content: 'https://example.com/override.jpg',
            },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      expect(
        document.querySelectorAll('meta[name="twitter:image"]').length
      ).toBe(1);
      expect(getMetaContent('meta[name="twitter:image"]')).toBe(
        'https://example.com/override.jpg'
      );
    });

    it('multiple additionalMetaTags entries with the same key — last wins', () => {
      renderHook(() =>
        useSEO({
          description: 'Built-in description',
          additionalMetaTags: [
            { name: 'description', content: 'First override' },
            { name: 'description', content: 'Second override (final)' },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      // preventDuplicates default = true, so all three calls land on the
      // SAME element; the last one to write wins.
      expect(document.querySelectorAll('meta[name="description"]').length).toBe(
        1
      );
      expect(getMetaContent('meta[name="description"]')).toBe(
        'Second override (final)'
      );
    });

    it('precedence works for httpEquiv keys too (additional overrides built-in via http-equiv match)', () => {
      // The hook does not emit a built-in http-equiv content-language tag,
      // but if the user authored one in HTML AND passed an
      // additionalMetaTags entry targeting it, the additional pass should
      // still mutate the existing element (preventDuplicates: true).
      const userAuthored = document.createElement('meta');
      userAuthored.setAttribute('http-equiv', 'content-language');
      userAuthored.setAttribute('content', 'fr');
      document.head.appendChild(userAuthored);

      renderHook(() =>
        useSEO({
          additionalMetaTags: [
            { httpEquiv: 'content-language', content: 'en' },
          ],
          enableWarnings: false,
          autoCanonical: false,
        })
      );

      expect(
        document.querySelectorAll('meta[http-equiv="content-language"]').length
      ).toBe(1);
      expect(getMetaContent('meta[http-equiv="content-language"]')).toBe('en');
    });
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

  describe('JSON-LD incremental reconciliation', () => {
    function getJsonLdScripts(): HTMLScriptElement[] {
      return Array.from(
        document.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"]'
        )
      );
    }

    it('preserves script element identity when structuredData is unchanged across renders', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Stable Article',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object; description?: string }) =>
          useSEO(props),
        {
          initialProps: { structuredData: data },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(1);

      // Re-render with the same structuredData reference but a different
      // unrelated prop so the effect runs again.
      rerender({ structuredData: data, description: 'changed' });

      const after = getJsonLdScripts();
      expect(after.length).toBe(1);
      // Same Element instance — proves we didn't tear it down and recreate.
      expect(after[0]).toBe(before[0]);
    });

    it('preserves script identity when structuredData is a new array reference with the same items', () => {
      const a = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'A',
      };
      const b = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'B',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object[] }) => useSEO(props),
        {
          initialProps: { structuredData: [a, b] },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(2);

      // Pass a fresh array literal with structurally-identical objects. The
      // hash should be the same, so both elements should be reused.
      rerender({
        structuredData: [
          { '@context': 'https://schema.org', '@type': 'Article', name: 'A' },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'B',
          },
        ],
      });

      const after = getJsonLdScripts();
      expect(after.length).toBe(2);
      expect(after[0]).toBe(before[0]);
      expect(after[1]).toBe(before[1]);
    });

    it('only re-creates the changed script when one item in a multi-item array changes', () => {
      const a = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'A',
      };
      const b = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'B',
      };
      const c = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'C',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object[] }) => useSEO(props),
        {
          initialProps: { structuredData: [a, b, c] },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(3);
      const [beforeA, beforeB, beforeC] = before;

      // Mutate only the middle item.
      const bChanged = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'B-changed',
      };
      rerender({ structuredData: [a, bChanged, c] });

      const after = getJsonLdScripts();
      expect(after.length).toBe(3);
      // First and third scripts are the same Element instances as before.
      expect(after[0]).toBe(beforeA);
      expect(after[2]).toBe(beforeC);
      // The middle one was recreated, so it is a different Element.
      expect(after[1]).not.toBe(beforeB);
      // Sanity: the new middle script contains the updated payload.
      expect(after[1]?.textContent).toContain('B-changed');
    });

    it('removes scripts whose items disappear from the array', () => {
      const a = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'A',
      };
      const b = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'B',
      };
      const c = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'C',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object[] }) => useSEO(props),
        {
          initialProps: { structuredData: [a, b, c] },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(3);
      const [beforeA, , beforeC] = before;

      // Drop the middle item.
      rerender({ structuredData: [a, c] });

      const after = getJsonLdScripts();
      expect(after.length).toBe(2);
      // Surviving scripts kept their identity.
      expect(after[0]).toBe(beforeA);
      expect(after[1]).toBe(beforeC);
    });

    it('appends new scripts for items added to the array, preserving existing identity', () => {
      const a = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'A',
      };
      const b = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'B',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object[] }) => useSEO(props),
        {
          initialProps: { structuredData: [a] },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(1);
      const beforeA = before[0];

      // Add a second item.
      rerender({ structuredData: [a, b] });

      const after = getJsonLdScripts();
      expect(after.length).toBe(2);
      expect(after[0]).toBe(beforeA);
      expect(after[1]).not.toBe(beforeA);
      expect(after[1]?.textContent).toContain('Organization');
    });

    it('preserves element identity when the array is shuffled, only updating document order', () => {
      const a = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'A',
      };
      const b = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'B',
      };
      const c = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'C',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object[] }) => useSEO(props),
        {
          initialProps: { structuredData: [a, b, c] },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(3);
      const [beforeA, beforeB, beforeC] = before;

      // Shuffle to [c, a, b].
      rerender({ structuredData: [c, a, b] });

      const after = getJsonLdScripts();
      expect(after.length).toBe(3);
      // Document order matches the new array order…
      expect(after[0]).toBe(beforeC);
      expect(after[1]).toBe(beforeA);
      expect(after[2]).toBe(beforeB);
      // …and data-seo-index reflects the new positions.
      expect(after[0]?.getAttribute('data-seo-index')).toBe('0');
      expect(after[1]?.getAttribute('data-seo-index')).toBe('1');
      expect(after[2]?.getAttribute('data-seo-index')).toBe('2');
    });

    it('preserves script identity when an unrelated SEO prop changes but structuredData does not', () => {
      const data = [
        { '@context': 'https://schema.org', '@type': 'Article', name: 'A' },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'B',
        },
      ];

      const { rerender } = renderHook(
        (props: {
          structuredData?: object[];
          title?: string;
          description?: string;
        }) => useSEO(props),
        {
          initialProps: {
            structuredData: data,
            title: 'First Title',
            description: 'First description text long enough.',
          },
        }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(2);

      // Change unrelated props; structuredData reference stays the same.
      rerender({
        structuredData: data,
        title: 'Different Title',
        description: 'Completely different description text.',
      });

      const after = getJsonLdScripts();
      expect(after.length).toBe(2);
      expect(after[0]).toBe(before[0]);
      expect(after[1]).toBe(before[1]);
    });

    it('removes all JSON-LD scripts when structuredData transitions to undefined', () => {
      const { rerender } = renderHook(
        (props: { structuredData?: object | object[] }) => useSEO(props),
        {
          initialProps: {
            structuredData: [
              {
                '@context': 'https://schema.org',
                '@type': 'Article',
                name: 'A',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'B',
              },
            ],
          },
        }
      );

      expect(getJsonLdScripts().length).toBe(2);

      rerender({ structuredData: undefined });

      expect(getJsonLdScripts().length).toBe(0);
    });

    // T2 (M2): coverage for the duplicate-payload `__dup_${index}` synthetic
    // key path in `useSEO.ts` (the line where two structurally-identical
    // payloads in the same render array each get their own slot). Without
    // these tests a regression that silently collapses the two scripts back
    // into one would not be caught.
    it('emits two separate <script> elements when the same JSON-LD payload appears twice in the same array', () => {
      const item = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home' }],
      };

      renderHook(() => useSEO({ structuredData: [item, item] }));

      const scripts = getJsonLdScripts();
      // Two slots — the duplicate-key suffix gives each occurrence its own
      // script element instead of collapsing them.
      expect(scripts.length).toBe(2);
      // Both elements are distinct instances (the `__dup_${index}` synthetic
      // key forces the second one through the create path even though the
      // base hash matched).
      expect(scripts[0]).not.toBe(scripts[1]);
      // Both carry the same serialized payload.
      expect(scripts[0]?.textContent).toBe(scripts[1]?.textContent);
      expect(scripts[0]?.textContent).toContain('BreadcrumbList');
      // data-seo-index reflects each position in the original array.
      expect(scripts[0]?.getAttribute('data-seo-index')).toBe('0');
      expect(scripts[1]?.getAttribute('data-seo-index')).toBe('1');
    });

    it('handles three identical JSON-LD payloads in the same render array as three separate slots', () => {
      const item = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: 'Repeated',
      };

      renderHook(() =>
        useSEO({ structuredData: [item, { ...item }, { ...item }] })
      );

      const scripts = getJsonLdScripts();
      expect(scripts.length).toBe(3);
      // All three are distinct DOM nodes (each duplicate goes through its
      // own create path because of the `__dup_${index}` suffix).
      expect(scripts[0]).not.toBe(scripts[1]);
      expect(scripts[1]).not.toBe(scripts[2]);
      expect(scripts[0]).not.toBe(scripts[2]);
      // All carry the same serialized payload.
      expect(scripts[0]?.textContent).toBe(scripts[1]?.textContent);
      expect(scripts[1]?.textContent).toBe(scripts[2]?.textContent);
      // Indices line up with the array order.
      expect(scripts[0]?.getAttribute('data-seo-index')).toBe('0');
      expect(scripts[1]?.getAttribute('data-seo-index')).toBe('1');
      expect(scripts[2]?.getAttribute('data-seo-index')).toBe('2');
    });

    it('reconciles correctly when a duplicate-payload array shrinks to a single occurrence', () => {
      const item = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: 'X',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object[] }) => useSEO(props),
        {
          initialProps: { structuredData: [item, item] },
        }
      );

      expect(getJsonLdScripts().length).toBe(2);

      // Drop one of the duplicates. The synthetic `__dup_1` key is no longer
      // in the new array, so its script element is removed; the original
      // hash entry survives because it is still in the array.
      rerender({ structuredData: [item] });

      const after = getJsonLdScripts();
      expect(after.length).toBe(1);
      expect(after[0]?.textContent).toContain('"name":"X"');
    });
  });

  // T3 (M3): the JSON-LD reuse path must defend against the rare case where
  // two semantically distinct payloads produce the same FNV-1a hash. Without
  // the fix, a hash collision causes the existing `<script>` to be reused
  // verbatim — including its STALE `textContent` — even though the caller
  // intended a different payload. The fix re-serializes the new payload on
  // the reuse path and rewrites `textContent` only when it actually
  // differs from the stored content (so the perf characteristic of
  // incremental reconciliation is preserved when there is no collision).
  describe('JSON-LD hash collision defense', () => {
    function getJsonLdScripts(): HTMLScriptElement[] {
      return Array.from(
        document.querySelectorAll<HTMLScriptElement>(
          'script[type="application/ld+json"]'
        )
      );
    }

    it('rewrites textContent when two different payloads share a hash (forced collision)', () => {
      // Force a collision by spying on the dom module's `hashJsonLd` and
      // returning the same fixed hash for any input. The reconciler will
      // then think the payload is unchanged across renders even though the
      // `JSON.stringify` output is different — exactly the FNV-1a-collision
      // scenario we want to defend against.
      const hashSpy = jest
        .spyOn(domModule, 'hashJsonLd')
        .mockReturnValue('FIXED_COLLISION_HASH');

      try {
        const { rerender } = renderHook(
          (props: { structuredData?: object }) => useSEO(props),
          {
            initialProps: {
              structuredData: {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: 'Original payload',
              },
            },
          }
        );

        const before = getJsonLdScripts();
        expect(before.length).toBe(1);
        expect(before[0]?.textContent).toContain('Original payload');

        // Re-render with a structurally DIFFERENT payload. Because the spy
        // forces both renders to produce the same hash, the reconciler hits
        // the reuse path. Without the collision-defense fix, `textContent`
        // would still say "Original payload"; with the fix, the reconciler
        // detects the content change and updates the DOM in place.
        rerender({
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'New payload after collision',
          },
        });

        const after = getJsonLdScripts();
        expect(after.length).toBe(1);
        // Same Element instance — the reuse path was taken (proves the
        // collision was actually exercised).
        expect(after[0]).toBe(before[0]);
        // textContent reflects the NEW payload (the collision defense
        // rewrote it instead of leaving the stale content in place).
        expect(after[0]?.textContent).toContain('New payload after collision');
        expect(after[0]?.textContent).not.toContain('Original payload');
      } finally {
        hashSpy.mockRestore();
      }
    });

    it('does not rewrite textContent on the reuse path when the content is genuinely unchanged', () => {
      // Same payload across renders, no spying. The reuse path should be
      // taken, but because the serialized content matches the stored
      // content, no `textContent` write should occur. We verify this by
      // mutating the DOM-side textContent between renders and confirming
      // it survives — proving no rewrite happened.
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Stable',
      };

      const { rerender } = renderHook(
        (props: { structuredData?: object; description?: string }) =>
          useSEO(props),
        { initialProps: { structuredData: data } }
      );

      const before = getJsonLdScripts();
      expect(before.length).toBe(1);
      // Sentinel: write a value the hook would never write so we can detect
      // a stray rewrite on the reuse path.
      const sentinel = '/* preserved-by-test */';
      const original = before[0]?.textContent ?? '';
      // Append the sentinel so any rewrite would clobber it.
      if (before[0]) {
        before[0].textContent = original + sentinel;
      }

      // Trigger a re-render via an unrelated prop change so the effect
      // runs again and walks the reconciliation path.
      rerender({ structuredData: data, description: 'changed once' });

      const after = getJsonLdScripts();
      expect(after.length).toBe(1);
      expect(after[0]).toBe(before[0]);
      // Sentinel survives — proves the reconciler's reuse path did NOT
      // rewrite the textContent when the content was unchanged.
      expect(after[0]?.textContent).toContain(sentinel);
    });
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
      (props: { hreflangs?: { href: string; hrefLang: string }[] } = {}) =>
        useSEO(props),
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
      hreflangs: [{ href: 'https://example.com/fr/', hrefLang: 'fr' }],
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

  it('getCurrentSEO returns a deep clone — nested array/object mutations do not leak', () => {
    const initialOgImages = [
      {
        url: 'https://example.com/a.jpg',
        width: 1200,
        height: 630,
        alt: 'A',
      },
    ];
    const initialAdditionalMeta = [{ name: 'theme-color', content: '#fff' }];
    const initialStructuredData = [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Hello',
      },
    ];

    const { result } = renderHook(() =>
      useSEO({
        title: 'Page',
        ogImages: initialOgImages,
        additionalMetaTags: initialAdditionalMeta,
        structuredData: initialStructuredData,
        enableWarnings: false,
      })
    );

    // First snapshot — validate it has the expected nested data.
    const snap1 = result.current.getCurrentSEO();
    expect(snap1.ogImages).toBeDefined();
    expect(snap1.ogImages).toHaveLength(1);
    expect(snap1.ogImages?.[0]?.url).toBe('https://example.com/a.jpg');
    expect(snap1.additionalMetaTags).toBeDefined();
    expect(snap1.additionalMetaTags).toHaveLength(1);
    expect(snap1.structuredData).toBeDefined();
    expect(Array.isArray(snap1.structuredData)).toBe(true);
    const sdArr1 = snap1.structuredData as Array<Record<string, unknown>>;
    expect(sdArr1[0]?.['@type']).toBe('Article');

    // Mutate every nested structure on the returned snapshot.
    snap1.ogImages?.push({
      url: 'https://example.com/poison.jpg',
      width: 1,
      height: 1,
      alt: 'poison',
    });
    if (snap1.ogImages?.[0]) {
      snap1.ogImages[0].url = 'https://example.com/CORRUPTED.jpg';
      snap1.ogImages[0].alt = 'CORRUPTED';
    }
    snap1.additionalMetaTags?.push({
      name: 'CORRUPTED',
      content: 'CORRUPTED',
    });
    if (snap1.additionalMetaTags?.[0]) {
      snap1.additionalMetaTags[0].content = 'CORRUPTED';
    }
    if (sdArr1[0]) {
      sdArr1[0]['@type'] = 'CORRUPTED';
      sdArr1[0].headline = 'CORRUPTED';
    }
    sdArr1.push({
      '@context': 'https://schema.org',
      '@type': 'POISON',
    });

    // A subsequent call must return pristine data — none of the prior
    // mutations should be visible.
    const snap2 = result.current.getCurrentSEO();

    expect(snap2.ogImages).toHaveLength(1);
    expect(snap2.ogImages?.[0]?.url).toBe('https://example.com/a.jpg');
    expect(snap2.ogImages?.[0]?.alt).toBe('A');

    expect(snap2.additionalMetaTags).toHaveLength(1);
    expect(snap2.additionalMetaTags?.[0]?.name).toBe('theme-color');
    expect(snap2.additionalMetaTags?.[0]?.content).toBe('#fff');

    const sdArr2 = snap2.structuredData as Array<Record<string, unknown>>;
    expect(sdArr2).toHaveLength(1);
    expect(sdArr2[0]?.['@type']).toBe('Article');
    expect(sdArr2[0]?.headline).toBe('Hello');

    // The originally-supplied caller arrays/objects must also be untouched
    // by the deep-clone path itself (defense check that the hook didn't
    // hand us aliases of the caller's input).
    expect(initialOgImages).toHaveLength(1);
    expect(initialOgImages[0]?.url).toBe('https://example.com/a.jpg');
    expect(initialAdditionalMeta).toHaveLength(1);
    expect(initialAdditionalMeta[0]?.content).toBe('#fff');
    expect(initialStructuredData).toHaveLength(1);
    expect((initialStructuredData[0] as Record<string, unknown>)['@type']).toBe(
      'Article'
    );

    // Snapshots should be independent objects.
    expect(snap2).not.toBe(snap1);
    expect(snap2.ogImages).not.toBe(snap1.ogImages);
    expect(snap2.additionalMetaTags).not.toBe(snap1.additionalMetaTags);
    expect(snap2.structuredData).not.toBe(snap1.structuredData);
  });

  it('getCurrentSEO drops keys whose values are undefined (JSON-roundtrip cross-runtime symmetry)', () => {
    // The hook's snapshot construction always seeds EVERY destructured prop
    // (many of them `undefined` when the user didn't pass them). The public
    // `getCurrentSEO()` deep-clones via `JSON.parse(JSON.stringify(...))`,
    // and `JSON.stringify` strips keys whose value is `undefined`. This test
    // pins down that behavior so the result shape is identical across every
    // supported runtime (no `structuredClone` fast-path that would preserve
    // `undefined` keys on Node 17+ while the JSON-roundtrip path drops them
    // on older runtimes — a previous source of subtle cross-runtime drift).
    const { result } = renderHook(() =>
      useSEO({
        title: 'Symmetry Test',
        description: 'A description so we have at least one set field',
        // Intentionally do NOT pass `keywords`, `author`, `ogImage`, etc.
        // The hook will still SEED those keys with `undefined` in its
        // internal snapshot — but `getCurrentSEO()` must drop them.
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const snapshot = result.current.getCurrentSEO();

    // The set fields are present and carry the expected values.
    expect(snapshot.title).toBe('Symmetry Test');
    expect(snapshot.description).toBe(
      'A description so we have at least one set field'
    );

    // The unset fields are GONE — not present as keys with `undefined`
    // values. This is the cross-runtime invariant we're locking in: every
    // supported runtime sees the same `'X' in snapshot` answer because
    // `JSON.stringify` is the only path that produces the snapshot.
    expect('keywords' in snapshot).toBe(false);
    expect('author' in snapshot).toBe(false);
    expect('ogImage' in snapshot).toBe(false);
    expect('ogImages' in snapshot).toBe(false);
    expect('twitterCreator' in snapshot).toBe(false);
    expect('articleAuthor' in snapshot).toBe(false);
    expect('robots' in snapshot).toBe(false);
    expect('hreflangs' in snapshot).toBe(false);
    expect('structuredData' in snapshot).toBe(false);

    // And the snapshot is a plain object (no prototype shenanigans, no
    // residual references) — `JSON.parse(JSON.stringify(...))` always
    // returns a fresh plain object literal.
    expect(Object.getPrototypeOf(snapshot)).toBe(Object.prototype);
  });

  describe('hreflang selector safety', () => {
    it('does not break when a hreflang value contains a double quote', () => {
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      try {
        renderHook(() =>
          useSEO({
            // Force the hook to attempt to build a CSS selector with
            // characters that would otherwise corrupt it.
            hreflangs: [
              { href: 'https://example.com/odd/', hrefLang: 'en"]><img>' },
            ],
            enableWarnings: false,
          })
        );

        const links = document.querySelectorAll(
          `link[rel="alternate"][${SEO_MARKER}="true"]`
        );
        expect(links.length).toBe(1);
        expect(links[0]?.getAttribute('href')).toBe('https://example.com/odd/');
        expect(links[0]?.getAttribute('hreflang')).toBe('en"]><img>');
        // The hook must not have logged an "Error updating head tags"
        // because the selector would otherwise have thrown SyntaxError.
        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        errorSpy.mockRestore();
      }
    });

    it('does not break when a hreflang value contains a backslash', () => {
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      try {
        renderHook(() =>
          useSEO({
            hreflangs: [
              { href: 'https://example.com/back/', hrefLang: 'en\\foo' },
            ],
            enableWarnings: false,
          })
        );

        const links = document.querySelectorAll(
          `link[rel="alternate"][${SEO_MARKER}="true"]`
        );
        expect(links.length).toBe(1);
        expect(links[0]?.getAttribute('hreflang')).toBe('en\\foo');
        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        errorSpy.mockRestore();
      }
    });
  });

  describe('updateMetaTag with no key', () => {
    it('is a no-op when called with an empty key object', () => {
      // Pre-existing meta that must NOT be mutated by an empty-key call.
      const preExisting = document.createElement('meta');
      preExisting.setAttribute('name', 'description');
      preExisting.setAttribute('content', 'untouched');
      document.head.appendChild(preExisting);

      const { result } = renderHook(() =>
        useSEO({ enableWarnings: false, autoCanonical: false })
      );

      act(() => {
        (result.current.updateMetaTag as any)({}, 'should-not-be-applied');
      });

      // The pre-existing meta must be intact.
      expect(preExisting.getAttribute('content')).toBe('untouched');
      // No new meta with our content should have been created.
      expect(
        document.querySelector('meta[content="should-not-be-applied"]')
      ).toBeNull();
    });

    it('emits a dev warning when called with an empty key object', () => {
      const warnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const { result } = renderHook(() =>
          useSEO({ enableWarnings: true, autoCanonical: false })
        );

        act(() => {
          (result.current.updateMetaTag as any)({}, 'value');
        });

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('updateMetaTag called without a key')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        warnSpy.mockRestore();
      }
    });

    it('is a no-op when key fields are all empty strings', () => {
      const preExisting = document.createElement('meta');
      preExisting.setAttribute('name', 'description');
      preExisting.setAttribute('content', 'untouched');
      document.head.appendChild(preExisting);

      const { result } = renderHook(() =>
        useSEO({ enableWarnings: false, autoCanonical: false })
      );

      act(() => {
        (result.current.updateMetaTag as any)(
          { name: '', property: '', httpEquiv: '' },
          'value'
        );
      });

      expect(preExisting.getAttribute('content')).toBe('untouched');
    });
  });

  describe('clearSEOTags preserves user-authored elements', () => {
    it('does not remove a pre-existing user-authored description meta', () => {
      // Pre-existing meta WITHOUT the SEO marker — represents user-authored
      // markup that lived in <head> before the hook mounted.
      const preExisting = document.createElement('meta');
      preExisting.setAttribute('name', 'description');
      preExisting.setAttribute('content', 'user authored description');
      document.head.appendChild(preExisting);

      const { result } = renderHook(() =>
        useSEO({
          // The hook will mutate the existing description meta but must
          // NOT take ownership of it — clearing should leave it intact.
          description: 'hook-set description',
          autoCanonical: false,
          enableWarnings: false,
        })
      );

      // Hook mutated the user's description.
      expect(getMetaContent('meta[name="description"]')).toBe(
        'hook-set description'
      );

      act(() => {
        result.current.clearSEOTags();
      });

      // The user-authored element is still in the DOM.
      expect(document.head.contains(preExisting)).toBe(true);
      // It still does not carry the SEO marker.
      expect(preExisting.getAttribute(SEO_MARKER)).toBeNull();
      // The mutated content remains (we don't restore the original value
      // because the hook never snapshotted it — the contract is that we
      // simply preserve the element).
      expect(getMetaContent('meta[name="description"]')).toBe(
        'hook-set description'
      );
    });

    it('does not remove a pre-existing user-authored canonical link', () => {
      const preExisting = document.createElement('link');
      preExisting.setAttribute('rel', 'canonical');
      preExisting.setAttribute('href', 'https://example.com/user-authored');
      document.head.appendChild(preExisting);

      const { result } = renderHook(() =>
        useSEO({
          canonical: 'https://example.com/hook-set',
          autoCanonical: false,
          enableWarnings: false,
        })
      );

      act(() => {
        result.current.clearSEOTags();
      });

      expect(document.head.contains(preExisting)).toBe(true);
      expect(preExisting.getAttribute(SEO_MARKER)).toBeNull();
    });

    it('still removes hook-created OG meta tags via clearSEOTags', () => {
      const { result } = renderHook(() =>
        useSEO({
          ogTitle: 'Hook OG Title',
          ogDescription: 'Hook OG description',
          autoCanonical: false,
          enableWarnings: false,
        })
      );

      // Confirm the hook created the og:title with the marker.
      const ogTitleBefore = document.querySelector(
        `meta[property="og:title"][${SEO_MARKER}="true"]`
      );
      expect(ogTitleBefore).not.toBeNull();

      act(() => {
        result.current.clearSEOTags();
      });

      // Hook-created elements ARE removed.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
      expect(
        document.querySelector(
          `meta[property="og:description"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('mixes user-authored and hook-created elements correctly', () => {
      // User-authored description (no marker).
      const userDescription = document.createElement('meta');
      userDescription.setAttribute('name', 'description');
      userDescription.setAttribute('content', 'user description');
      document.head.appendChild(userDescription);

      // User-authored canonical (no marker).
      const userCanonical = document.createElement('link');
      userCanonical.setAttribute('rel', 'canonical');
      userCanonical.setAttribute('href', 'https://example.com/user');
      document.head.appendChild(userCanonical);

      const { result } = renderHook(() =>
        useSEO({
          description: 'mutated by hook',
          canonical: 'https://example.com/mutated',
          // Hook will create these from scratch.
          ogTitle: 'New OG Title',
          author: 'Hook Author',
          autoCanonical: false,
          enableWarnings: false,
        })
      );

      // Hook-created elements should exist with the marker.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();
      expect(
        document.querySelector(`meta[name="author"][${SEO_MARKER}="true"]`)
      ).not.toBeNull();

      act(() => {
        result.current.clearSEOTags();
      });

      // User-authored elements survive.
      expect(document.head.contains(userDescription)).toBe(true);
      expect(document.head.contains(userCanonical)).toBe(true);

      // Hook-created elements are gone.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
      expect(
        document.querySelector(`meta[name="author"][${SEO_MARKER}="true"]`)
      ).toBeNull();
    });
  });

  describe('clearOnUnmount option', () => {
    it('removes hook-created DOM elements when unmounting with clearOnUnmount: true', () => {
      const { unmount } = renderHook(() =>
        useSEO({
          ogTitle: 'Will be cleared',
          ogDescription: 'Will also be cleared',
          author: 'Hook Author',
          autoCanonical: false,
          enableWarnings: false,
          clearOnUnmount: true,
        })
      );

      // Confirm the hook authored these tags before unmount.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();
      expect(
        document.querySelector(
          `meta[property="og:description"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();
      expect(
        document.querySelector(`meta[name="author"][${SEO_MARKER}="true"]`)
      ).not.toBeNull();

      unmount();

      // All hook-created tags are removed.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
      expect(
        document.querySelector(
          `meta[property="og:description"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
      expect(
        document.querySelector(`meta[name="author"][${SEO_MARKER}="true"]`)
      ).toBeNull();
    });

    it('leaves hook-created DOM elements in place when unmounting with clearOnUnmount: false (default)', () => {
      const { unmount } = renderHook(() =>
        useSEO({
          ogTitle: 'Should persist',
          ogDescription: 'Should persist too',
          author: 'Persistent Author',
          autoCanonical: false,
          enableWarnings: false,
          // clearOnUnmount omitted — default is false.
        })
      );

      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();

      unmount();

      // Tags persist after unmount (the historical default behavior).
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();
      expect(
        document.querySelector(
          `meta[property="og:description"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();
      expect(
        document.querySelector(`meta[name="author"][${SEO_MARKER}="true"]`)
      ).not.toBeNull();
    });

    it('preserves user-authored elements when unmounting with clearOnUnmount: true', () => {
      // Pre-existing user-authored elements (no SEO marker).
      const userDescription = document.createElement('meta');
      userDescription.setAttribute('name', 'description');
      userDescription.setAttribute('content', 'user authored description');
      document.head.appendChild(userDescription);

      const userCanonical = document.createElement('link');
      userCanonical.setAttribute('rel', 'canonical');
      userCanonical.setAttribute('href', 'https://example.com/user-authored');
      document.head.appendChild(userCanonical);

      const { unmount } = renderHook(() =>
        useSEO({
          // Hook will mutate the existing description, not own it.
          description: 'mutated by hook',
          // Hook will mutate the existing canonical, not own it.
          canonical: 'https://example.com/mutated',
          // Hook creates this from scratch — should be removed on unmount.
          ogTitle: 'Hook OG Title',
          autoCanonical: false,
          enableWarnings: false,
          clearOnUnmount: true,
        })
      );

      // Confirm the hook-created element exists before unmount.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();

      unmount();

      // User-authored elements survive — they never had the marker.
      expect(document.head.contains(userDescription)).toBe(true);
      expect(userDescription.getAttribute(SEO_MARKER)).toBeNull();
      expect(document.head.contains(userCanonical)).toBe(true);
      expect(userCanonical.getAttribute(SEO_MARKER)).toBeNull();

      // Hook-created element is gone.
      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('honors the latest clearOnUnmount value at unmount time, not the mount-time value', () => {
      // Mount with `false`, re-render with `true`, then unmount — cleanup
      // SHOULD run because we read the ref at unmount time.
      const { rerender, unmount } = renderHook(
        (props: { clearOnUnmount: boolean }) =>
          useSEO({
            ogTitle: 'Toggleable',
            autoCanonical: false,
            enableWarnings: false,
            clearOnUnmount: props.clearOnUnmount,
          }),
        { initialProps: { clearOnUnmount: false } }
      );

      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();

      rerender({ clearOnUnmount: true });
      unmount();

      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('does not clear when clearOnUnmount toggles back to false before unmount', () => {
      // Mount with `true`, re-render with `false`, then unmount — cleanup
      // should NOT run because the ref reflects the latest value.
      const { rerender, unmount } = renderHook(
        (props: { clearOnUnmount: boolean }) =>
          useSEO({
            ogTitle: 'Stays',
            autoCanonical: false,
            enableWarnings: false,
            clearOnUnmount: props.clearOnUnmount,
          }),
        { initialProps: { clearOnUnmount: true } }
      );

      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();

      rerender({ clearOnUnmount: false });
      unmount();

      expect(
        document.querySelector(
          `meta[property="og:title"][${SEO_MARKER}="true"]`
        )
      ).not.toBeNull();
    });

    // T12 (L7): the unmount-cleanup effect must remove JSON-LD scripts in
    // addition to ordinary meta/link tags. JSON-LD scripts are tracked
    // separately in `jsonLdScriptsRef` (the reconciliation map) AND added to
    // `addedElements`, so the cleanup forEach should remove them via
    // `addedElements`, and `jsonLdScriptsRef` should be cleared as well so
    // a remount starts from a clean slate.
    it('removes hook-created JSON-LD scripts on unmount when clearOnUnmount: true', () => {
      const { unmount } = renderHook(() =>
        useSEO({
          structuredData: [
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: 'JSON-LD A',
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'JSON-LD B',
            },
          ],
          autoCanonical: false,
          enableWarnings: false,
          clearOnUnmount: true,
        })
      );

      // Both JSON-LD scripts are present before unmount and carry the SEO
      // marker (so they are eligible for removal by the cleanup pass).
      const beforeUnmount = document.querySelectorAll(
        `script[type="application/ld+json"][${SEO_MARKER}="true"]`
      );
      expect(beforeUnmount.length).toBe(2);

      unmount();

      // Zero JSON-LD scripts remain — neither in the SEO-marked subset nor
      // in the broader `script[type="application/ld+json"]` set, since the
      // hook owned them all.
      expect(
        document.querySelectorAll(
          `script[type="application/ld+json"][${SEO_MARKER}="true"]`
        ).length
      ).toBe(0);
      expect(
        document.querySelectorAll('script[type="application/ld+json"]').length
      ).toBe(0);
    });
  });

  describe('Stale OG/hreflang cleanup on shrinking arrays', () => {
    it('removes ogImages when prop transitions from set to undefined', () => {
      const { rerender } = renderHook(
        (
          props: {
            ogImages?: { url: string; alt?: string }[];
          } = {}
        ) => useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            ogImages: [
              { url: 'https://example.com/a.jpg', alt: 'A' },
              { url: 'https://example.com/b.jpg', alt: 'B' },
            ],
          },
        }
      );

      // Should have 2 og:image entries plus secondary tags.
      expect(
        document.querySelectorAll('meta[property="og:image"]').length
      ).toBe(2);

      // Re-render with no images — all og:image* tags should be gone.
      rerender({ ogImages: undefined });

      expect(
        document.querySelectorAll('meta[property^="og:image"]').length
      ).toBe(0);
    });

    it('removes ogImages when prop transitions from set to empty array', () => {
      const { rerender } = renderHook(
        (
          props: {
            ogImages?: { url: string; alt?: string }[];
          } = {}
        ) => useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            ogImages: [{ url: 'https://example.com/a.jpg' }],
          },
        }
      );

      expect(
        document.querySelectorAll('meta[property="og:image"]').length
      ).toBe(1);

      rerender({ ogImages: [] });

      expect(
        document.querySelectorAll('meta[property^="og:image"]').length
      ).toBe(0);
    });

    it('removes ogLocaleAlternates when prop transitions from set to undefined', () => {
      const { rerender } = renderHook(
        (props: { ogLocaleAlternates?: string[] } = {}) =>
          useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            ogLocaleAlternates: ['en_GB', 'de_DE', 'fr_FR'],
          },
        }
      );

      expect(
        document.querySelectorAll('meta[property="og:locale:alternate"]').length
      ).toBe(3);

      rerender({ ogLocaleAlternates: undefined });

      expect(
        document.querySelectorAll('meta[property="og:locale:alternate"]').length
      ).toBe(0);
    });

    it('removes ogLocaleAlternates when prop transitions from set to empty array', () => {
      const { rerender } = renderHook(
        (props: { ogLocaleAlternates?: string[] } = {}) =>
          useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            ogLocaleAlternates: ['en_GB'],
          },
        }
      );

      expect(
        document.querySelectorAll('meta[property="og:locale:alternate"]').length
      ).toBe(1);

      rerender({ ogLocaleAlternates: [] });

      expect(
        document.querySelectorAll('meta[property="og:locale:alternate"]').length
      ).toBe(0);
    });

    it('removes hreflangs when prop transitions from set to undefined', () => {
      const { rerender } = renderHook(
        (props: { hreflangs?: { href: string; hrefLang: string }[] } = {}) =>
          useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            hreflangs: [
              { href: 'https://example.com/en/', hrefLang: 'en' },
              { href: 'https://example.com/de/', hrefLang: 'de' },
            ],
          },
        }
      );

      expect(
        document.querySelectorAll('link[rel="alternate"][hreflang]').length
      ).toBe(2);

      rerender({ hreflangs: undefined });

      expect(
        document.querySelectorAll('link[rel="alternate"][hreflang]').length
      ).toBe(0);
    });

    it('removes hreflangs when prop transitions from set to empty array', () => {
      const { rerender } = renderHook(
        (props: { hreflangs?: { href: string; hrefLang: string }[] } = {}) =>
          useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            hreflangs: [{ href: 'https://example.com/en/', hrefLang: 'en' }],
          },
        }
      );

      expect(
        document.querySelectorAll('link[rel="alternate"][hreflang]').length
      ).toBe(1);

      rerender({ hreflangs: [] });

      expect(
        document.querySelectorAll('link[rel="alternate"][hreflang]').length
      ).toBe(0);
    });

    it('preserves user-authored og:image / og:locale:alternate / hreflang on cleanup', () => {
      // User added an og:image manually before the hook ever ran.
      const userOgImage = document.createElement('meta');
      userOgImage.setAttribute('property', 'og:image');
      userOgImage.setAttribute('content', 'https://example.com/user.jpg');
      document.head.appendChild(userOgImage);

      const userAlternate = document.createElement('meta');
      userAlternate.setAttribute('property', 'og:locale:alternate');
      userAlternate.setAttribute('content', 'es_ES');
      document.head.appendChild(userAlternate);

      const userHreflang = document.createElement('link');
      userHreflang.setAttribute('rel', 'alternate');
      userHreflang.setAttribute('hreflang', 'pt');
      userHreflang.setAttribute('href', 'https://example.com/pt/');
      document.head.appendChild(userHreflang);

      const { rerender } = renderHook(
        (
          props: {
            ogImages?: { url: string }[];
            ogLocaleAlternates?: string[];
            hreflangs?: { href: string; hrefLang: string }[];
          } = {}
        ) => useSEO({ ...props, enableWarnings: false }),
        {
          initialProps: {
            ogImages: [{ url: 'https://example.com/hook.jpg' }],
            ogLocaleAlternates: ['fr_FR'],
            hreflangs: [{ href: 'https://example.com/en/', hrefLang: 'en' }],
          },
        }
      );

      // Re-render with all multi-value props removed.
      rerender({
        ogImages: undefined,
        ogLocaleAlternates: undefined,
        hreflangs: undefined,
      });

      // User-authored elements survive the cleanup.
      expect(document.head.contains(userOgImage)).toBe(true);
      expect(document.head.contains(userAlternate)).toBe(true);
      expect(document.head.contains(userHreflang)).toBe(true);

      // No marked (hook-created) versions remain.
      expect(
        document.querySelectorAll(
          `meta[property^="og:image"][${SEO_MARKER}="true"]`
        ).length
      ).toBe(0);
      expect(
        document.querySelectorAll(
          `meta[property="og:locale:alternate"][${SEO_MARKER}="true"]`
        ).length
      ).toBe(0);
      expect(
        document.querySelectorAll(
          `link[rel="alternate"][hreflang][${SEO_MARKER}="true"]`
        ).length
      ).toBe(0);
    });
  });

  describe('Leave-in-place semantics for title and language', () => {
    // Locks in the intentional no-flicker SPA contract: when a previously-set
    // `title` or `language` prop transitions to undefined on a subsequent
    // render, the previously-applied DOM state STAYS in place. The hook does
    // not aggressively clear `document.title` or `documentElement.lang` to
    // avoid a visible "untitled / no language" flicker during SPA navigation.
    // A future contributor "fixing" the missing clear would silently break
    // the contract — these tests fail loudly if that happens.

    it('leaves document.title intact when title transitions from set to undefined', () => {
      const { rerender } = renderHook(
        (props: { title?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        { initialProps: { title: 'Page A' } }
      );

      expect(document.title).toBe('Page A');

      rerender({ title: undefined });

      // Intentional: previously-set title is NOT cleared on prop unset.
      expect(document.title).toBe('Page A');
    });

    it('leaves documentElement.lang intact when language transitions from set to undefined', () => {
      const { rerender } = renderHook(
        (props: { language?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        { initialProps: { language: 'en' } }
      );

      expect(document.documentElement.getAttribute('lang')).toBe('en');

      rerender({ language: undefined });

      // Intentional: previously-set lang attribute is NOT cleared on prop unset.
      expect(document.documentElement.getAttribute('lang')).toBe('en');
    });
  });

  describe('Auto-emitted single-value tag cleanup', () => {
    it('removes hook-created twitter:image when effective image disappears', () => {
      const { rerender } = renderHook(
        (props: { twitterImage?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { twitterImage: 'https://example.com/twitter.jpg' },
        }
      );

      expect(getMetaContent('meta[name="twitter:image"]')).toBe(
        'https://example.com/twitter.jpg'
      );

      rerender({ twitterImage: undefined });

      expect(
        document.querySelector(
          `meta[name="twitter:image"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('preserves user-authored twitter:image element when effective image disappears', () => {
      const userTwitterImage = document.createElement('meta');
      userTwitterImage.setAttribute('name', 'twitter:image');
      userTwitterImage.setAttribute(
        'content',
        'https://example.com/user-twitter.jpg'
      );
      document.head.appendChild(userTwitterImage);

      const { rerender } = renderHook(
        (props: { twitterImage?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { twitterImage: 'https://example.com/hook.jpg' },
        }
      );

      rerender({ twitterImage: undefined });

      // The contract is: we preserve the user-authored ELEMENT (it is not
      // removed from the DOM, and it does not gain the SEO marker), but
      // we don't restore its original `content` because the hook never
      // snapshotted it. Mutations to attributes are visible.
      expect(document.head.contains(userTwitterImage)).toBe(true);
      expect(userTwitterImage.getAttribute(SEO_MARKER)).toBeNull();
    });

    it('removes hook-created og:image when effective image disappears', () => {
      const { rerender } = renderHook(
        (props: { ogImage?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { ogImage: 'https://example.com/og.jpg' },
        }
      );

      expect(getMetaContent('meta[property="og:image"]')).toBe(
        'https://example.com/og.jpg'
      );

      rerender({ ogImage: undefined });

      // The og:image* unconditional cleanup (T6) removes legacy single-image
      // tags as well.
      expect(
        document.querySelectorAll(
          `meta[property^="og:image"][${SEO_MARKER}="true"]`
        ).length
      ).toBe(0);
    });

    it('removes hook-created og:url when canonical/url disappears', () => {
      const { rerender } = renderHook(
        (props: { canonical?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { canonical: 'https://example.com/page' },
        }
      );

      expect(getMetaContent('meta[property="og:url"]')).toBe(
        'https://example.com/page'
      );

      rerender({ canonical: undefined });

      expect(
        document.querySelector(`meta[property="og:url"][${SEO_MARKER}="true"]`)
      ).toBeNull();
    });

    it('removes hook-created og:locale when language disappears', () => {
      const { rerender } = renderHook(
        (props: { ogLocale?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { ogLocale: 'en_US' },
        }
      );

      expect(getMetaContent('meta[property="og:locale"]')).toBe('en_US');

      rerender({ ogLocale: undefined });

      expect(
        document.querySelector(
          `meta[property="og:locale"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });

    it('preserves user-authored og:url when canonical disappears', () => {
      const userOgUrl = document.createElement('meta');
      userOgUrl.setAttribute('property', 'og:url');
      userOgUrl.setAttribute('content', 'https://example.com/user');
      document.head.appendChild(userOgUrl);

      const { rerender } = renderHook(
        (props: { canonical?: string } = {}) =>
          useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: { canonical: 'https://example.com/hook' },
        }
      );

      rerender({ canonical: undefined });

      // User-authored og:url stays.
      expect(document.head.contains(userOgUrl)).toBe(true);
    });

    it('falls back twitter:image to ogImages[0].url when twitterImage missing', () => {
      const { rerender } = renderHook(
        (
          props: {
            twitterImage?: string;
            ogImages?: { url: string }[];
          } = {}
        ) => useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
        {
          initialProps: {
            ogImages: [{ url: 'https://example.com/og-fallback.jpg' }],
          },
        }
      );

      // Initially falls back to og image.
      expect(getMetaContent('meta[name="twitter:image"]')).toBe(
        'https://example.com/og-fallback.jpg'
      );

      // Now drop ALL image sources — twitter:image must be removed.
      rerender({ twitterImage: undefined, ogImages: undefined });

      expect(
        document.querySelector(
          `meta[name="twitter:image"][${SEO_MARKER}="true"]`
        )
      ).toBeNull();
    });
  });
});

describe('updateLinkTag overload edge cases', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  describe('rel argument validation', () => {
    it('is a no-op when rel is an empty string', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        result.current.updateLinkTag('', 'https://example.com/foo.css', {});
      });

      // The empty rel must not produce a `<link rel="">` and must not
      // mutate any pre-existing `<link>` either.
      expect(document.querySelectorAll('link').length).toBe(0);
    });

    it('is a no-op when rel is whitespace-only', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        result.current.updateLinkTag('   ', 'https://example.com/foo.css', {});
      });

      expect(document.querySelectorAll('link').length).toBe(0);
    });

    it('is a no-op when rel is null/undefined (runtime safety)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        (result.current.updateLinkTag as any)(
          undefined,
          'https://example.com/foo.css'
        );

        (result.current.updateLinkTag as any)(
          null,
          'https://example.com/foo.css'
        );
      });

      expect(document.querySelectorAll('link').length).toBe(0);
    });

    it('emits a dev warning when rel is empty', () => {
      const warnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const { result } = renderHook(() =>
          useSEO({ autoCanonical: false, enableWarnings: true })
        );

        act(() => {
          result.current.updateLinkTag('', 'https://example.com/foo.css', {});
        });

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('updateLinkTag called without a rel')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        warnSpy.mockRestore();
      }
    });
  });

  describe('href argument validation', () => {
    it('is a no-op when href is an empty string', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        result.current.updateLinkTag('stylesheet', '', {});
      });

      expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
    });

    it('is a no-op when href is whitespace-only', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        result.current.updateLinkTag('stylesheet', '   ', {});
      });

      expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
    });

    it('is a no-op when href is null (runtime safety)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        (result.current.updateLinkTag as any)('stylesheet', null);
      });

      expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
    });

    it('is a no-op when href is undefined (runtime safety)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        (result.current.updateLinkTag as any)('stylesheet', undefined);
      });

      expect(document.querySelector('link[rel="stylesheet"]')).toBeNull();
    });

    it('does not silently remove an existing link when href is missing', () => {
      // A pre-existing user-authored link must NOT be deleted by a no-op
      // call — that would be silent data loss.
      const userLink = document.createElement('link');
      userLink.setAttribute('rel', 'canonical');
      userLink.setAttribute('href', 'https://example.com/user');
      document.head.appendChild(userLink);

      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        (result.current.updateLinkTag as any)('canonical', undefined);
      });

      expect(document.head.contains(userLink)).toBe(true);
      expect(userLink.getAttribute('href')).toBe('https://example.com/user');
    });

    it('emits a dev warning when href is empty', () => {
      const warnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const { result } = renderHook(() =>
          useSEO({ autoCanonical: false, enableWarnings: true })
        );

        act(() => {
          result.current.updateLinkTag('stylesheet', '', {});
        });

        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('empty or missing href')
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        warnSpy.mockRestore();
      }
    });
  });

  describe('overload disambiguation', () => {
    it('treats null third arg as the legacy signature (type=undefined)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        (result.current.updateLinkTag as any)(
          'stylesheet',
          'https://example.com/style.css',
          null
        );
      });

      const link = document.querySelector('link[rel="stylesheet"]');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toBe('https://example.com/style.css');
      // No type attribute should be set since the third arg was null.
      expect(link?.hasAttribute('type')).toBe(false);
    });

    it('treats undefined third arg + boolean fourth as modern (unique=true)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      // Pre-create two manifests so the unique=true behavior is observable.
      const stale = document.createElement('link');
      stale.setAttribute('rel', 'manifest');
      stale.setAttribute('href', 'https://example.com/old.json');
      document.head.appendChild(stale);

      const stale2 = document.createElement('link');
      stale2.setAttribute('rel', 'manifest');
      stale2.setAttribute('href', 'https://example.com/older.json');
      document.head.appendChild(stale2);

      act(() => {
        // attrsOrType=undefined, uniqueOrSizes=true → modern signature.
        result.current.updateLinkTag(
          'manifest',
          'https://example.com/new.json',
          undefined,
          true
        );
      });

      // Unique constraint should have collapsed everything down to one link.
      const all = document.querySelectorAll('link[rel="manifest"]');
      expect(all.length).toBe(1);
      expect(all[0]?.getAttribute('href')).toBe('https://example.com/new.json');
    });

    it('treats string third arg as legacy (type)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        (result.current.updateLinkTag as any)(
          'icon',
          'https://example.com/favicon.ico',
          'image/x-icon'
        );
      });

      const link = document.querySelector('link[rel="icon"]');
      expect(link?.getAttribute('type')).toBe('image/x-icon');
    });

    it('legacy signature: type undefined but sizes provided still maps sizes', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        // attrsOrType=undefined, uniqueOrSizes='16x16' (string) → legacy
        // signature with type=undefined, sizes='16x16'.

        (result.current.updateLinkTag as any)(
          'icon',
          'https://example.com/favicon.ico',
          undefined,
          '16x16'
        );
      });

      const link = document.querySelector('link[rel="icon"]');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toBe(
        'https://example.com/favicon.ico'
      );
      expect(link?.getAttribute('sizes')).toBe('16x16');
      expect(link?.hasAttribute('type')).toBe(false);
    });

    it('modern signature with all five args (attrs + unique + keySelector)', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        result.current.updateLinkTag(
          'alternate',
          'https://example.com/en/',
          { hrefLang: 'en' },
          false,
          '[hreflang="en"]'
        );
      });

      const link = document.querySelector(
        'link[rel="alternate"][hreflang="en"]'
      );
      expect(link).not.toBeNull();
      expect(link?.getAttribute('href')).toBe('https://example.com/en/');
    });

    it('passing all undefined trailing args after rel/href creates a bare link', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      act(() => {
        result.current.updateLinkTag(
          'preconnect',
          'https://fonts.googleapis.com'
        );
      });

      const link = document.querySelector('link[rel="preconnect"]');
      expect(link?.getAttribute('href')).toBe('https://fonts.googleapis.com');
      expect(link?.hasAttribute('type')).toBe(false);
      expect(link?.hasAttribute('sizes')).toBe(false);
      expect(link?.hasAttribute('media')).toBe(false);
    });
  });

  describe('null/undefined attrs handling does not throw', () => {
    it('null third arg does not throw', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      expect(() => {
        act(() => {
          (result.current.updateLinkTag as any)(
            'stylesheet',
            'https://example.com/x.css',
            null
          );
        });
      }).not.toThrow();
    });

    it('undefined third arg does not throw', () => {
      const { result } = renderHook(() =>
        useSEO({ autoCanonical: false, enableWarnings: false })
      );

      expect(() => {
        act(() => {
          result.current.updateLinkTag(
            'stylesheet',
            'https://example.com/x.css',
            undefined
          );
        });
      }).not.toThrow();
    });
  });
});

// ===========================================================================
// T14: Modern OG / Twitter / Robots typed fields
// ===========================================================================

describe('OG Video typed fields', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('emits og:video tags from ogVideos array with full metadata', () => {
    renderHook(() =>
      useSEO({
        ogVideos: [
          {
            url: 'https://example.com/video.mp4',
            type: 'video/mp4',
            width: 1280,
            height: 720,
            alt: 'Demo video',
          },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="og:video"]')).toBe(
      'https://example.com/video.mp4'
    );
    expect(getMetaContent('meta[property="og:video:type"]')).toBe('video/mp4');
    expect(getMetaContent('meta[property="og:video:width"]')).toBe('1280');
    expect(getMetaContent('meta[property="og:video:height"]')).toBe('720');
    expect(getMetaContent('meta[property="og:video:alt"]')).toBe('Demo video');
    // Auto-inferred secure_url for https origin.
    expect(getMetaContent('meta[property="og:video:secure_url"]')).toBe(
      'https://example.com/video.mp4'
    );
  });

  it('emits multiple og:video entries from ogVideos array', () => {
    renderHook(() =>
      useSEO({
        ogVideos: [
          { url: 'https://example.com/v1.mp4', type: 'video/mp4' },
          { url: 'https://example.com/v2.webm', type: 'video/webm' },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const videos = document.querySelectorAll('meta[property="og:video"]');
    expect(videos.length).toBe(2);
    expect(videos[0]?.getAttribute('content')).toBe(
      'https://example.com/v1.mp4'
    );
    expect(videos[1]?.getAttribute('content')).toBe(
      'https://example.com/v2.webm'
    );
  });

  it('uses explicit secureUrl over inferred https secure_url', () => {
    renderHook(() =>
      useSEO({
        ogVideos: [
          {
            url: 'http://example.com/video.mp4',
            secureUrl: 'https://cdn.example.com/video.mp4',
          },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="og:video:secure_url"]')).toBe(
      'https://cdn.example.com/video.mp4'
    );
  });

  it('emits og:video shorthand from single ogVideo string', () => {
    renderHook(() =>
      useSEO({
        ogVideo: 'https://example.com/single.mp4',
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="og:video"]')).toBe(
      'https://example.com/single.mp4'
    );
    expect(getMetaContent('meta[property="og:video:secure_url"]')).toBe(
      'https://example.com/single.mp4'
    );
  });

  it('cleans up og:video* tags when prop transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { ogVideos?: { url: string; type?: string }[] } = {}) =>
        useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
      {
        initialProps: {
          ogVideos: [
            { url: 'https://example.com/video.mp4', type: 'video/mp4' },
          ],
        },
      }
    );

    expect(document.querySelectorAll('meta[property="og:video"]').length).toBe(
      1
    );

    rerender({ ogVideos: undefined });

    expect(document.querySelectorAll('meta[property^="og:video"]').length).toBe(
      0
    );
  });

  it('cleans up og:video* tags when prop transitions to empty array', () => {
    const { rerender } = renderHook(
      (props: { ogVideos?: { url: string }[] } = {}) =>
        useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
      {
        initialProps: {
          ogVideos: [{ url: 'https://example.com/video.mp4' }],
        },
      }
    );

    expect(document.querySelectorAll('meta[property="og:video"]').length).toBe(
      1
    );

    rerender({ ogVideos: [] });

    expect(document.querySelectorAll('meta[property^="og:video"]').length).toBe(
      0
    );
  });

  it('cleans up og:video shorthand when ogVideo transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { ogVideo?: string } = {}) =>
        useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
      {
        initialProps: { ogVideo: 'https://example.com/v.mp4' },
      }
    );

    expect(getMetaContent('meta[property="og:video"]')).toBe(
      'https://example.com/v.mp4'
    );

    rerender({ ogVideo: undefined });

    expect(
      document.querySelectorAll(
        `meta[property^="og:video"][${SEO_MARKER}="true"]`
      ).length
    ).toBe(0);
  });

  it('skips ogVideos with invalid URLs when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    renderHook(() =>
      useSEO({
        ogVideos: [
          { url: 'http://[invalid', type: 'video/mp4' },
          { url: 'https://example.com/valid.mp4', type: 'video/mp4' },
        ],
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    const videos = document.querySelectorAll('meta[property="og:video"]');
    expect(videos.length).toBe(1);
    expect(videos[0]?.getAttribute('content')).toBe(
      'https://example.com/valid.mp4'
    );
    warnSpy.mockRestore();
  });

  it('prefers ogVideos over ogVideo shorthand when both are provided', () => {
    renderHook(() =>
      useSEO({
        ogVideo: 'https://example.com/single.mp4',
        ogVideos: [
          { url: 'https://example.com/multi1.mp4' },
          { url: 'https://example.com/multi2.mp4' },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const videos = document.querySelectorAll('meta[property="og:video"]');
    expect(videos.length).toBe(2);
    expect(videos[0]?.getAttribute('content')).toBe(
      'https://example.com/multi1.mp4'
    );
  });

  it('skips og:video:secure_url when secureUrl is invalid (still emits primary url)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        ogVideos: [
          {
            url: 'https://example.com/video.mp4',
            secureUrl: 'http://[invalid',
            type: 'video/mp4',
          },
        ],
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    // Primary url still emitted.
    expect(getMetaContent('meta[property="og:video"]')).toBe(
      'https://example.com/video.mp4'
    );
    // Other typed fields (type) still emitted.
    expect(getMetaContent('meta[property="og:video:type"]')).toBe('video/mp4');
    // Invalid secureUrl was rejected — no secure_url meta should be present.
    expect(
      document.querySelector('meta[property="og:video:secure_url"]')
    ).toBeNull();

    const urlWarnings = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('Invalid URL provided for og:video:secure_url')
    );
    expect(urlWarnings.length).toBeGreaterThanOrEqual(1);

    warnSpy.mockRestore();
  });
});

describe('OG Audio typed fields', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('emits og:audio tags from ogAudios array with full metadata', () => {
    renderHook(() =>
      useSEO({
        ogAudios: [
          { url: 'https://example.com/audio.mp3', type: 'audio/mpeg' },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="og:audio"]')).toBe(
      'https://example.com/audio.mp3'
    );
    expect(getMetaContent('meta[property="og:audio:type"]')).toBe('audio/mpeg');
    // Auto-inferred secure_url for https origin.
    expect(getMetaContent('meta[property="og:audio:secure_url"]')).toBe(
      'https://example.com/audio.mp3'
    );
  });

  it('emits multiple og:audio entries from ogAudios array', () => {
    renderHook(() =>
      useSEO({
        ogAudios: [
          { url: 'https://example.com/a1.mp3', type: 'audio/mpeg' },
          { url: 'https://example.com/a2.ogg', type: 'audio/ogg' },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const audios = document.querySelectorAll('meta[property="og:audio"]');
    expect(audios.length).toBe(2);
  });

  it('uses explicit secureUrl over inferred https secure_url', () => {
    renderHook(() =>
      useSEO({
        ogAudios: [
          {
            url: 'http://example.com/audio.mp3',
            secureUrl: 'https://cdn.example.com/audio.mp3',
          },
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="og:audio:secure_url"]')).toBe(
      'https://cdn.example.com/audio.mp3'
    );
  });

  it('emits og:audio shorthand from single ogAudio string', () => {
    renderHook(() =>
      useSEO({
        ogAudio: 'https://example.com/single.mp3',
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="og:audio"]')).toBe(
      'https://example.com/single.mp3'
    );
    expect(getMetaContent('meta[property="og:audio:secure_url"]')).toBe(
      'https://example.com/single.mp3'
    );
  });

  it('cleans up og:audio* tags when prop transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { ogAudios?: { url: string }[] } = {}) =>
        useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
      {
        initialProps: {
          ogAudios: [{ url: 'https://example.com/audio.mp3' }],
        },
      }
    );

    expect(document.querySelectorAll('meta[property="og:audio"]').length).toBe(
      1
    );

    rerender({ ogAudios: undefined });

    expect(document.querySelectorAll('meta[property^="og:audio"]').length).toBe(
      0
    );
  });

  it('cleans up og:audio shorthand when ogAudio transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { ogAudio?: string } = {}) =>
        useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
      {
        initialProps: { ogAudio: 'https://example.com/a.mp3' },
      }
    );

    expect(getMetaContent('meta[property="og:audio"]')).toBe(
      'https://example.com/a.mp3'
    );

    rerender({ ogAudio: undefined });

    expect(
      document.querySelectorAll(
        `meta[property^="og:audio"][${SEO_MARKER}="true"]`
      ).length
    ).toBe(0);
  });

  it('skips ogAudios with invalid URLs when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    renderHook(() =>
      useSEO({
        ogAudios: [{ url: 'http://[invalid' }],
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    expect(getMetaContent('meta[property="og:audio"]')).toBeNull();
    warnSpy.mockRestore();
  });

  it('skips og:audio:secure_url when secureUrl is invalid (still emits primary url)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    process.env.NODE_ENV = 'development';

    renderHook(() =>
      useSEO({
        ogAudios: [
          {
            url: 'https://example.com/audio.mp3',
            secureUrl: 'http://[invalid',
            type: 'audio/mpeg',
          },
        ],
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    // Primary url still emitted.
    expect(getMetaContent('meta[property="og:audio"]')).toBe(
      'https://example.com/audio.mp3'
    );
    // Other typed fields (type) still emitted.
    expect(getMetaContent('meta[property="og:audio:type"]')).toBe('audio/mpeg');
    // Invalid secureUrl was rejected — no secure_url meta should be present.
    expect(
      document.querySelector('meta[property="og:audio:secure_url"]')
    ).toBeNull();

    const urlWarnings = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('Invalid URL provided for og:audio:secure_url')
    );
    expect(urlWarnings.length).toBeGreaterThanOrEqual(1);

    warnSpy.mockRestore();
  });
});

describe('Article-specific OG typed fields', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('emits a single article:author from a string value', () => {
    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleAuthor: 'https://example.com/authors/jane',
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const authors = document.querySelectorAll(
      'meta[property="article:author"]'
    );
    expect(authors.length).toBe(1);
    expect(authors[0]?.getAttribute('content')).toBe(
      'https://example.com/authors/jane'
    );
  });

  it('emits multiple article:author tags from an array value', () => {
    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleAuthor: [
          'https://example.com/authors/jane',
          'https://example.com/authors/john',
        ],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const authors = document.querySelectorAll(
      'meta[property="article:author"]'
    );
    expect(authors.length).toBe(2);
    expect(authors[0]?.getAttribute('content')).toBe(
      'https://example.com/authors/jane'
    );
    expect(authors[1]?.getAttribute('content')).toBe(
      'https://example.com/authors/john'
    );
  });

  it('cleans up article:author tags when prop transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { articleAuthor?: string | string[] } = {}) =>
        useSEO({
          ...props,
          ogType: 'article',
          autoCanonical: false,
          enableWarnings: false,
        }),
      {
        initialProps: {
          articleAuthor: ['https://example.com/jane'],
        },
      }
    );

    expect(
      document.querySelectorAll('meta[property="article:author"]').length
    ).toBe(1);

    rerender({ articleAuthor: undefined });

    expect(
      document.querySelectorAll('meta[property="article:author"]').length
    ).toBe(0);
  });

  it('skips invalid article:author URLs when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleAuthor: ['http://[invalid', 'https://example.com/valid'],
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    const authors = document.querySelectorAll(
      'meta[property="article:author"]'
    );
    expect(authors.length).toBe(1);
    expect(authors[0]?.getAttribute('content')).toBe(
      'https://example.com/valid'
    );
    warnSpy.mockRestore();
  });

  it('accepts non-URL identifier strings for article:author (no validation)', () => {
    // Some publishers use plain text identifiers (e.g., "Jane Doe") rather
    // than profile URLs. The hook only enforces URL validation when the
    // value LOOKS like an absolute URL.
    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleAuthor: 'Jane Doe',
        validateUrls: true,
        enableWarnings: false,
        autoCanonical: false,
      })
    );

    expect(getMetaContent('meta[property="article:author"]')).toBe('Jane Doe');
  });

  it('emits article:section', () => {
    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleSection: 'Technology',
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[property="article:section"]')).toBe(
      'Technology'
    );
  });

  it('cleans up article:section when prop transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { articleSection?: string } = {}) =>
        useSEO({
          ...props,
          ogType: 'article',
          autoCanonical: false,
          enableWarnings: false,
        }),
      {
        initialProps: { articleSection: 'Tech' },
      }
    );

    expect(getMetaContent('meta[property="article:section"]')).toBe('Tech');

    rerender({ articleSection: undefined });

    expect(
      document.querySelector(
        `meta[property="article:section"][${SEO_MARKER}="true"]`
      )
    ).toBeNull();
  });

  it('emits multiple article:tag entries from articleTags array', () => {
    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleTags: ['React', 'TypeScript', 'SEO'],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const tags = document.querySelectorAll('meta[property="article:tag"]');
    expect(tags.length).toBe(3);
    expect(tags[0]?.getAttribute('content')).toBe('React');
    expect(tags[1]?.getAttribute('content')).toBe('TypeScript');
    expect(tags[2]?.getAttribute('content')).toBe('SEO');
  });

  it('cleans up article:tag entries when prop transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { articleTags?: string[] } = {}) =>
        useSEO({
          ...props,
          ogType: 'article',
          autoCanonical: false,
          enableWarnings: false,
        }),
      {
        initialProps: { articleTags: ['React', 'TS'] },
      }
    );

    expect(
      document.querySelectorAll('meta[property="article:tag"]').length
    ).toBe(2);

    rerender({ articleTags: undefined });

    expect(
      document.querySelectorAll('meta[property="article:tag"]').length
    ).toBe(0);
  });

  it('skips empty/whitespace article:tag entries', () => {
    renderHook(() =>
      useSEO({
        ogType: 'article',
        articleTags: ['React', '', '   ', 'TypeScript'],
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    const tags = document.querySelectorAll('meta[property="article:tag"]');
    expect(tags.length).toBe(2);
  });
});

describe('Twitter Player Card typed fields', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('emits twitter:player and dimensions', () => {
    renderHook(() =>
      useSEO({
        twitterCard: 'player',
        twitterPlayer: 'https://example.com/player',
        twitterPlayerWidth: 640,
        twitterPlayerHeight: 360,
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[name="twitter:player"]')).toBe(
      'https://example.com/player'
    );
    expect(getMetaContent('meta[name="twitter:player:width"]')).toBe('640');
    expect(getMetaContent('meta[name="twitter:player:height"]')).toBe('360');
  });

  it('emits twitter:player:stream and content type', () => {
    renderHook(() =>
      useSEO({
        twitterCard: 'player',
        twitterPlayer: 'https://example.com/player',
        twitterPlayerStream: 'https://example.com/stream.mp4',
        twitterPlayerStreamContentType: 'video/mp4',
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[name="twitter:player:stream"]')).toBe(
      'https://example.com/stream.mp4'
    );
    expect(
      getMetaContent('meta[name="twitter:player:stream:content_type"]')
    ).toBe('video/mp4');
  });

  it('cleans up twitter:player when prop transitions to undefined', () => {
    const { rerender } = renderHook(
      (props: { twitterPlayer?: string } = {}) =>
        useSEO({
          ...props,
          twitterCard: 'player',
          autoCanonical: false,
          enableWarnings: false,
        }),
      {
        initialProps: { twitterPlayer: 'https://example.com/player' },
      }
    );

    expect(getMetaContent('meta[name="twitter:player"]')).toBe(
      'https://example.com/player'
    );

    rerender({ twitterPlayer: undefined });

    expect(
      document.querySelector(
        `meta[name="twitter:player"][${SEO_MARKER}="true"]`
      )
    ).toBeNull();
  });

  it('cleans up twitter:player:width / height when removed', () => {
    const { rerender } = renderHook(
      (
        props: {
          twitterPlayerWidth?: number;
          twitterPlayerHeight?: number;
        } = {}
      ) =>
        useSEO({
          ...props,
          twitterCard: 'player',
          twitterPlayer: 'https://example.com/player',
          autoCanonical: false,
          enableWarnings: false,
        }),
      {
        initialProps: {
          twitterPlayerWidth: 640,
          twitterPlayerHeight: 360,
        },
      }
    );

    expect(getMetaContent('meta[name="twitter:player:width"]')).toBe('640');

    rerender({ twitterPlayerWidth: undefined, twitterPlayerHeight: undefined });

    expect(
      document.querySelector(
        `meta[name="twitter:player:width"][${SEO_MARKER}="true"]`
      )
    ).toBeNull();
    expect(
      document.querySelector(
        `meta[name="twitter:player:height"][${SEO_MARKER}="true"]`
      )
    ).toBeNull();
  });

  it('cleans up twitter:player:stream and content_type when removed', () => {
    const { rerender } = renderHook(
      (
        props: {
          twitterPlayerStream?: string;
          twitterPlayerStreamContentType?: string;
        } = {}
      ) =>
        useSEO({
          ...props,
          twitterCard: 'player',
          twitterPlayer: 'https://example.com/player',
          autoCanonical: false,
          enableWarnings: false,
        }),
      {
        initialProps: {
          twitterPlayerStream: 'https://example.com/stream.mp4',
          twitterPlayerStreamContentType: 'video/mp4',
        },
      }
    );

    expect(getMetaContent('meta[name="twitter:player:stream"]')).toBe(
      'https://example.com/stream.mp4'
    );

    rerender({
      twitterPlayerStream: undefined,
      twitterPlayerStreamContentType: undefined,
    });

    expect(
      document.querySelector(
        `meta[name="twitter:player:stream"][${SEO_MARKER}="true"]`
      )
    ).toBeNull();
    expect(
      document.querySelector(
        `meta[name="twitter:player:stream:content_type"][${SEO_MARKER}="true"]`
      )
    ).toBeNull();
  });

  it('rejects invalid twitter:player URL when validateUrls is true', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    renderHook(() =>
      useSEO({
        twitterCard: 'player',
        twitterPlayer: 'http://[invalid',
        validateUrls: true,
        enableWarnings: true,
        autoCanonical: false,
      })
    );

    expect(getMetaContent('meta[name="twitter:player"]')).toBeNull();
    warnSpy.mockRestore();
  });

  it('accepts twitterPlayerWidth: 0 (zero is a valid pixel count)', () => {
    renderHook(() =>
      useSEO({
        twitterCard: 'player',
        twitterPlayer: 'https://example.com/player',
        twitterPlayerWidth: 0,
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    // Width=0 is unusual but valid syntax — explicit `undefined` semantics
    // means we honor 0 literally rather than treating it as "unset".
    expect(getMetaContent('meta[name="twitter:player:width"]')).toBe('0');
  });
});

describe('Robots unavailable_after typed field', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('emits robots meta with unavailable_after directive', () => {
    renderHook(() =>
      useSEO({
        robots: { unavailableAfter: '2025-12-31T23:59:59Z' },
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[name="robots"]')).toBe(
      'unavailable_after: 2025-12-31T23:59:59Z'
    );
  });

  it('cleans up robots meta when unavailable_after is the only directive and it is removed', () => {
    const { rerender } = renderHook(
      (props: { robots?: { unavailableAfter?: string } } = {}) =>
        useSEO({ ...props, autoCanonical: false, enableWarnings: false }),
      {
        initialProps: {
          robots: { unavailableAfter: '2025-12-31T23:59:59Z' },
        },
      }
    );

    expect(getMetaContent('meta[name="robots"]')).toBe(
      'unavailable_after: 2025-12-31T23:59:59Z'
    );

    rerender({ robots: undefined });

    expect(
      document.querySelector(`meta[name="robots"][${SEO_MARKER}="true"]`)
    ).toBeNull();
  });

  it('combines unavailable_after with other directives', () => {
    renderHook(() =>
      useSEO({
        robots: {
          index: true,
          follow: false,
          unavailableAfter: '2025-12-31T23:59:59Z',
        },
        autoCanonical: false,
        enableWarnings: false,
      })
    );

    expect(getMetaContent('meta[name="robots"]')).toBe(
      'index,nofollow,unavailable_after: 2025-12-31T23:59:59Z'
    );
  });
});

describe('Main useEffect catch-branch coverage', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
    document.documentElement.removeAttribute('lang');
    resetCanUseDOMCache();
  });

  it('logs via logError and does not crash when an inner DOM operation throws', () => {
    // The main useEffect wraps every DOM mutation in a try/catch and routes
    // errors through `logError`, which calls `console.error` in development.
    // We force the catch to fire by making `document.head.appendChild` throw
    // the first time it's invoked inside the effect.
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const originalAppendChild = document.head.appendChild.bind(document.head);
    let throwOnce = true;
    const appendSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node: Node) => {
        if (throwOnce) {
          throwOnce = false;
          throw new Error('synthetic appendChild failure for catch coverage');
        }
        return originalAppendChild(node);
      });

    try {
      // Renders should NOT throw — the hook must swallow the error.
      expect(() => {
        renderHook(() =>
          useSEO({
            title: 'Catch Branch Title',
            description: 'A description that exercises the catch branch',
            // Force an OG image so multiple appendChild calls happen.
            ogImages: [
              {
                url: 'https://example.com/img.jpg',
                width: 1200,
                height: 630,
                alt: 'alt',
              },
            ],
            autoCanonical: false,
            enableWarnings: false,
          })
        );
      }).not.toThrow();

      // logError calls `console.error` with the canonical "[useSEO Error]"
      // prefix and the original Error as the second argument.
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useSEO Error]: Error updating head tags'),
        expect.any(Error)
      );
    } finally {
      appendSpy.mockRestore();
      errorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('recovers on a subsequent render once the underlying DOM operation works again', () => {
    // First render throws inside the effect. The hook logs and bails.
    // Second render (with the mock cleared) succeeds and applies meta tags
    // normally. This proves the hook is not left in a broken internal state.
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // appendSpy.mockRestore() below restores the original appendChild for
    // the recovery render, so we don't need to capture a manual reference.
    const appendSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation(() => {
        throw new Error('first-render failure');
      });

    let lastTitle: string | undefined = 'Initial';
    const { rerender } = renderHook(
      ({ title }: { title?: string }) => {
        lastTitle = title;
        return useSEO({
          title,
          description: 'Recovery scenario description text content here',
          autoCanonical: false,
          enableWarnings: false,
        });
      },
      { initialProps: { title: 'Initial' } }
    );

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[useSEO Error]'),
      expect.any(Error)
    );

    // Restore the real appendChild so the next effect run completes normally.
    appendSpy.mockRestore();
    // Also clear the error spy so we can assert no NEW errors fire on retry.
    errorSpy.mockClear();

    try {
      rerender({ title: 'Recovered' });

      // The hook successfully applied the new title — proves it recovered.
      expect(document.title).toBe('Recovered');
      expect(lastTitle).toBe('Recovered');
      // No error logged on the recovery render.
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('does not unmount or destroy the React tree when the effect throws', () => {
    // A defensive test: sometimes a thrown error inside an effect surfaces as
    // an uncaught exception that React would log via its own error boundary
    // path. We verify that a renderHook call sets up cleanly and the hook's
    // returned object is still callable even after the catch branch ran.
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const appendSpy = jest
      .spyOn(document.head, 'appendChild')
      .mockImplementation(() => {
        throw new Error('always-throwing appendChild');
      });

    try {
      const { result } = renderHook(() =>
        useSEO({
          title: 'Survives Errors',
          description: 'A description used during the catch-branch test',
          autoCanonical: false,
          enableWarnings: false,
        })
      );

      // The returned API is intact — the hook didn't bail out before
      // returning its result object.
      expect(typeof result.current.updateMetaTag).toBe('function');
      expect(typeof result.current.updateLinkTag).toBe('function');
      expect(typeof result.current.clearSEOTags).toBe('function');
      expect(typeof result.current.getCurrentSEO).toBe('function');

      // logError fired exactly because the effect tried to mutate the DOM.
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[useSEO Error]'),
        expect.any(Error)
      );
    } finally {
      appendSpy.mockRestore();
      errorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    }
  });
});
