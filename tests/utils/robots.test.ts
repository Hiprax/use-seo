/**
 * Tests for robots utility functions
 */

import { buildRobots, buildRobotsFromFlags } from '../../src/utils/robots';

describe('buildRobots', () => {
  it('returns empty object for undefined input', () => {
    expect(buildRobots(undefined)).toEqual({});
  });

  it('handles string input', () => {
    expect(buildRobots('noindex,nofollow')).toEqual({
      robots: 'noindex,nofollow',
    });
  });

  it('handles empty string', () => {
    expect(buildRobots('')).toEqual({});
    expect(buildRobots('   ')).toEqual({});
  });

  it('builds robots string from object with index false', () => {
    const result = buildRobots({ index: false });
    expect(result.robots).toContain('noindex');
  });

  it('builds robots string from object with follow false', () => {
    const result = buildRobots({ follow: false });
    expect(result.robots).toContain('nofollow');
  });

  it('builds robots string with noarchive', () => {
    const result = buildRobots({ noarchive: true });
    expect(result.robots).toContain('noarchive');
  });

  it('builds robots string with nosnippet', () => {
    const result = buildRobots({ nosnippet: true });
    expect(result.robots).toContain('nosnippet');
  });

  it('builds robots string with noimageindex', () => {
    const result = buildRobots({ noimageindex: true });
    expect(result.robots).toContain('noimageindex');
  });

  it('builds robots string with maxSnippet', () => {
    const result = buildRobots({ maxSnippet: 150 });
    expect(result.robots).toContain('max-snippet:150');
  });

  it('builds robots string with maxSnippet none', () => {
    const result = buildRobots({ maxSnippet: 'none' });
    expect(result.robots).toContain('max-snippet:none');
  });

  it('builds robots string with maxImagePreview', () => {
    const result = buildRobots({ maxImagePreview: 'large' });
    expect(result.robots).toContain('max-image-preview:large');
  });

  it('builds robots string with maxVideoPreview', () => {
    const result = buildRobots({ maxVideoPreview: 30 });
    expect(result.robots).toContain('max-video-preview:30');
  });

  it('handles googlebot as string', () => {
    const result = buildRobots({
      index: true,
      googlebot: 'noindex',
    });
    expect(result.googlebot).toBe('noindex');
  });

  it('handles googlebot as object', () => {
    const result = buildRobots({
      index: true,
      googlebot: { index: false, maxVideoPreview: 0 },
    });
    expect(result.googlebot).toContain('noindex');
    expect(result.googlebot).toContain('max-video-preview:0');
  });

  it('handles empty googlebot string', () => {
    const result = buildRobots({
      index: true,
      googlebot: '   ',
    });
    expect(result.googlebot).toBeUndefined();
  });

  it('emits explicit positive directives for googlebot when index/follow are true', () => {
    // Previously this returned undefined; explicit `true` now emits the
    // positive form so users can override a parent <meta> reliably.
    const result = buildRobots({
      index: true,
      googlebot: { index: true, follow: true },
    });
    expect(result.googlebot).toBe('index,follow');
  });

  it('returns undefined googlebot string when googlebot has no defined directives', () => {
    const result = buildRobots({
      index: true,
      googlebot: {},
    });
    expect(result.googlebot).toBeUndefined();
  });

  it('combines multiple directives', () => {
    const result = buildRobots({
      index: false,
      follow: false,
      noarchive: true,
      maxSnippet: 100,
    });
    expect(result.robots).toContain('noindex');
    expect(result.robots).toContain('nofollow');
    expect(result.robots).toContain('noarchive');
    expect(result.robots).toContain('max-snippet:100');
  });

  it('emits explicit positive directives when index/follow are explicitly true', () => {
    // Setting `{ index: true, follow: true }` now emits `index,follow` so
    // that callers can override a parent <meta name="robots" content="noindex">
    // (e.g. injected via Tag Manager) without producing an empty robots tag.
    const result = buildRobots({
      index: true,
      follow: true,
    });
    expect(result.robots).toBe('index,follow');
  });

  it('returns undefined robots for empty object (no defined directives)', () => {
    const result = buildRobots({});
    expect(result.robots).toBeUndefined();
  });

  it('returns undefined robots when only googlebot is set', () => {
    // The top-level robots string should be undefined because no top-level
    // directive is set; only the nested googlebot directive is populated.
    const result = buildRobots({ googlebot: { index: false } });
    expect(result.robots).toBeUndefined();
    expect(result.googlebot).toBe('noindex');
  });
});

describe('buildRobotsFromFlags', () => {
  it('returns undefined when no flags are set', () => {
    expect(buildRobotsFromFlags({})).toBeUndefined();
    expect(
      buildRobotsFromFlags({
        noindex: false,
        nofollow: false,
        noarchive: false,
        nosnippet: false,
        noimageindex: false,
      })
    ).toBeUndefined();
  });

  it('converts noindex flag', () => {
    const result = buildRobotsFromFlags({ noindex: true });
    expect(result?.index).toBe(false);
  });

  it('converts nofollow flag', () => {
    const result = buildRobotsFromFlags({ nofollow: true });
    expect(result?.follow).toBe(false);
  });

  it('converts noarchive flag', () => {
    const result = buildRobotsFromFlags({ noarchive: true });
    expect(result?.noarchive).toBe(true);
  });

  it('converts nosnippet flag', () => {
    const result = buildRobotsFromFlags({ nosnippet: true });
    expect(result?.nosnippet).toBe(true);
  });

  it('converts noimageindex flag', () => {
    const result = buildRobotsFromFlags({ noimageindex: true });
    expect(result?.noimageindex).toBe(true);
  });

  it('combines multiple flags', () => {
    const result = buildRobotsFromFlags({
      noindex: true,
      nofollow: true,
      noarchive: true,
    });
    expect(result?.index).toBe(false);
    expect(result?.follow).toBe(false);
    expect(result?.noarchive).toBe(true);
  });
});

describe('buildRobots additional directives', () => {
  it('handles maxVideoPreview with none', () => {
    const result = buildRobots({ maxVideoPreview: 'none' });
    expect(result.robots).toContain('max-video-preview:none');
  });

  it('handles maxImagePreview with none', () => {
    const result = buildRobots({ maxImagePreview: 'none' });
    expect(result.robots).toContain('max-image-preview:none');
  });

  it('handles maxImagePreview with standard', () => {
    const result = buildRobots({ maxImagePreview: 'standard' });
    expect(result.robots).toContain('max-image-preview:standard');
  });

  it('handles maxSnippet with zero', () => {
    const result = buildRobots({ maxSnippet: 0 });
    expect(result.robots).toContain('max-snippet:0');
  });
});

describe('buildRobots positive directives (index/follow tri-state)', () => {
  it('{ index: true } alone emits "index"', () => {
    expect(buildRobots({ index: true }).robots).toBe('index');
  });

  it('{ follow: true } alone emits "follow"', () => {
    expect(buildRobots({ follow: true }).robots).toBe('follow');
  });

  it('{ index: true, follow: false } emits "index,nofollow"', () => {
    expect(buildRobots({ index: true, follow: false }).robots).toBe(
      'index,nofollow'
    );
  });

  it('{ index: false, follow: true } emits "noindex,follow"', () => {
    expect(buildRobots({ index: false, follow: true }).robots).toBe(
      'noindex,follow'
    );
  });

  it('{ index: false, follow: false } emits "noindex,nofollow"', () => {
    expect(buildRobots({ index: false, follow: false }).robots).toBe(
      'noindex,nofollow'
    );
  });

  it('{ index: true, follow: true } emits "index,follow"', () => {
    expect(buildRobots({ index: true, follow: true }).robots).toBe(
      'index,follow'
    );
  });

  it('omits index/follow entirely when undefined', () => {
    // Only `noarchive` should appear; index/follow are not set, so neither
    // their positive nor negative form is emitted.
    expect(buildRobots({ noarchive: true }).robots).toBe('noarchive');
  });

  it('combines positive directives with maxSnippet/maxImagePreview/maxVideoPreview', () => {
    const result = buildRobots({
      index: true,
      follow: true,
      maxSnippet: 200,
      maxImagePreview: 'large',
      maxVideoPreview: 30,
    });
    // Order: index, follow, then noarchive/nosnippet/noimageindex (none),
    // then max-snippet, max-image-preview, max-video-preview.
    expect(result.robots).toBe(
      'index,follow,max-snippet:200,max-image-preview:large,max-video-preview:30'
    );
  });

  it('combines positive index with negative directives like noarchive', () => {
    const result = buildRobots({
      index: true,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      maxSnippet: 'none',
    });
    expect(result.robots).toBe(
      'index,nofollow,noarchive,nosnippet,noimageindex,max-snippet:none'
    );
  });

  it('googlebot directives respect the same tri-state semantics', () => {
    expect(
      buildRobots({ googlebot: { index: true, follow: true } }).googlebot
    ).toBe('index,follow');
    expect(
      buildRobots({ googlebot: { index: true, follow: false } }).googlebot
    ).toBe('index,nofollow');
    expect(
      buildRobots({ googlebot: { index: false, follow: true } }).googlebot
    ).toBe('noindex,follow');
    expect(
      buildRobots({
        googlebot: {
          index: true,
          follow: true,
          maxSnippet: 50,
          maxImagePreview: 'standard',
          maxVideoPreview: 'none',
        },
      }).googlebot
    ).toBe(
      'index,follow,max-snippet:50,max-image-preview:standard,max-video-preview:none'
    );
  });

  it('top-level positive directives coexist with googlebot overrides', () => {
    const result = buildRobots({
      index: true,
      follow: true,
      googlebot: { index: false },
    });
    expect(result.robots).toBe('index,follow');
    expect(result.googlebot).toBe('noindex');
  });
});

describe('buildRobots unavailable_after directive', () => {
  it('emits "unavailable_after: <value>" with an ISO 8601 datetime', () => {
    const result = buildRobots({
      unavailableAfter: '2025-12-31T23:59:59Z',
    });
    expect(result.robots).toBe('unavailable_after: 2025-12-31T23:59:59Z');
  });

  it('emits "unavailable_after: <value>" with an RFC 850 datetime', () => {
    // Per Google's spec, RFC 850 ("Friday, 31-Dec-25 23:59:59 GMT") is also
    // accepted; the serializer passes the value through verbatim.
    const result = buildRobots({
      unavailableAfter: 'Friday, 31-Dec-25 23:59:59 GMT',
    });
    expect(result.robots).toBe(
      'unavailable_after: Friday, 31-Dec-25 23:59:59 GMT'
    );
  });

  it('combines unavailable_after with index/follow directives', () => {
    const result = buildRobots({
      index: true,
      follow: true,
      unavailableAfter: '2025-12-31T23:59:59Z',
    });
    expect(result.robots).toBe(
      'index,follow,unavailable_after: 2025-12-31T23:59:59Z'
    );
  });

  it('omits unavailable_after when not set', () => {
    expect(buildRobots({ index: true }).robots).toBe('index');
  });

  it('omits unavailable_after when empty string is passed', () => {
    // An empty string is truthy-coerced to false by `if (opt.unavailableAfter)`,
    // so it's omitted — desirable behavior because an empty value would
    // otherwise emit `unavailable_after: ` which is malformed.
    const result = buildRobots({
      index: true,
      unavailableAfter: '',
    });
    expect(result.robots).toBe('index');
  });

  it('respects unavailable_after inside googlebot directives', () => {
    const result = buildRobots({
      googlebot: { unavailableAfter: '2025-12-31T23:59:59Z' },
    });
    expect(result.googlebot).toBe('unavailable_after: 2025-12-31T23:59:59Z');
  });
});

describe('buildRobots precedence: robots prop wins over deprecated flags', () => {
  // The `useSEO` hook resolves precedence as:
  //   effectiveRobots = robots ?? buildRobotsFromFlags({ noindex, nofollow, ... })
  // So when both are present, the `robots` prop wins. These tests verify
  // that the underlying utility functions support this precedence cleanly:
  // a caller that explicitly passes `{ index: true, follow: true }` to
  // override deprecated flags now gets a meaningful robots string instead
  // of an empty one.

  it('passing { index: true } to buildRobots returns the positive form', () => {
    // This is the building block that makes precedence work in useSEO:
    // when `robots` is set, we ignore the deprecated flags entirely, but
    // the user must still be able to *opt back in* to "index" explicitly.
    expect(buildRobots({ index: true }).robots).toBe('index');
  });

  it('buildRobotsFromFlags still emits the negative form unchanged', () => {
    // Sanity: deprecated flags are unchanged — they only express the
    // negative form and that's what the consumer would expect.
    expect(buildRobotsFromFlags({ noindex: true, nofollow: true })).toEqual({
      index: false,
      follow: false,
      noarchive: undefined,
      nosnippet: undefined,
      noimageindex: undefined,
    });
  });
});
