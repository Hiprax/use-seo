/**
 * Tests for validation utility functions
 */

import {
  isValidUrl,
  normalizeCanonical,
  normalizeLanguageTag,
  isUrlField,
  inferImageMimeType,
} from '../../src/utils/validation';

describe('isValidUrl', () => {
  it('returns true for valid absolute URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com/path')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    expect(isValidUrl('https://example.com:8080/path')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  it('handles relative URLs when allowRelative is true', () => {
    expect(isValidUrl('/path/to/page', true)).toBe(true);
    expect(isValidUrl('./relative', true)).toBe(true);
    expect(isValidUrl('../parent', true)).toBe(true);
  });

  it('rejects relative URLs when allowRelative is false', () => {
    expect(isValidUrl('/path/to/page', false)).toBe(false);
    expect(isValidUrl('/path/to/page')).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(isValidUrl(null as unknown as string)).toBe(false);
    expect(isValidUrl(undefined as unknown as string)).toBe(false);
  });
});

describe('normalizeCanonical', () => {
  it('removes hash fragments', () => {
    expect(normalizeCanonical('https://example.com/page#section')).toBe(
      'https://example.com/page'
    );
  });

  it('normalizes relative URLs to absolute', () => {
    const result = normalizeCanonical('/page');
    expect(result).toContain('/page');
  });

  it('returns original for invalid input', () => {
    expect(normalizeCanonical('')).toBe('');
    expect(normalizeCanonical(null as unknown as string)).toBe('');
  });

  it('preserves query parameters', () => {
    expect(normalizeCanonical('https://example.com/page?foo=bar')).toBe(
      'https://example.com/page?foo=bar'
    );
  });

  it('returns original URL when parsing fails', () => {
    // Test with a URL that will fail to parse
    const invalidUrl = 'http://[::1';
    const result = normalizeCanonical(invalidUrl);
    expect(result).toBe(invalidUrl);
  });
});

describe('normalizeLanguageTag', () => {
  it('returns normalized language tags', () => {
    expect(normalizeLanguageTag('en')).toBe('en');
    expect(normalizeLanguageTag('EN')).toBe('en');
  });

  it('normalizes language-region tags', () => {
    expect(normalizeLanguageTag('en-US')).toBe('en-US');
    expect(normalizeLanguageTag('en-us')).toBe('en-US');
  });

  it('returns undefined for invalid tags', () => {
    expect(normalizeLanguageTag('')).toBeUndefined();
    expect(normalizeLanguageTag(null as unknown as string)).toBeUndefined();
    expect(normalizeLanguageTag(undefined)).toBeUndefined();
    expect(normalizeLanguageTag('   ')).toBeUndefined();
  });

  it('handles valid BCP 47 patterns', () => {
    expect(normalizeLanguageTag('zh-Hans')).toBe('zh-Hans');
    expect(normalizeLanguageTag('pt-BR')).toBe('pt-BR');
  });

  it('falls back to BCP47 pattern when Intl fails', () => {
    // Mock Intl to throw an error
    const originalIntl = global.Intl;
    const mockIntl = {
      ...originalIntl,
      getCanonicalLocales: () => {
        throw new Error('Mock error');
      },
    };
    global.Intl = mockIntl;

    // Should still work with fallback pattern
    expect(normalizeLanguageTag('en')).toBe('en');
    expect(normalizeLanguageTag('en-US')).toBe('en-US');
    expect(normalizeLanguageTag('invalid!!')).toBeUndefined();

    // Restore
    global.Intl = originalIntl;
  });

  it('returns undefined when Intl returns empty array', () => {
    const originalIntl = global.Intl;
    const mockIntl = {
      ...originalIntl,
      getCanonicalLocales: () => [],
    };
    global.Intl = mockIntl;

    expect(normalizeLanguageTag('xx')).toBeUndefined();

    global.Intl = originalIntl;
  });

  it('normalizes script + region tags via Intl', () => {
    expect(normalizeLanguageTag('zh-Hant-TW')).toBe('zh-Hant-TW');
    expect(normalizeLanguageTag('zh-hans-cn')).toBe('zh-Hans-CN');
    expect(normalizeLanguageTag('SR-LATN-RS')).toBe('sr-Latn-RS');
  });

  it('handles UN M.49 numeric region codes via Intl', () => {
    expect(normalizeLanguageTag('es-419')).toBe('es-419');
  });

  describe('Intl fallback (BCP 47 regex)', () => {
    let originalIntl: typeof Intl;

    beforeEach(() => {
      originalIntl = global.Intl;
      const mockIntl = {
        ...originalIntl,
        getCanonicalLocales: () => {
          throw new Error('Mock: Intl unavailable');
        },
      };
      global.Intl = mockIntl;
    });

    afterEach(() => {
      global.Intl = originalIntl;
    });

    it('accepts plain language tags', () => {
      expect(normalizeLanguageTag('en')).toBe('en');
      expect(normalizeLanguageTag('fr')).toBe('fr');
      expect(normalizeLanguageTag('de')).toBe('de');
    });

    it('accepts language-region', () => {
      expect(normalizeLanguageTag('en-US')).toBe('en-US');
      expect(normalizeLanguageTag('pt-BR')).toBe('pt-BR');
    });

    it('accepts script-only and script + region', () => {
      expect(normalizeLanguageTag('zh-Hant')).toBe('zh-Hant');
      expect(normalizeLanguageTag('zh-Hant-TW')).toBe('zh-Hant-TW');
      expect(normalizeLanguageTag('zh-Hans-CN')).toBe('zh-Hans-CN');
    });

    it('accepts numeric region (UN M.49)', () => {
      expect(normalizeLanguageTag('es-419')).toBe('es-419');
    });

    it('accepts variant subtags', () => {
      // Slovenian Resian dialect; valid variant.
      expect(normalizeLanguageTag('sl-rozaj')).toBe('sl-rozaj');
      // Year-style variant.
      expect(normalizeLanguageTag('de-1996')).toBe('de-1996');
    });

    it('accepts extension subtags (singleton + extension)', () => {
      expect(normalizeLanguageTag('en-US-u-ca-buddhist')).toBe(
        'en-US-u-ca-buddhist'
      );
      expect(normalizeLanguageTag('en-u-co-phonebk')).toBe('en-u-co-phonebk');
      expect(normalizeLanguageTag('en-t-en-latn')).toBe('en-t-en-latn');
    });

    it('accepts private-use subtags', () => {
      expect(normalizeLanguageTag('en-x-private')).toBe('en-x-private');
      expect(normalizeLanguageTag('en-US-x-mycorp')).toBe('en-US-x-mycorp');
      // Whole-tag private use.
      expect(normalizeLanguageTag('x-foo')).toBe('x-foo');
    });

    it('accepts extlang subtags', () => {
      // Spoken Mandarin Chinese.
      expect(normalizeLanguageTag('zh-cmn')).toBe('zh-cmn');
      // Hong Kong Cantonese script + region.
      expect(normalizeLanguageTag('zh-yue-Hant-HK')).toBe('zh-yue-Hant-HK');
    });

    it('rejects malformed inputs', () => {
      expect(normalizeLanguageTag('invalid!!')).toBeUndefined();
      expect(normalizeLanguageTag('e')).toBeUndefined();
      expect(normalizeLanguageTag('123')).toBeUndefined();
      expect(normalizeLanguageTag('en--US')).toBeUndefined();
      expect(normalizeLanguageTag('en-')).toBeUndefined();
      expect(normalizeLanguageTag('-en')).toBeUndefined();
      // Singleton 'x' is reserved for private use; reject as a bare extension.
      expect(normalizeLanguageTag('en-x')).toBeUndefined();
    });
  });
});

describe('isUrlField', () => {
  it('returns true for URL-related field names', () => {
    expect(isUrlField('url')).toBe(true);
    expect(isUrlField('og:url')).toBe(true);
    expect(isUrlField('og:image')).toBe(true);
    expect(isUrlField('twitter:image')).toBe(true);
    expect(isUrlField('canonical')).toBe(true);
    expect(isUrlField('href')).toBe(true);
  });

  it('returns false for non-URL field names', () => {
    expect(isUrlField('title')).toBe(false);
    expect(isUrlField('description')).toBe(false);
    expect(isUrlField('keywords')).toBe(false);
  });

  it('handles empty or undefined', () => {
    expect(isUrlField('')).toBe(false);
    expect(isUrlField(undefined as unknown as string)).toBe(false);
    expect(isUrlField(null as unknown as string)).toBe(false);
  });

  it('handles non-string input', () => {
    expect(isUrlField(123 as unknown as string)).toBe(false);
    expect(isUrlField({} as unknown as string)).toBe(false);
  });

  it('matches well-known OG/Twitter URL properties', () => {
    expect(isUrlField('og:audio')).toBe(true);
    expect(isUrlField('og:video')).toBe(true);
    expect(isUrlField('og:image:secure_url')).toBe(true);
    expect(isUrlField('og:audio:secure_url')).toBe(true);
    expect(isUrlField('og:video:secure_url')).toBe(true);
    expect(isUrlField('twitter:image:src')).toBe(true);
    expect(isUrlField('twitter:url')).toBe(true);
    expect(isUrlField('twitter:player')).toBe(true);
    expect(isUrlField('twitter:player:stream')).toBe(true);
  });

  it('matches camelCase URL/Href/Image/Src suffixes', () => {
    expect(isUrlField('secureUrl')).toBe(true);
    expect(isUrlField('thumbnailUrl')).toBe(true);
    expect(isUrlField('coverImage')).toBe(true);
    expect(isUrlField('avatarSrc')).toBe(true);
    expect(isUrlField('originHref')).toBe(true);
  });

  it('matches separator-bounded URL/href/image/src suffixes', () => {
    expect(isUrlField('msapplication-tileimage')).toBe(true);
    expect(isUrlField('preview-image')).toBe(true);
    expect(isUrlField('foo:url')).toBe(true);
    expect(isUrlField('foo_href')).toBe(true);
    expect(isUrlField('thing.src')).toBe(true);
  });

  it('does NOT match boundary-less names that contain URL-ish substrings', () => {
    // These were false-positives under the old substring heuristic.
    expect(isUrlField('urltext')).toBe(false);
    expect(isUrlField('imagealt')).toBe(false);
    expect(isUrlField('thumbnailalt')).toBe(false);
    expect(isUrlField('hreflang')).toBe(false);
    expect(isUrlField('sourcecode')).toBe(false);
    expect(isUrlField('imageGalleryName')).toBe(false);
    expect(isUrlField('canonicalsource')).toBe(false);
  });

  it('canonical matches but related but-non-URL names do not', () => {
    expect(isUrlField('canonical')).toBe(true);
    // Note: 'canonicaltitle' has no boundary so it must NOT match.
    expect(isUrlField('canonicaltitle')).toBe(false);
  });

  it('hrefLang is NOT a URL field even though it contains "href"', () => {
    expect(isUrlField('hrefLang')).toBe(false);
    expect(isUrlField('hreflang')).toBe(false);
  });

  it('article author/publisher are URL fields per Open Graph spec', () => {
    expect(isUrlField('article:author')).toBe(true);
    expect(isUrlField('article:publisher')).toBe(true);
  });

  it('case-insensitive on the exact-match list', () => {
    expect(isUrlField('OG:URL')).toBe(true);
    expect(isUrlField('Og:Image')).toBe(true);
    expect(isUrlField('CANONICAL')).toBe(true);
  });
});

describe('inferImageMimeType', () => {
  it('infers JPEG type', () => {
    expect(inferImageMimeType('https://example.com/image.jpg')).toBe(
      'image/jpeg'
    );
    expect(inferImageMimeType('https://example.com/image.jpeg')).toBe(
      'image/jpeg'
    );
  });

  it('infers PNG type', () => {
    expect(inferImageMimeType('https://example.com/image.png')).toBe(
      'image/png'
    );
  });

  it('infers GIF type', () => {
    expect(inferImageMimeType('https://example.com/image.gif')).toBe(
      'image/gif'
    );
  });

  it('infers WebP type', () => {
    expect(inferImageMimeType('https://example.com/image.webp')).toBe(
      'image/webp'
    );
  });

  it('infers SVG type', () => {
    expect(inferImageMimeType('https://example.com/image.svg')).toBe(
      'image/svg+xml'
    );
  });

  it('infers AVIF type', () => {
    expect(inferImageMimeType('https://example.com/image.avif')).toBe(
      'image/avif'
    );
  });

  it('handles query strings', () => {
    expect(inferImageMimeType('https://example.com/image.jpg?width=100')).toBe(
      'image/jpeg'
    );
  });

  it('handles hash fragments', () => {
    expect(inferImageMimeType('https://example.com/image.jpg#section')).toBe(
      'image/jpeg'
    );
    expect(inferImageMimeType('https://example.com/photo.png#top')).toBe(
      'image/png'
    );
    expect(inferImageMimeType('https://example.com/icon.svg#id')).toBe(
      'image/svg+xml'
    );
  });

  it('handles URLs with both query strings and hash fragments', () => {
    expect(inferImageMimeType('https://example.com/image.png?w=100#hash')).toBe(
      'image/png'
    );
    expect(
      inferImageMimeType('https://example.com/photo.webp?quality=80#section')
    ).toBe('image/webp');
  });

  it('returns undefined for unknown extensions', () => {
    expect(inferImageMimeType('https://example.com/file.pdf')).toBeUndefined();
    expect(inferImageMimeType('https://example.com/file')).toBeUndefined();
  });

  it('handles invalid input', () => {
    expect(inferImageMimeType('')).toBeUndefined();
    expect(inferImageMimeType(null as unknown as string)).toBeUndefined();
  });

  it('infers ICO type', () => {
    expect(inferImageMimeType('https://example.com/favicon.ico')).toBe(
      'image/x-icon'
    );
  });

  it('handles uppercase extensions', () => {
    expect(inferImageMimeType('https://example.com/photo.JPG')).toBe(
      'image/jpeg'
    );
    expect(inferImageMimeType('https://example.com/logo.PNG')).toBe(
      'image/png'
    );
  });

  it('infers TIFF type', () => {
    expect(inferImageMimeType('https://example.com/scan.tiff')).toBe(
      'image/tiff'
    );
    expect(inferImageMimeType('https://example.com/scan.tif')).toBe(
      'image/tiff'
    );
    expect(inferImageMimeType('https://example.com/SCAN.TIFF')).toBe(
      'image/tiff'
    );
  });

  it('infers HEIC / HEIF type', () => {
    expect(inferImageMimeType('https://example.com/photo.heic')).toBe(
      'image/heic'
    );
    expect(inferImageMimeType('https://example.com/photo.HEIC')).toBe(
      'image/heic'
    );
    expect(inferImageMimeType('https://example.com/photo.heif')).toBe(
      'image/heif'
    );
    expect(inferImageMimeType('https://example.com/photo.HEIF')).toBe(
      'image/heif'
    );
  });

  it('infers BMP type', () => {
    expect(inferImageMimeType('https://example.com/legacy.bmp')).toBe(
      'image/bmp'
    );
    expect(inferImageMimeType('https://example.com/legacy.BMP')).toBe(
      'image/bmp'
    );
  });

  it('infers JPEG XL (jxl) type', () => {
    expect(inferImageMimeType('https://example.com/next.jxl')).toBe(
      'image/jxl'
    );
    expect(inferImageMimeType('https://example.com/next.JXL')).toBe(
      'image/jxl'
    );
  });

  it('infers APNG type', () => {
    expect(inferImageMimeType('https://example.com/anim.apng')).toBe(
      'image/apng'
    );
    expect(inferImageMimeType('https://example.com/anim.APNG')).toBe(
      'image/apng'
    );
  });

  it('handles modern formats with query strings and fragments', () => {
    expect(
      inferImageMimeType('https://example.com/photo.heic?width=200#id')
    ).toBe('image/heic');
    expect(inferImageMimeType('https://example.com/v1/scan.tif?v=2')).toBe(
      'image/tiff'
    );
  });

  it('ignores a dotted extension embedded in the query string of an extensionless path', () => {
    expect(
      inferImageMimeType('https://img.example.com/render?w=100&file=photo.png')
    ).toBeUndefined();
    expect(
      inferImageMimeType('https://example.com/dynamic-image?ratio=1.5')
    ).toBeUndefined();
  });

  it('still infers the extension when the path itself has one, query string notwithstanding', () => {
    expect(inferImageMimeType('https://example.com/image.png?v=2')).toBe(
      'image/png'
    );
    expect(inferImageMimeType('https://example.com/image.jpg#frag')).toBe(
      'image/jpeg'
    );
  });
});

describe('normalizeCanonical edge cases', () => {
  it('strips empty hash fragment', () => {
    const result = normalizeCanonical('https://example.com/page#');
    expect(result).toBe('https://example.com/page');
  });

  it('strips hash-only from root URL', () => {
    const result = normalizeCanonical('https://example.com/#section');
    expect(result).toBe('https://example.com/');
  });
});
