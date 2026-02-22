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
    global.Intl = mockIntl as typeof Intl;

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
    global.Intl = mockIntl as typeof Intl;

    expect(normalizeLanguageTag('xx')).toBeUndefined();

    global.Intl = originalIntl;
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
    expect(
      inferImageMimeType('https://example.com/image.png?w=100#hash')
    ).toBe('image/png');
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
