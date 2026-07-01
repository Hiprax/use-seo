/**
 * @fileoverview TypeScript type definitions for useSEO hook
 * @module use-seo/types
 */

// =============================================================================
// Open Graph Types
// =============================================================================

/**
 * Represents a single Open Graph image with optional metadata.
 *
 * @example
 * ```typescript
 * const image: OpenGraphImage = {
 *   url: 'https://example.com/og-image.jpg',
 *   width: 1200,
 *   height: 630,
 *   alt: 'Description of the image',
 *   type: 'image/jpeg',
 * };
 * ```
 *
 * @see {@link https://ogp.me/#structured Open Graph Image Properties}
 */
export interface OpenGraphImage {
  /**
   * The URL of the image. Must be an absolute URL.
   * Recommended size: 1200x630 pixels for optimal display.
   */
  url: string;

  /**
   * Width of the image in pixels.
   * Helps social platforms render the image correctly.
   */
  width?: number;

  /**
   * Height of the image in pixels.
   * Helps social platforms render the image correctly.
   */
  height?: number;

  /**
   * Alternative text description for accessibility.
   * Important for screen readers and when image fails to load.
   */
  alt?: string;

  /**
   * HTTPS URL of the image for secure connections.
   * Automatically inferred from `url` if it starts with 'https:'.
   */
  secureUrl?: string;

  /**
   * MIME type of the image (e.g., 'image/jpeg', 'image/png', 'image/webp').
   * Automatically inferred from URL extension if not provided.
   */
  type?: string;
}

/**
 * Represents a single Open Graph video with optional metadata.
 *
 * @example
 * ```typescript
 * const video: OpenGraphVideo = {
 *   url: 'https://example.com/video.mp4',
 *   width: 1280,
 *   height: 720,
 *   type: 'video/mp4',
 *   alt: 'Video description',
 * };
 * ```
 *
 * @see {@link https://ogp.me/#structured Open Graph Video Properties}
 *
 * @since 0.2.3
 */
export interface OpenGraphVideo {
  /**
   * The URL of the video. Must be an absolute URL.
   */
  url: string;

  /**
   * HTTPS URL of the video for secure connections.
   * Automatically inferred from `url` if it starts with 'https:'.
   */
  secureUrl?: string;

  /**
   * MIME type of the video (e.g., 'video/mp4', 'video/webm').
   */
  type?: string;

  /**
   * Width of the video in pixels.
   */
  width?: number;

  /**
   * Height of the video in pixels.
   */
  height?: number;

  /**
   * Alternative text description for accessibility.
   */
  alt?: string;
}

/**
 * Represents a single Open Graph audio with optional metadata.
 *
 * @example
 * ```typescript
 * const audio: OpenGraphAudio = {
 *   url: 'https://example.com/audio.mp3',
 *   type: 'audio/mpeg',
 * };
 * ```
 *
 * @see {@link https://ogp.me/#structured Open Graph Audio Properties}
 *
 * @since 0.2.3
 */
export interface OpenGraphAudio {
  /**
   * The URL of the audio. Must be an absolute URL.
   */
  url: string;

  /**
   * HTTPS URL of the audio for secure connections.
   * Automatically inferred from `url` if it starts with 'https:'.
   */
  secureUrl?: string;

  /**
   * MIME type of the audio (e.g., 'audio/mpeg', 'audio/ogg').
   */
  type?: string;
}

// =============================================================================
// Hreflang Types
// =============================================================================

/**
 * Represents an hreflang alternate link for international SEO.
 * Used to indicate alternate language/region versions of a page.
 *
 * @example
 * ```typescript
 * const hreflangs: HreflangLink[] = [
 *   { href: 'https://example.com/', hrefLang: 'x-default' },
 *   { href: 'https://example.com/en/', hrefLang: 'en' },
 *   { href: 'https://example.com/es/', hrefLang: 'es' },
 *   { href: 'https://example.com/en-gb/', hrefLang: 'en-GB' },
 * ];
 * ```
 *
 * @see {@link https://developers.google.com/search/docs/specialty/international/localized-versions Google Hreflang Guide}
 */
export interface HreflangLink {
  /**
   * The URL of the alternate language version.
   * Must be an absolute URL.
   */
  href: string;

  /**
   * The language/region code in BCP 47 format.
   * Examples: 'en', 'en-US', 'es', 'x-default' (for default/fallback version).
   */
  hrefLang: string;
}

// =============================================================================
// Robots Types
// =============================================================================

/**
 * Granular robots directive configuration object.
 * Provides fine-grained control over search engine crawling and indexing.
 *
 * @example
 * ```typescript
 * const robots: RobotsObject = {
 *   index: true,
 *   follow: true,
 *   noarchive: true,
 *   maxSnippet: 150,
 *   maxImagePreview: 'large',
 *   googlebot: {
 *     index: true,
 *     follow: true,
 *     maxVideoPreview: 0,
 *   },
 * };
 * ```
 */
export interface RobotsObject {
  /**
   * Allow search engines to index this page.
   * @default true
   */
  index?: boolean;

  /**
   * Allow search engines to follow links on this page.
   * @default true
   */
  follow?: boolean;

  /**
   * Prevent search engines from caching/archiving this page.
   * Useful for pages with time-sensitive content.
   */
  noarchive?: boolean;

  /**
   * Prevent search engines from showing a text snippet in results.
   * Note: This may reduce click-through rates.
   */
  nosnippet?: boolean;

  /**
   * Prevent search engines from indexing images on this page.
   */
  noimageindex?: boolean;

  /**
   * Maximum length of the text snippet in search results.
   * Use a number for character count.
   *
   * Per Google's robots-meta-tag spec, `max-snippet` only accepts an
   * integer — `0` means "no snippet" (there is no literal `none` value).
   * `'none'` is still accepted here for backward compatibility and
   * serializes to the spec-correct `max-snippet:0`.
   *
   * @see {@link https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag Google: Robots meta tag specification}
   */
  maxSnippet?: number | 'none';

  /**
   * Maximum size of image preview in search results.
   * - 'none': No image preview
   * - 'standard': Default size
   * - 'large': Larger preview (recommended for rich results)
   *
   * Unlike `maxSnippet`/`maxVideoPreview`, `max-image-preview` genuinely
   * accepts the literal `none` value per Google's spec.
   */
  maxImagePreview?: 'none' | 'standard' | 'large';

  /**
   * Maximum seconds of video preview.
   * Use a number for seconds.
   *
   * Per Google's robots-meta-tag spec, `max-video-preview` only accepts an
   * integer — `0` means "static image only, no video preview" (there is no
   * literal `none` value). `'none'` is still accepted here for backward
   * compatibility and serializes to the spec-correct `max-video-preview:0`.
   *
   * @see {@link https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag Google: Robots meta tag specification}
   */
  maxVideoPreview?: number | 'none';

  /**
   * Time after which the page should no longer be indexed.
   * Must be a date in either RFC 850 (`Friday, 31-Dec-25 23:59:59 GMT`) or
   * ISO 8601 (`2025-12-31T23:59:59Z`) format. After this time, the page is
   * dropped from search results without re-crawling.
   *
   * Serializes as `unavailable_after: <value>` in the robots meta tag.
   *
   * @example
   * ```typescript
   * useSEO({
   *   robots: { unavailableAfter: '2025-12-31T23:59:59Z' },
   * });
   * // Emits: <meta name="robots" content="unavailable_after: 2025-12-31T23:59:59Z">
   * ```
   *
   * @see {@link https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag Google: unavailable_after}
   *
   * @since 0.2.3
   */
  unavailableAfter?: string;

  /**
   * Specific directives for Googlebot crawler.
   * Can be a string (e.g., 'noindex,nofollow') or an object.
   */
  googlebot?: string | Omit<RobotsObject, 'googlebot'>;
}

/**
 * Robots meta tag configuration.
 * Can be a simple string directive or a detailed configuration object.
 *
 * @example
 * ```typescript
 * // String format
 * const robots1: RobotsOptions = 'noindex,nofollow';
 *
 * // Object format for granular control
 * const robots2: RobotsOptions = {
 *   index: true,
 *   follow: true,
 *   maxSnippet: 200,
 * };
 * ```
 */
export type RobotsOptions = string | RobotsObject;

// =============================================================================
// Additional Tags Types
// =============================================================================

/**
 * Custom meta tag configuration.
 * Supports name, property, and http-equiv meta tags.
 *
 * @example
 * ```typescript
 * const metaTags: AdditionalMetaTag[] = [
 *   { name: 'theme-color', content: '#000000' },
 *   { property: 'fb:app_id', content: '123456789' },
 *   { httpEquiv: 'content-language', content: 'en' },
 * ];
 * ```
 */
export interface AdditionalMetaTag {
  /**
   * The name attribute of the meta tag.
   * Use for standard meta tags (e.g., 'theme-color', 'format-detection').
   */
  name?: string;

  /**
   * The property attribute of the meta tag.
   * Use for Open Graph and similar meta tags.
   */
  property?: string;

  /**
   * The content attribute of the meta tag (required).
   */
  content: string;

  /**
   * The http-equiv attribute of the meta tag.
   * Use for HTTP header equivalents (e.g., 'content-language', 'refresh').
   */
  httpEquiv?: string;
}

/**
 * Custom link tag configuration.
 * Supports various link relationships like preconnect, preload, icon, etc.
 *
 * @example
 * ```typescript
 * const linkTags: AdditionalLinkTag[] = [
 *   { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
 *   { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
 *   { rel: 'preload', href: '/font.woff2', as: 'font', crossOrigin: 'anonymous' },
 * ];
 * ```
 */
export interface AdditionalLinkTag {
  /**
   * The relationship type (required).
   * Common values: 'icon', 'preconnect', 'preload', 'prefetch', 'stylesheet'.
   */
  rel: string;

  /**
   * The URL of the linked resource (required).
   */
  href: string;

  /**
   * MIME type of the linked resource.
   */
  type?: string;

  /**
   * Icon sizes (e.g., '16x16', '32x32', '180x180').
   * Used with rel="icon" or rel="apple-touch-icon".
   */
  sizes?: string;

  /**
   * Media query for conditional loading.
   */
  media?: string;

  /**
   * Language of the linked resource.
   */
  hrefLang?: string;

  /**
   * Resource type for preload (e.g., 'script', 'style', 'font', 'image').
   */
  as?: string;

  /**
   * CORS setting for the request.
   * Values: 'anonymous' or 'use-credentials'.
   */
  crossOrigin?: string;
}

// =============================================================================
// Structured Data Types
// =============================================================================

/**
 * Base interface for JSON-LD structured data.
 * All structured data should include @context and @type.
 *
 * @example
 * ```typescript
 * const articleSchema: StructuredData = {
 *   '@context': 'https://schema.org',
 *   '@type': 'Article',
 *   headline: 'Article Title',
 *   author: { '@type': 'Person', name: 'John Doe' },
 * };
 * ```
 */
export interface StructuredData {
  '@context'?: string;
  '@type'?: string;
  [key: string]: unknown;
}

// =============================================================================
// Main SEO Props Interface
// =============================================================================

/**
 * Configuration options for the useSEO hook.
 * All properties are optional - only include what you need.
 *
 * @example
 * ```typescript
 * // Minimal usage
 * useSEO({
 *   title: 'Page Title',
 *   description: 'Page description for search engines',
 * });
 *
 * // Full featured usage
 * useSEO({
 *   title: 'Amazing Product',
 *   titleSuffix: 'My Store',
 *   description: 'The best product you will ever find.',
 *   canonical: 'https://example.com/product',
 *   ogType: 'product',
 *   ogImages: [{ url: 'https://example.com/product.jpg', width: 1200, height: 630 }],
 *   twitterCard: 'summary_large_image',
 *   robots: { index: true, follow: true },
 * });
 * ```
 */
export interface SEOProps {
  // ===========================================================================
  // Basic SEO
  // ===========================================================================

  /**
   * The page title displayed in browser tabs and search results.
   * Can be formatted using `titleTemplate`, `titlePrefix`, or `titleSuffix`.
   *
   * @recommendation Keep titles between 30-60 characters for optimal display.
   *
   * @example
   * ```typescript
   * useSEO({ title: 'Product Name' });
   * // With suffix: useSEO({ title: 'Product Name', titleSuffix: 'Store Name' });
   * // Result: "Product Name | Store Name"
   * ```
   */
  title?: string;

  /**
   * Meta description for search engine results.
   * Should be a compelling summary of the page content.
   *
   * @recommendation Keep descriptions between 120-160 characters.
   *
   * @example
   * ```typescript
   * useSEO({
   *   description: 'Discover our amazing product that solves your problems.',
   * });
   * ```
   */
  description?: string;

  /**
   * Comma-separated keywords for the page.
   * Note: Most modern search engines ignore this, but it can still be useful.
   *
   * @recommendation Limit to 10 or fewer relevant keywords.
   *
   * @example
   * ```typescript
   * useSEO({ keywords: 'react, seo, meta tags, typescript' });
   * ```
   */
  keywords?: string;

  /**
   * The canonical URL for this page.
   * Helps prevent duplicate content issues.
   *
   * @example
   * ```typescript
   * useSEO({ canonical: 'https://example.com/page' });
   * ```
   */
  canonical?: string;

  /**
   * Automatically generate canonical URL from the current page URL.
   * Hash fragments are stripped from the URL.
   *
   * @default true
   */
  autoCanonical?: boolean;

  /**
   * ISO 639-1 language code for the page content.
   * Also sets the `lang` attribute on the `<html>` element.
   *
   * @example
   * ```typescript
   * useSEO({ language: 'en' }); // English
   * useSEO({ language: 'es' }); // Spanish
   * ```
   */
  language?: string;

  /**
   * Author of the page content.
   *
   * @example
   * ```typescript
   * useSEO({ author: 'John Doe' });
   * ```
   */
  author?: string;

  /**
   * Article publication date in ISO 8601 format.
   * Used for article:published_time Open Graph meta tag.
   *
   * Emitted whenever this prop is provided, independent of `ogType`; setting
   * `ogType: 'article'` is recommended for spec-conformant consumers/validators.
   *
   * @example
   * ```typescript
   * useSEO({ publishedTime: '2024-01-15T10:30:00Z' });
   * ```
   */
  publishedTime?: string;

  /**
   * Article last modification date in ISO 8601 format.
   * Used for article:modified_time Open Graph meta tag.
   *
   * Emitted whenever this prop is provided, independent of `ogType`; setting
   * `ogType: 'article'` is recommended for spec-conformant consumers/validators.
   *
   * @example
   * ```typescript
   * useSEO({ modifiedTime: '2024-02-01T14:20:00Z' });
   * ```
   */
  modifiedTime?: string;

  /**
   * Content expiration date in ISO 8601 format.
   * Used for article:expiration_time Open Graph meta tag.
   *
   * Emitted whenever this prop is provided, independent of `ogType`; setting
   * `ogType: 'article'` is recommended for spec-conformant consumers/validators.
   *
   * @example
   * ```typescript
   * useSEO({ expirationTime: '2025-12-31T23:59:59Z' });
   * ```
   */
  expirationTime?: string;

  // ===========================================================================
  // Title Formatting
  // ===========================================================================

  /**
   * Prefix added before the title with a separator.
   * Result: "prefix | title"
   *
   * @example
   * ```typescript
   * useSEO({ title: 'Contact', titlePrefix: 'MyBrand' });
   * // Result: "MyBrand | Contact"
   * ```
   */
  titlePrefix?: string;

  /**
   * Suffix added after the title with a separator.
   * Result: "title | suffix"
   *
   * @example
   * ```typescript
   * useSEO({ title: 'Contact', titleSuffix: 'MyBrand' });
   * // Result: "Contact | MyBrand"
   * ```
   */
  titleSuffix?: string;

  /**
   * Template for formatting the title.
   * Use `{title}` or `%s` as placeholder for the actual title.
   *
   * @example
   * ```typescript
   * useSEO({ title: 'Contact', titleTemplate: '%s - MyBrand' });
   * // Result: "Contact - MyBrand"
   *
   * useSEO({ title: 'Contact', titleTemplate: '{title} | MyBrand' });
   * // Result: "Contact | MyBrand"
   * ```
   */
  titleTemplate?: string;

  /**
   * Custom separator used between prefix/suffix and title.
   *
   * @default ' | '
   *
   * @example
   * ```typescript
   * useSEO({ title: 'Contact', titleSuffix: 'MyBrand', titleSeparator: ' - ' });
   * // Result: "Contact - MyBrand"
   * ```
   */
  titleSeparator?: string;

  // ===========================================================================
  // Open Graph
  // ===========================================================================

  /**
   * Open Graph title. Falls back to the formatted page title.
   *
   * @see {@link https://ogp.me/ Open Graph Protocol}
   */
  ogTitle?: string;

  /**
   * Open Graph description. Falls back to the meta description.
   */
  ogDescription?: string;

  /**
   * Single Open Graph image URL.
   * For multiple images or detailed image metadata, use `ogImages` instead.
   *
   * @deprecated Prefer using `ogImages` for richer image metadata.
   */
  ogImage?: string;

  /**
   * Width of the Open Graph image in pixels.
   * Used with `ogImage`.
   */
  ogImageWidth?: number;

  /**
   * Height of the Open Graph image in pixels.
   * Used with `ogImage`.
   */
  ogImageHeight?: number;

  /**
   * Alt text for the Open Graph image.
   * Used with `ogImage`.
   */
  ogImageAlt?: string;

  /**
   * Array of Open Graph images with full metadata.
   * Preferred over `ogImage` for richer control.
   *
   * @example
   * ```typescript
   * useSEO({
   *   ogImages: [
   *     { url: 'https://example.com/image1.jpg', width: 1200, height: 630, alt: 'Main image' },
   *     { url: 'https://example.com/image2.jpg', width: 1200, height: 630 },
   *   ],
   * });
   * ```
   */
  ogImages?: OpenGraphImage[];

  /**
   * Open Graph content type.
   *
   * @default 'website'
   *
   * @example
   * ```typescript
   * useSEO({ ogType: 'article' });
   * useSEO({ ogType: 'product' });
   * ```
   */
  ogType?: string;

  /**
   * Site name for Open Graph.
   *
   * @example
   * ```typescript
   * useSEO({ ogSiteName: 'My Awesome Website' });
   * ```
   */
  ogSiteName?: string;

  /**
   * Open Graph URL. Falls back to the canonical URL.
   */
  ogUrl?: string;

  /**
   * Primary locale in Open Graph format (language_TERRITORY).
   *
   * @example
   * ```typescript
   * useSEO({ ogLocale: 'en_US' });
   * ```
   */
  ogLocale?: string;

  /**
   * Alternative locales for the content.
   *
   * @example
   * ```typescript
   * useSEO({ ogLocaleAlternates: ['en_GB', 'de_DE', 'fr_FR'] });
   * ```
   */
  ogLocaleAlternates?: string[];

  /**
   * Single Open Graph video URL.
   * For multiple videos or detailed video metadata, use `ogVideos` instead.
   *
   * Emits `<meta property="og:video" content="...">` and (when the URL starts
   * with `https:`) `<meta property="og:video:secure_url" content="...">`.
   *
   * @since 0.2.3
   */
  ogVideo?: string;

  /**
   * Array of Open Graph videos with full metadata.
   * Preferred over `ogVideo` for richer control.
   *
   * @example
   * ```typescript
   * useSEO({
   *   ogVideos: [
   *     { url: 'https://example.com/video.mp4', width: 1280, height: 720, type: 'video/mp4' },
   *   ],
   * });
   * ```
   *
   * @see {@link https://ogp.me/#structured Open Graph Video Properties}
   *
   * @since 0.2.3
   */
  ogVideos?: OpenGraphVideo[];

  /**
   * Single Open Graph audio URL.
   * For multiple audio sources, use `ogAudios` instead.
   *
   * Emits `<meta property="og:audio" content="...">` and (when the URL starts
   * with `https:`) `<meta property="og:audio:secure_url" content="...">`.
   *
   * @since 0.2.3
   */
  ogAudio?: string;

  /**
   * Array of Open Graph audio sources with full metadata.
   * Preferred over `ogAudio` for richer control.
   *
   * @example
   * ```typescript
   * useSEO({
   *   ogAudios: [
   *     { url: 'https://example.com/audio.mp3', type: 'audio/mpeg' },
   *   ],
   * });
   * ```
   *
   * @see {@link https://ogp.me/#structured Open Graph Audio Properties}
   *
   * @since 0.2.3
   */
  ogAudios?: OpenGraphAudio[];

  // ===========================================================================
  // Article-specific Open Graph (independent of `ogType`; recommended with
  // `ogType: 'article'`)
  // ===========================================================================

  /**
   * Article author(s) for `article:author` Open Graph meta tag.
   * Can be a single URL/identifier or an array. Each entry emits its own
   * `<meta property="article:author" content="...">` element.
   *
   * Per the Open Graph article extension, the value should be a profile URL
   * or identifier that resolves to the author.
   *
   * Emitted whenever this prop is provided, independent of `ogType`; setting
   * `ogType: 'article'` is recommended for spec-conformant consumers/validators.
   *
   * @example
   * ```typescript
   * useSEO({
   *   ogType: 'article',
   *   articleAuthor: 'https://example.com/authors/jane',
   * });
   *
   * useSEO({
   *   ogType: 'article',
   *   articleAuthor: [
   *     'https://example.com/authors/jane',
   *     'https://example.com/authors/john',
   *   ],
   * });
   * ```
   *
   * @see {@link https://ogp.me/#type_article Open Graph Article}
   *
   * @since 0.2.3
   */
  articleAuthor?: string | string[];

  /**
   * Article section / category for `article:section` Open Graph meta tag.
   *
   * Emitted whenever this prop is provided, independent of `ogType`; setting
   * `ogType: 'article'` is recommended for spec-conformant consumers/validators.
   *
   * @example
   * ```typescript
   * useSEO({
   *   ogType: 'article',
   *   articleSection: 'Technology',
   * });
   * ```
   *
   * @since 0.2.3
   */
  articleSection?: string;

  /**
   * Tags / topics for the article. Each tag emits its own
   * `<meta property="article:tag" content="...">` element.
   *
   * Emitted whenever this prop is provided, independent of `ogType`; setting
   * `ogType: 'article'` is recommended for spec-conformant consumers/validators.
   *
   * @example
   * ```typescript
   * useSEO({
   *   ogType: 'article',
   *   articleTags: ['React', 'TypeScript', 'SEO'],
   * });
   * ```
   *
   * @since 0.2.3
   */
  articleTags?: string[];

  // ===========================================================================
  // Twitter Card
  // ===========================================================================

  /**
   * Twitter Card type.
   *
   * @default 'summary_large_image'
   *
   * @example
   * ```typescript
   * useSEO({ twitterCard: 'summary' });
   * useSEO({ twitterCard: 'summary_large_image' });
   * ```
   */
  twitterCard?: string;

  /**
   * Twitter Card title. Falls back to ogTitle or formatted title.
   */
  twitterTitle?: string;

  /**
   * Twitter Card description. Falls back to ogDescription or description.
   */
  twitterDescription?: string;

  /**
   * Twitter Card image URL. Falls back to ogImage or first ogImages entry.
   */
  twitterImage?: string;

  /**
   * Alt text for Twitter Card image.
   */
  twitterImageAlt?: string;

  /**
   * Twitter handle of the content creator (include @).
   *
   * @example
   * ```typescript
   * useSEO({ twitterCreator: '@johndoe' });
   * ```
   */
  twitterCreator?: string;

  /**
   * Twitter handle of the website/publication (include @).
   *
   * @example
   * ```typescript
   * useSEO({ twitterSite: '@mywebsite' });
   * ```
   */
  twitterSite?: string;

  /**
   * Player Card iframe URL (HTTPS-only). Used when `twitterCard === 'player'`.
   * Emits `<meta name="twitter:player" content="...">`.
   *
   * @see {@link https://developer.x.com/en/docs/x-for-websites/cards/overview/player-card Twitter Player Card}
   *
   * @since 0.2.3
   */
  twitterPlayer?: string;

  /**
   * Width of the Twitter player iframe in pixels.
   * Emits `<meta name="twitter:player:width" content="...">`.
   *
   * @since 0.2.3
   */
  twitterPlayerWidth?: number;

  /**
   * Height of the Twitter player iframe in pixels.
   * Emits `<meta name="twitter:player:height" content="...">`.
   *
   * @since 0.2.3
   */
  twitterPlayerHeight?: number;

  /**
   * URL to a raw video or audio stream (HTTPS-only). Optional companion to
   * `twitterPlayer` for direct streaming inside the timeline.
   * Emits `<meta name="twitter:player:stream" content="...">`.
   *
   * @since 0.2.3
   */
  twitterPlayerStream?: string;

  /**
   * MIME type of the player stream (e.g., `video/mp4`).
   * Emits `<meta name="twitter:player:stream:content_type" content="...">`.
   *
   * @since 0.2.3
   */
  twitterPlayerStreamContentType?: string;

  // ===========================================================================
  // Robots
  // ===========================================================================

  /**
   * Robots meta tag configuration.
   * Can be a string (e.g., 'noindex,nofollow') or a detailed configuration object.
   *
   * **Precedence:** when both the `robots` prop and the deprecated boolean
   * flags (`noindex`, `nofollow`, `noarchive`, `nosnippet`, `noimageindex`)
   * are passed at the same time, `robots` wins outright — the flags are
   * only consulted when `robots` is `undefined`.
   *
   * **Tri-state for `index` / `follow`:**
   * - `true` → emit the positive directive (`index` / `follow`) explicitly,
   *   useful for overriding a parent `<meta name="robots" content="noindex">`.
   * - `false` → emit the negative directive (`noindex` / `nofollow`).
   * - `undefined` → omit the directive (search-engine default applies).
   *
   * @example
   * ```typescript
   * // String format
   * useSEO({ robots: 'noindex,nofollow' });
   *
   * // Object format
   * useSEO({
   *   robots: {
   *     index: true,
   *     follow: true,
   *     maxSnippet: 150,
   *     maxImagePreview: 'large',
   *   },
   * });
   *
   * // Explicit positive directives override a parent meta robots tag.
   * useSEO({ robots: { index: true, follow: true } });
   * // Emits: <meta name="robots" content="index,follow">
   * ```
   */
  robots?: RobotsOptions;

  // ===========================================================================
  // Link Tags
  // ===========================================================================

  /**
   * Hreflang alternate links for international SEO.
   *
   * @example
   * ```typescript
   * useSEO({
   *   hreflangs: [
   *     { href: 'https://example.com/', hrefLang: 'x-default' },
   *     { href: 'https://example.com/en/', hrefLang: 'en' },
   *     { href: 'https://example.com/de/', hrefLang: 'de' },
   *   ],
   * });
   * ```
   */
  hreflangs?: HreflangLink[];

  /**
   * URL of the previous page in a paginated series.
   *
   * @example
   * ```typescript
   * useSEO({ prev: 'https://example.com/posts?page=1' });
   * ```
   */
  prev?: string;

  /**
   * URL of the next page in a paginated series.
   *
   * @example
   * ```typescript
   * useSEO({ next: 'https://example.com/posts?page=3' });
   * ```
   */
  next?: string;

  // ===========================================================================
  // Structured Data
  // ===========================================================================

  /**
   * JSON-LD structured data for rich search results.
   * Can be a single object or an array of objects.
   *
   * @example
   * ```typescript
   * useSEO({
   *   structuredData: {
   *     '@context': 'https://schema.org',
   *     '@type': 'Article',
   *     headline: 'Article Title',
   *     author: { '@type': 'Person', name: 'John Doe' },
   *   },
   * });
   *
   * // Multiple schemas
   * useSEO({
   *   structuredData: [
   *     { '@context': 'https://schema.org', '@type': 'Article', headline: 'Title' },
   *     { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [] },
   *   ],
   * });
   * ```
   *
   * @see {@link https://schema.org/ Schema.org}
   * @see {@link https://developers.google.com/search/docs/appearance/structured-data Google Structured Data}
   */
  structuredData?: StructuredData | StructuredData[];

  // ===========================================================================
  // Additional Tags
  // ===========================================================================

  /**
   * Additional custom meta tags not covered by other properties.
   *
   * @example
   * ```typescript
   * useSEO({
   *   additionalMetaTags: [
   *     { name: 'theme-color', content: '#000000' },
   *     { property: 'fb:app_id', content: '123456789' },
   *   ],
   * });
   * ```
   */
  additionalMetaTags?: AdditionalMetaTag[];

  /**
   * Additional custom link tags not covered by other properties.
   *
   * @example
   * ```typescript
   * useSEO({
   *   additionalLinkTags: [
   *     { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
   *     { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
   *   ],
   * });
   * ```
   */
  additionalLinkTags?: AdditionalLinkTag[];

  // ===========================================================================
  // Advanced Options
  // ===========================================================================

  /**
   * Prevent duplicate meta/link tags by updating existing ones.
   *
   * @default true
   */
  preventDuplicates?: boolean;

  /**
   * Enable development warnings for SEO best practices.
   * Automatically enabled in development mode.
   *
   * @default true in development, false in production
   */
  enableWarnings?: boolean;

  /**
   * Validate URLs in meta and link tags.
   * Invalid URLs will be skipped with a warning.
   *
   * @default true
   */
  validateUrls?: boolean;

  /**
   * Remove all hook-created `<head>` elements when the component unmounts.
   *
   * By default the hook leaves its created tags in place across component
   * unmounts (the historical behavior — meta/link tags persist across SPA
   * route changes to avoid flicker between pages). Setting this to `true`
   * runs the same logic as the returned `clearSEOTags()` method on unmount,
   * removing only elements that carry the `data-use-seo="true"` marker.
   * Pre-existing user-authored elements that the hook merely mutated are
   * never removed.
   *
   * Useful when the hook lives inside a transient component (modal,
   * widget, route the user navigates away from) and you want the head
   * to return to its pre-mount state.
   *
   * @default false
   *
   * @example
   * ```tsx
   * // A modal that should not leave its meta tags behind when closed.
   * function ShareModal() {
   *   useSEO({
   *     ogTitle: 'Share this content',
   *     ogImage: 'https://example.com/share.jpg',
   *     clearOnUnmount: true,
   *   });
   *   return <div>...</div>;
   * }
   * ```
   *
   * @remarks
   * **Caveat for `preventDuplicates: false`:** when duplicates are allowed,
   * the hook may create multiple meta tags with the same key across
   * renders. Each newly-created element is tracked individually, so
   * `clearOnUnmount` will remove every duplicate the hook authored —
   * which is usually the desired behavior, but can be surprising if you
   * expected only the most recent value to be cleaned up. Prefer the
   * default `preventDuplicates: true` whenever possible.
   *
   * @since 0.2.3
   */
  clearOnUnmount?: boolean;

  // ===========================================================================
  // Deprecated Options (for backwards compatibility)
  // ===========================================================================

  /**
   * @deprecated Use `robots: { index: false }` instead.
   * Adds 'noindex' to robots meta tag.
   */
  noindex?: boolean;

  /**
   * @deprecated Use `robots: { follow: false }` instead.
   * Adds 'nofollow' to robots meta tag.
   */
  nofollow?: boolean;

  /**
   * @deprecated Use `robots: { noarchive: true }` instead.
   * Adds 'noarchive' to robots meta tag.
   */
  noarchive?: boolean;

  /**
   * @deprecated Use `robots: { nosnippet: true }` instead.
   * Adds 'nosnippet' to robots meta tag.
   */
  nosnippet?: boolean;

  /**
   * @deprecated Use `robots: { noimageindex: true }` instead.
   * Adds 'noimageindex' to robots meta tag.
   */
  noimageindex?: boolean;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Key identifier for meta tags.
 * Exactly one of name, property, or httpEquiv must be provided.
 */
export interface MetaTagKey {
  /** The name attribute (e.g., 'description', 'keywords') */
  name?: string;
  /** The property attribute (e.g., 'og:title', 'og:image') */
  property?: string;
  /** The http-equiv attribute (e.g., 'content-type', 'refresh') */
  httpEquiv?: string;
}

/**
 * Attributes for link tags.
 */
export interface LinkTagAttrs {
  /** MIME type */
  type?: string;
  /** Icon sizes */
  sizes?: string;
  /** Media query */
  media?: string;
  /** Language code */
  hrefLang?: string;
  /** Resource type for preload */
  as?: string;
  /** CORS setting */
  crossOrigin?: string;
}

/**
 * Return type of the useSEO hook.
 * Provides methods for programmatic SEO tag management.
 */
export interface SEOHookReturn {
  /**
   * Update or create a meta tag programmatically.
   *
   * @param key - The meta tag identifier (name, property, or httpEquiv)
   * @param content - The content value for the meta tag
   *
   * @example
   * ```typescript
   * const { updateMetaTag } = useSEO({});
   *
   * // Using key object (preferred)
   * updateMetaTag({ name: 'description' }, 'New description');
   * updateMetaTag({ property: 'og:title' }, 'New OG Title');
   *
   * // Legacy string signature (deprecated)
   * updateMetaTag('description', 'New description');
   * ```
   */
  updateMetaTag: {
    (key: MetaTagKey, content: string): void;
    /** @deprecated Use object key format instead */
    (
      name: string,
      content: string,
      property?: string,
      httpEquiv?: string
    ): void;
  };

  /**
   * Update or create a link tag programmatically.
   *
   * @param rel - The relationship type
   * @param href - The URL of the linked resource
   * @param attrs - Optional additional attributes
   * @param unique - If true, ensures only one link with this rel exists
   * @param keySelector - Additional selector to identify specific links
   *
   * @example
   * ```typescript
   * const { updateLinkTag } = useSEO({});
   *
   * // Add a preconnect link
   * updateLinkTag('preconnect', 'https://fonts.googleapis.com');
   *
   * // Add a preload link with attributes
   * updateLinkTag('preload', '/font.woff2', {
   *   as: 'font',
   *   type: 'font/woff2',
   *   crossOrigin: 'anonymous',
   * });
   * ```
   */
  updateLinkTag: {
    (
      rel: string,
      href: string,
      attrs?: LinkTagAttrs,
      unique?: boolean,
      keySelector?: string
    ): void;
    /** @deprecated Use object attrs format instead */
    (
      rel: string,
      href: string,
      type?: string,
      sizes?: string,
      media?: string,
      hrefLang?: string,
      crossOrigin?: string
    ): void;
  };

  /**
   * Remove all SEO tags added by this hook instance.
   * Useful when navigating away or cleaning up.
   *
   * Also resets the hook's internal change-detection state, so the next
   * render — even one whose config is identical to what was last applied —
   * re-applies every tag from scratch instead of leaving `<head>` empty.
   *
   * @example
   * ```typescript
   * const { clearSEOTags } = useSEO({ title: 'Page' });
   *
   * // Later, to remove all added tags:
   * clearSEOTags();
   * ```
   */
  clearSEOTags: () => void;

  /**
   * Get the current SEO configuration snapshot.
   * Returns a copy of the last applied configuration.
   *
   * @returns The current SEO props configuration
   *
   * @example
   * ```typescript
   * const { getCurrentSEO } = useSEO({ title: 'Page' });
   *
   * const currentConfig = getCurrentSEO();
   * console.log(currentConfig.title); // 'Page'
   * ```
   */
  getCurrentSEO: () => SEOProps;
}
