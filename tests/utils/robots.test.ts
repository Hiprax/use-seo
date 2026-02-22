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

  it('handles googlebot object that results in empty string', () => {
    const result = buildRobots({
      index: true,
      googlebot: { index: true, follow: true },
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

  it('returns undefined robots for object with no active directives', () => {
    const result = buildRobots({
      index: true,
      follow: true,
    });
    expect(result.robots).toBeUndefined();
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
