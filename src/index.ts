/**
 * @fileoverview use-seo - A production-ready React hook for managing SEO meta tags
 * @module use-seo
 *
 * @description
 * A comprehensive, fully-typed React hook for managing SEO meta tags,
 * Open Graph, Twitter Cards, structured data (JSON-LD), and more.
 *
 * @example
 * ```tsx
 * import { useSEO } from 'use-seo';
 *
 * function MyPage() {
 *   useSEO({
 *     title: 'My Amazing Page',
 *     description: 'This is the best page ever',
 *     ogImage: 'https://example.com/og.jpg',
 *   });
 *
 *   return <div>Content</div>;
 * }
 * ```
 *
 * @packageDocumentation
 */

// Main hook export
export { useSEO, default } from './useSEO';

// Type exports
export type {
  // Main props
  SEOProps,
  SEOHookReturn,
  // Open Graph
  OpenGraphImage,
  // Hreflang
  HreflangLink,
  // Robots
  RobotsOptions,
  RobotsObject,
  // Additional tags
  AdditionalMetaTag,
  AdditionalLinkTag,
  // Structured data
  StructuredData,
  // Utility types
  MetaTagKey,
  LinkTagAttrs,
} from './types';

// Constants (useful for extending or customizing behavior)
export {
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
} from './constants';

