/**
 * Tests for main package exports
 */

import {
  useSEO,
  default as defaultExport,
  DEFAULT_OG_TYPE,
  DEFAULT_TWITTER_CARD,
  DEFAULT_AUTO_CANONICAL,
  DEFAULT_PREVENT_DUPLICATES,
  DEFAULT_VALIDATE_URLS,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_KEYWORDS_COUNT,
} from '../src/index';

import type {
  SEOProps,
  SEOHookReturn,
  OpenGraphImage,
  HreflangLink,
  RobotsOptions,
  AdditionalMetaTag,
  AdditionalLinkTag,
  StructuredData,
  MetaTagKey,
  LinkTagAttrs,
} from '../src/index';

describe('Package Exports', () => {
  it('exports useSEO function', () => {
    expect(typeof useSEO).toBe('function');
  });

  it('exports useSEO as default', () => {
    expect(defaultExport).toBe(useSEO);
  });

  it('exports all constants', () => {
    expect(DEFAULT_OG_TYPE).toBeDefined();
    expect(DEFAULT_TWITTER_CARD).toBeDefined();
    expect(DEFAULT_AUTO_CANONICAL).toBeDefined();
    expect(DEFAULT_PREVENT_DUPLICATES).toBeDefined();
    expect(DEFAULT_VALIDATE_URLS).toBeDefined();
    expect(MIN_TITLE_LENGTH).toBeDefined();
    expect(MAX_TITLE_LENGTH).toBeDefined();
    expect(MIN_DESCRIPTION_LENGTH).toBeDefined();
    expect(MAX_DESCRIPTION_LENGTH).toBeDefined();
    expect(MAX_KEYWORDS_COUNT).toBeDefined();
  });
});

describe('Type Exports', () => {
  // These tests just verify the types are properly exported and usable
  it('SEOProps type is usable', () => {
    const props: SEOProps = {
      title: 'Test',
      description: 'Test description',
    };
    expect(props.title).toBe('Test');
  });

  it('OpenGraphImage type is usable', () => {
    const image: OpenGraphImage = {
      url: 'https://example.com/image.jpg',
      width: 1200,
      height: 630,
    };
    expect(image.url).toBe('https://example.com/image.jpg');
  });

  it('HreflangLink type is usable', () => {
    const link: HreflangLink = {
      href: 'https://example.com/',
      hrefLang: 'en',
    };
    expect(link.hrefLang).toBe('en');
  });

  it('RobotsOptions type accepts string', () => {
    const robots: RobotsOptions = 'noindex,nofollow';
    expect(robots).toBe('noindex,nofollow');
  });

  it('RobotsOptions type accepts object', () => {
    const robots: RobotsOptions = {
      index: false,
      follow: true,
    };
    expect(robots.index).toBe(false);
  });

  it('AdditionalMetaTag type is usable', () => {
    const tag: AdditionalMetaTag = {
      name: 'theme-color',
      content: '#000000',
    };
    expect(tag.name).toBe('theme-color');
  });

  it('AdditionalLinkTag type is usable', () => {
    const tag: AdditionalLinkTag = {
      rel: 'icon',
      href: '/favicon.ico',
    };
    expect(tag.rel).toBe('icon');
  });

  it('StructuredData type is usable', () => {
    const data: StructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test',
    };
    expect(data['@type']).toBe('Article');
  });

  it('MetaTagKey type is usable', () => {
    const key: MetaTagKey = { name: 'description' };
    expect(key.name).toBe('description');
  });

  it('LinkTagAttrs type is usable', () => {
    const attrs: LinkTagAttrs = {
      type: 'text/css',
      crossOrigin: 'anonymous',
    };
    expect(attrs.type).toBe('text/css');
  });

  it('SEOHookReturn type shape is correct', () => {
    // This verifies the return type structure
    const mockReturn: SEOHookReturn = {
      updateMetaTag: jest.fn() as SEOHookReturn['updateMetaTag'],
      updateLinkTag: jest.fn() as SEOHookReturn['updateLinkTag'],
      clearSEOTags: jest.fn(),
      getCurrentSEO: jest.fn(() => ({})),
    };
    expect(typeof mockReturn.updateMetaTag).toBe('function');
    expect(typeof mockReturn.updateLinkTag).toBe('function');
    expect(typeof mockReturn.clearSEOTags).toBe('function');
    expect(typeof mockReturn.getCurrentSEO).toBe('function');
  });
});
