# use-seo

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@hiprax/use-seo.svg)](https://www.npmjs.com/package/@hiprax/use-seo)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/Hiprax/use-seo/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Hiprax/use-seo/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Hiprax/use-seo/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/Hiprax/use-seo/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/Hiprax/use-seo/branch/main/graph/badge.svg)](https://codecov.io/gh/Hiprax/use-seo)
[![Provenance](https://img.shields.io/badge/npm-provenance-7cb342?logo=npm)](https://docs.npmjs.com/generating-provenance-statements)

A production-ready React hook for managing SEO meta tags, Open Graph, Twitter Cards, structured data (JSON-LD), and more. Fully typed with TypeScript and optimized for all React versions (16.8+).

**[View on NPM](https://www.npmjs.com/package/@hiprax/use-seo)** | **[GitHub Repository](https://github.com/Hiprax/use-seo)**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module Formats (ESM / CJS)](#module-formats-esm--cjs)
- [API Reference](#api-reference)
  - [Basic SEO](#basic-seo)
  - [Title Formatting](#title-formatting)
  - [Open Graph](#open-graph)
  - [Open Graph Video](#open-graph-video)
  - [Open Graph Audio](#open-graph-audio)
  - [Article Extensions](#article-extensions)
  - [Twitter Cards](#twitter-cards)
  - [Twitter Player Card](#twitter-player-card)
  - [Article Metadata](#article-metadata)
  - [Robots Directives](#robots-directives)
  - [International SEO (Hreflang)](#international-seo-hreflang)
  - [Pagination](#pagination)
  - [Structured Data (JSON-LD)](#structured-data-json-ld)
  - [Additional Custom Tags](#additional-custom-tags)
  - [Tag Precedence (built-in vs additional)](#tag-precedence-built-in-vs-additional)
  - [Common Recipes](#common-recipes)
  - [Advanced Options](#advanced-options)
- [Lifecycle / Cleanup](#lifecycle--cleanup)
- [Performance Notes](#performance-notes)
- [Hook Return Methods](#hook-return-methods)
- [TypeScript Support](#typescript-support)
- [SSR Considerations](#ssr-considerations)
- [Constants](#constants)
- [Best Practices](#best-practices)
- [Development](#development)
- [Coverage](#coverage)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎯 **Complete SEO Management** - Title, description, keywords, canonical URLs, and more
- 📱 **Open Graph Support** - Full OG tag support including multiple images and locale alternates
- 🐦 **Twitter Cards** - Summary, summary_large_image, app, and player cards
- 🤖 **Robots Control** - Flexible robots meta with Googlebot-specific directives
- 🌍 **International SEO** - Hreflang alternates for multi-language sites
- 📊 **Structured Data** - JSON-LD support for rich search results
- ⚡ **Performance Optimized** - Minimal re-renders with change detection
- 🔒 **SSR Safe** - Works with Next.js, Remix, and other SSR frameworks
- 📝 **Fully Typed** - Complete TypeScript support with IntelliSense
- 🧪 **High test coverage** - See the [Coverage](#coverage) section for the latest report

## Installation

```bash
npm install @hiprax/use-seo
```

```bash
yarn add @hiprax/use-seo
```

```bash
pnpm add @hiprax/use-seo
```

**Peer dependencies:** `react` >= 16.8.0 and `react-dom` >= 16.8.0

## Quick Start

```tsx
import { useSEO } from '@hiprax/use-seo';
// or: import useSEO from '@hiprax/use-seo';

function ProductPage() {
  useSEO({
    title: 'Amazing Product',
    titleSuffix: 'My Store',
    description:
      'The best product you will ever find. High quality and great value.',
    canonical: 'https://mystore.com/products/amazing-product',
    ogImage: 'https://mystore.com/images/product.jpg',
  });

  return <div>Product content</div>;
}
```

## Module Formats (ESM / CJS)

The package is published as a dual-format bundle (`dist/index.mjs` for ESM, `dist/index.cjs` for CJS) with TypeScript declarations for both. Both ergonomic forms below work in either format.

```ts
// ESM (modern bundlers, Vite, Webpack 5, Rollup, esbuild, Next.js, Remix, ...)
import { useSEO } from '@hiprax/use-seo';
import useSEO from '@hiprax/use-seo'; // default re-export of the same function

// CommonJS (Node scripts, classic toolchains)
const { useSEO } = require('@hiprax/use-seo');
const useSEO = require('@hiprax/use-seo'); // also works — see note below
```

> **CJS interop note:** Earlier alpha builds of `@hiprax/use-seo` exposed the hook only as a `.default` property when consumed via `require()`, so `const useSEO = require('@hiprax/use-seo')` returned an object instead of the function. Starting with `0.2.3` the CJS bundle uses a small interop footer that re-points `module.exports` to the default export and re-attaches every named export as a property on it, so all three of `const useSEO = require(...)`, `const { useSEO } = require(...)`, and `require(...).default` resolve to the same callable hook. The TypeScript declarations under `dist/index.d.ts` (CJS) and `dist/index.d.mts` (ESM) describe the same shape; the package's `exports` field maps each consumer to the right one automatically under `moduleResolution: "node16" | "nodenext" | "bundler"`.

## API Reference

### Basic SEO

```tsx
useSEO({
  // Page title (recommended: 30-60 characters)
  title: 'Page Title',

  // Meta description (recommended: 120-160 characters)
  description: 'A compelling description of your page content.',

  // Meta keywords (comma-separated, max 10 recommended)
  keywords: 'react, seo, meta tags',

  // Canonical URL
  canonical: 'https://example.com/page',

  // Auto-generate canonical from current URL (default: true)
  autoCanonical: true,

  // Page language (sets <html lang="">)
  language: 'en',

  // Content author
  author: 'John Doe',
});
```

### Title Formatting

```tsx
// With suffix (result: "Contact | My Site")
useSEO({
  title: 'Contact',
  titleSuffix: 'My Site',
});

// With prefix (result: "My Site | Contact")
useSEO({
  title: 'Contact',
  titlePrefix: 'My Site',
});

// With template using %s placeholder
useSEO({
  title: 'Contact',
  titleTemplate: '%s - My Website',
});

// With template using {title} placeholder
useSEO({
  title: 'Contact',
  titleTemplate: '{title} | Brand',
});

// With custom separator (default: ' | ')
useSEO({
  title: 'Contact',
  titleSuffix: 'My Site',
  titleSeparator: ' - ',
  // Result: "Contact - My Site"
});
```

### Open Graph

```tsx
useSEO({
  // OG type (default: 'website')
  ogType: 'article',

  // Site name
  ogSiteName: 'My Website',

  // OG title (falls back to formatted title)
  ogTitle: 'Article Title',

  // OG description (falls back to description)
  ogDescription: 'Article description for social sharing.',

  // OG URL (falls back to canonical)
  ogUrl: 'https://example.com/article',

  // Locale
  ogLocale: 'en_US',

  // Alternate locales
  ogLocaleAlternates: ['en_GB', 'de_DE', 'fr_FR'],

  // Single image (simple)
  ogImage: 'https://example.com/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'Description of the image',

  // Multiple images with full metadata (preferred)
  ogImages: [
    {
      url: 'https://example.com/image1.jpg',
      width: 1200,
      height: 630,
      alt: 'Primary image',
      type: 'image/jpeg',
      secureUrl: 'https://example.com/image1.jpg', // optional, auto-inferred for https URLs
    },
    {
      url: 'https://example.com/image2.png',
      width: 800,
      height: 600,
      alt: 'Secondary image',
    },
  ],
});
```

### Open Graph Video

Typed support for `og:video` and its sub-properties. Use `ogVideos` for full
metadata or `ogVideo` for a quick single-URL shorthand.

```tsx
useSEO({
  ogVideos: [
    {
      url: 'https://example.com/video.mp4',
      type: 'video/mp4',
      width: 1280,
      height: 720,
      alt: 'Demo video',
      // secureUrl is auto-inferred when `url` starts with https:
      secureUrl: 'https://example.com/video.mp4',
    },
  ],
});

// Single-video shorthand (mirrors the legacy `ogImage` form)
useSEO({
  ogVideo: 'https://example.com/video.mp4',
});
```

Emits `<meta property="og:video">`, `og:video:secure_url`, `og:video:type`,
`og:video:width`, `og:video:height`, and `og:video:alt`. Stale tags are
cleaned up on re-render when the prop is removed (parity with `ogImages`).

### Open Graph Audio

Typed support for `og:audio` and its sub-properties.

```tsx
useSEO({
  ogAudios: [
    {
      url: 'https://example.com/audio.mp3',
      type: 'audio/mpeg',
    },
  ],
});

// Single-audio shorthand
useSEO({
  ogAudio: 'https://example.com/audio.mp3',
});
```

Emits `<meta property="og:audio">`, `og:audio:secure_url`, and
`og:audio:type`. URLs are validated against `validateUrls`.

### Article Extensions

The OG Article extension's typed properties for the article's authorship
and topical metadata — `articleAuthor`, `articleSection`, `articleTags`,
`publishedTime`, `modifiedTime`, and `expirationTime` — are emitted
whenever the corresponding prop is provided, **independent of `ogType`**;
setting `ogType: 'article'` is recommended so spec-conformant consumers
(validators, crawlers, social platforms) correctly interpret these as OG
Article extension data:

```tsx
useSEO({
  ogType: 'article',

  // Single author (URL or identifier)
  articleAuthor: 'https://example.com/authors/jane',

  // Or multiple authors — each emits its own meta tag
  // articleAuthor: [
  //   'https://example.com/authors/jane',
  //   'https://example.com/authors/john',
  // ],

  // Section / category
  articleSection: 'Technology',

  // Topic tags — each emits its own meta tag
  articleTags: ['React', 'TypeScript', 'SEO'],

  // Existing typed dates
  publishedTime: '2024-01-15T10:30:00Z',
  modifiedTime: '2024-02-01T14:20:00Z',
  expirationTime: '2025-12-31T23:59:59Z',
});
```

`articleAuthor` accepts either a single string or `string[]`. URL-shaped
values (`https?://…`) are validated against `validateUrls`; plain text
identifiers (e.g., `"Jane Doe"`) pass through unchanged. Multi-value tags
follow the same cleanup-on-removal pattern as `ogImages` and
`ogLocaleAlternates`.

### Twitter Cards

```tsx
useSEO({
  // Card type (default: 'summary_large_image')
  twitterCard: 'summary_large_image',

  // Twitter title (falls back to ogTitle or title)
  twitterTitle: 'Tweet-optimized Title',

  // Twitter description (falls back to ogDescription or description)
  twitterDescription: 'Description for Twitter.',

  // Twitter image (falls back to ogImage or first ogImages entry)
  twitterImage: 'https://example.com/twitter-image.jpg',
  twitterImageAlt: 'Image description',

  // Twitter handles (include @)
  twitterCreator: '@author_handle',
  twitterSite: '@site_handle',
});
```

### Twitter Player Card

Typed support for the Twitter / X **Player Card**, which lets you embed an
in-timeline media player. Use these fields together with
`twitterCard: 'player'`.

```tsx
useSEO({
  twitterCard: 'player',

  // HTTPS URL of the player iframe
  twitterPlayer: 'https://example.com/player',
  twitterPlayerWidth: 640,
  twitterPlayerHeight: 360,

  // Optional raw stream for direct timeline playback
  twitterPlayerStream: 'https://example.com/stream.mp4',
  twitterPlayerStreamContentType: 'video/mp4',
});
```

Emits `<meta name="twitter:player">`, `twitter:player:width`,
`twitter:player:height`, `twitter:player:stream`, and
`twitter:player:stream:content_type`. URL fields are validated against
`validateUrls`.

### Article Metadata

The article date fields below (also covered under
[Article Extensions](#article-extensions)) are emitted whenever provided,
**independent of `ogType`**; setting `ogType: 'article'` is recommended
for spec-conformant consumers:

```tsx
useSEO({
  ogType: 'article',

  // Publication date (ISO 8601)
  publishedTime: '2024-01-15T10:30:00Z',

  // Last modification date (ISO 8601)
  modifiedTime: '2024-02-01T14:20:00Z',

  // Expiration date (ISO 8601)
  expirationTime: '2025-12-31T23:59:59Z',
});
```

### Robots Directives

```tsx
// Simple string format
useSEO({
  robots: 'noindex,nofollow',
});

// Detailed object format
useSEO({
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    maxSnippet: 150,
    maxImagePreview: 'large',
    maxVideoPreview: 30,

    // Time-limited de-indexing — RFC 850 or ISO 8601 datetime
    unavailableAfter: '2025-12-31T23:59:59Z',

    // Googlebot-specific directives
    googlebot: {
      index: true,
      follow: true,
      maxVideoPreview: 0,
    },
  },
});
```

> **Note:** The deprecated boolean props `noindex`, `nofollow`, `noarchive`, `nosnippet`, and `noimageindex` are still supported for backwards compatibility, but using the `robots` object format above is preferred.

> **Precedence:** When both the `robots` prop and the deprecated boolean flags are passed at the same time, **`robots` wins** — the deprecated flags are only consulted when `robots` is `undefined`. To explicitly emit the positive directives `index` and `follow` (for example, to override a parent `<meta name="robots" content="noindex">` injected by Tag Manager or by a layout component), pass `robots: { index: true, follow: true }`; the hook will emit the literal string `index,follow` rather than producing an empty robots tag.
>
> Tri-state semantics for `index` / `follow`:
>
> - `true` → emit the positive directive (`index` / `follow`)
> - `false` → emit the negative directive (`noindex` / `nofollow`)
> - `undefined` → omit the directive entirely (the search-engine default applies)

### International SEO (Hreflang)

```tsx
useSEO({
  hreflangs: [
    { href: 'https://example.com/', hrefLang: 'x-default' },
    { href: 'https://example.com/en/', hrefLang: 'en' },
    { href: 'https://example.com/en-gb/', hrefLang: 'en-GB' },
    { href: 'https://example.com/de/', hrefLang: 'de' },
    { href: 'https://example.com/es/', hrefLang: 'es' },
  ],
});
```

### Pagination

```tsx
useSEO({
  prev: 'https://example.com/posts?page=1',
  next: 'https://example.com/posts?page=3',
});
```

### Structured Data (JSON-LD)

```tsx
// Single schema
useSEO({
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Article Title',
    author: {
      '@type': 'Person',
      name: 'John Doe',
    },
    datePublished: '2024-01-15',
    dateModified: '2024-02-01',
    image: ['https://example.com/image.jpg'],
  },
});

// Multiple schemas
useSEO({
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Article Title',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://example.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://example.com/blog',
        },
      ],
    },
  ],
});
```

### Additional Custom Tags

```tsx
useSEO({
  // Custom meta tags
  additionalMetaTags: [
    { name: 'theme-color', content: '#000000' },
    { name: 'format-detection', content: 'telephone=no' },
    { property: 'fb:app_id', content: '123456789' },
    { httpEquiv: 'content-language', content: 'en' },
  ],

  // Custom link tags
  additionalLinkTags: [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preload',
      href: '/fonts/main.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ],
});
```

### Tag Precedence (built-in vs additional)

When the same `<head>` element is targeted by BOTH a typed built-in prop
(e.g. `description`, `ogTitle`, `twitterImage`, `canonical`) AND by an
`additionalMetaTags` / `additionalLinkTags` entry whose `name`,
`property`, or `httpEquiv` matches the built-in, **the
`additionalMetaTags` / `additionalLinkTags` entry wins**. The same rule
applies between two `additionalMetaTags` entries that share an
identifier — the LAST one in array order is the value that ends up on
the element.

This is a deliberate consequence of two implementation details:

1. The hook applies built-in props FIRST, then walks
   `additionalMetaTags` and `additionalLinkTags` in order.
2. With the default `preventDuplicates: true`, the helper that creates
   a meta/link tag will REUSE any existing element with a matching key
   (whether the hook created it on the same render, the hook created it
   on a previous render, or the user authored it directly in the HTML)
   and overwrite its `content` / `href`. So the additional-tag pass
   mutates the very same element the built-in pass just emitted.

Practical consequences:

- You can override a built-in field on a per-page basis without losing
  the typed convenience for the other fields:
  ```tsx
  useSEO({
    description: 'Default description',
    additionalMetaTags: [
      // Wins over `description` above on this page.
      { name: 'description', content: 'Promotional description' },
    ],
  });
  ```
- You can use the additional-tag arrays to inject variants the typed
  props don't directly model (e.g. a `media`-scoped `theme-color`)
  without competing with the built-in pass.
- If you author a `<meta name="description">` directly in your HTML
  shell AND pass `description` to the hook, the hook will mutate your
  static element on the first render — `clearSEOTags()` will NOT
  remove it later because the hook only removes elements that carry
  the `data-use-seo="true"` marker (set ONLY on the hook's create
  path).

If you instead want the typed prop to win, omit the matching entry from
`additionalMetaTags` (or pass `preventDuplicates: false`, which causes
the additional-tag pass to APPEND a duplicate element rather than
mutating the built-in element — both will be present in the DOM, which
is rarely what you want).

### Common Recipes

The hook covers the most-used SEO surface area with first-class typed
props. For everything else (PWA chrome, AI-crawler directives, social
proof for Facebook / LinkedIn, App-Store deep links, etc.), use the
`additionalMetaTags` and `additionalLinkTags` arrays. URL-shaped
properties are validated automatically when `validateUrls: true`.

#### PWA chrome (theme color, viewport, status bar)

```tsx
useSEO({
  additionalMetaTags: [
    { name: 'theme-color', content: '#000000' },
    {
      name: 'theme-color',
      content: '#ffffff',
      // Use additionalMetaTags multiple times for media-query variants if
      // you need light/dark theme-color overrides; the hook will emit each.
    },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'application-name', content: 'My App' },
    { name: 'format-detection', content: 'telephone=no' },
    // Apple-specific (iOS Safari home-screen install)
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
    { name: 'apple-mobile-web-app-title', content: 'My App' },
  ],
  additionalLinkTags: [
    { rel: 'manifest', href: '/manifest.webmanifest' },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    { rel: 'mask-icon', href: '/safari-pinned-tab.svg' },
  ],
});
```

#### AI / LLM crawler directives

```tsx
useSEO({
  additionalMetaTags: [
    // Block major AI crawlers from training on this page
    { name: 'robots', content: 'noai, noimageai' },
    // OpenAI / GPTBot
    { name: 'GPTBot', content: 'noindex,nofollow' },
    // Google-Extended (Bard / Gemini training opt-out)
    { name: 'Google-Extended', content: 'noindex' },
    // Anthropic (ClaudeBot)
    { name: 'ClaudeBot', content: 'noindex' },
    // Common Crawl (used by many model trainers)
    { name: 'CCBot', content: 'noindex' },
  ],
});
```

> Note: when you also want a typed `robots` directive on the same page,
> prefer setting it via `robots: { … }` and use `additionalMetaTags` only
> for the AI-specific named bots above.

#### Referrer / format-detection / no-translate

```tsx
useSEO({
  additionalMetaTags: [
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
    { name: 'format-detection', content: 'telephone=no, email=no' },
    { name: 'google', content: 'notranslate' },
    { name: 'google-site-verification', content: 'YOUR-VERIFICATION-TOKEN' },
  ],
});
```

#### Facebook App ID / LinkedIn

```tsx
useSEO({
  additionalMetaTags: [
    { property: 'fb:app_id', content: '123456789' },
    { property: 'fb:pages', content: '987654321' },
    // LinkedIn picks up `og:title` / `og:description` / `og:image`
    // automatically — there's no LinkedIn-specific tag family.
  ],
});
```

#### Twitter App Card (deep links to native apps)

For the App Card, use `additionalMetaTags` with the dotted name family.

```tsx
useSEO({
  twitterCard: 'app',
  additionalMetaTags: [
    { name: 'twitter:app:name:iphone', content: 'My App' },
    { name: 'twitter:app:id:iphone', content: '1234567890' },
    { name: 'twitter:app:url:iphone', content: 'myapp://path/to/page' },

    { name: 'twitter:app:name:ipad', content: 'My App' },
    { name: 'twitter:app:id:ipad', content: '1234567890' },
    { name: 'twitter:app:url:ipad', content: 'myapp://path/to/page' },

    { name: 'twitter:app:name:googleplay', content: 'My App' },
    {
      name: 'twitter:app:id:googleplay',
      content: 'com.example.myapp',
    },
    { name: 'twitter:app:url:googleplay', content: 'myapp://path/to/page' },
  ],
});
```

#### Profile / Book / Music OG types

OG profile/book/music metadata uses simple `property` namespacing —
delegate to `additionalMetaTags`:

```tsx
useSEO({
  ogType: 'profile',
  additionalMetaTags: [
    { property: 'profile:first_name', content: 'Jane' },
    { property: 'profile:last_name', content: 'Doe' },
    { property: 'profile:username', content: 'janedoe' },
    { property: 'profile:gender', content: 'female' },
  ],
});

useSEO({
  ogType: 'book',
  additionalMetaTags: [
    { property: 'book:author', content: 'https://example.com/authors/jane' },
    { property: 'book:isbn', content: '978-3-16-148410-0' },
    { property: 'book:release_date', content: '2024-03-15' },
    { property: 'book:tag', content: 'fiction' },
  ],
});
```

### Advanced Options

```tsx
useSEO({
  // Prevent duplicate meta tags (default: true)
  preventDuplicates: true,

  // Enable development warnings (default: true in dev, false in prod)
  enableWarnings: true,

  // Validate URLs in meta/link tags (default: true)
  validateUrls: true,

  // Remove all hook-created head elements when this component unmounts
  // (default: false — see "Lifecycle / Cleanup" below)
  clearOnUnmount: false,
});
```

> **Caveat for `preventDuplicates: false`:** when this option is `false`, the
> hook will not deduplicate meta tags — repeated `updateMetaTag` calls (or
> updates to multi-value props that pass through `getOrCreateMeta`) can leave
> several `<meta>` elements with the same `name`/`property` in the document.
> Subsequent mutations through the same key will only see the first match,
> so values can appear "stuck" or "stale" because the hook is updating one
> element while another duplicate carries the previous value. Stick to the
> default (`true`) unless you have a concrete reason to allow duplicates,
> and pair this option with `clearOnUnmount: true` (or an explicit
> `clearSEOTags()` call) so duplicate elements do not accumulate over the
> component's lifetime.

### Automatic Behavior

The hook automatically handles several things behind the scenes:

- **Essential meta tags**: Ensures `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">` exist in the document head, creating them if missing.
- **Change detection**: Uses JSON serialization to skip DOM updates when the configuration has not changed between renders.
- **Element tracking**: All elements created by the hook are marked with a `data-use-seo` attribute for identification and cleanup.
- **Image MIME type inference**: Automatically infers `og:image:type` from the image URL file extension (supports jpg, png, gif, webp, svg, ico, avif, tiff, heic, heif, bmp, apng, jxl).
- **Secure URL inference**: Automatically sets `og:image:secure_url` when the image URL starts with `https:`.
- **Language normalization**: Validates and normalizes BCP 47 language tags using `Intl.getCanonicalLocales` when available.

## Lifecycle / Cleanup

The hook creates `<head>` elements during its main effect and, by default,
**leaves them in place across component unmounts**. This is intentional: in
single-page apps the meta tags should persist across route transitions to
avoid flicker between pages, and the next instance of the hook will mutate
them in place.

When that default does not match what you want, the hook offers two opt-ins:

### Option 1 — `clearOnUnmount: true` (declarative)

Pass `clearOnUnmount: true` and the hook will clean up its own elements
when the component unmounts. Pre-existing user-authored elements that the
hook merely mutated are **not** removed — only elements that carry the
`data-use-seo="true"` marker (i.e., elements the hook actually created)
are taken down.

```tsx
function ShareModal() {
  useSEO({
    ogTitle: 'Share this content',
    ogImage: 'https://example.com/share.jpg',
    twitterCard: 'summary_large_image',
    clearOnUnmount: true, // remove on unmount
  });
  return <div>...</div>;
}
```

The latest value of `clearOnUnmount` wins: toggling it from `false` to
`true` in a re-render before unmount will trigger cleanup; toggling it
back to `false` will skip cleanup.

### Option 2 — `clearSEOTags()` (imperative)

The returned `clearSEOTags()` method does the same job at any moment of
your choosing. Useful from a `useEffect` cleanup, an event handler, or
inside an error boundary.

```tsx
function MyComponent() {
  const { clearSEOTags } = useSEO({ title: 'Live View' });

  useEffect(() => {
    return () => clearSEOTags(); // explicit per-effect cleanup
  }, [clearSEOTags]);

  return <div>...</div>;
}
```

### What is preserved

Both code paths only remove elements that carry the `data-use-seo="true"`
marker. If your application authored a `<meta name="description">` or
`<link rel="canonical">` in the document `<head>` before the hook mounted
(e.g., via Next.js metadata, a static HTML template, or a separate React
tree), that element will be **preserved**. The hook may have mutated its
attributes during its lifetime, but it will never delete it.

## Performance Notes

### How change detection works

On every render the hook builds an internal config snapshot, serializes it
with `JSON.stringify`, and compares the result to the previous render's
serialization. When the strings match, the entire DOM-mutating block is
skipped.

### `JSON.stringify` is order-sensitive

`JSON.stringify` walks an object's keys in **insertion order**. Two
objects with the same data but a different key order produce different
strings:

```js
JSON.stringify({ a: 1, b: 2 }); // '{"a":1,"b":2}'
JSON.stringify({ b: 2, a: 1 }); // '{"b":2,"a":1}'
```

Inside the hook this means: passing a fresh props literal each render with
the same data but **different key order** will be detected as "changed"
and re-run the effect — a wasted no-op rather than a correctness bug, but
worth avoiding on hot render paths.

The same applies to nested objects (`ogImages: [{ url, alt, width }]` vs.
`ogImages: [{ alt, url, width }]`) and to arrays whose ELEMENT order
changes even when the SET of values is unchanged.

### Recommendations

1. **Stabilize the props object** with `useMemo` so the same reference is
   reused across renders that don't actually change SEO data:

   ```tsx
   const seoProps = useMemo(
     () => ({
       title: page.title,
       description: page.description,
       canonical: page.canonical,
       ogImages: page.images, // stable reference per `page` change
     }),
     [page]
   );
   useSEO(seoProps);
   ```

2. **Keep the key order stable** when you do build the props object inline.
   Don't conditionally insert a key in different positions across renders.

3. **Prefer top-level primitives** over nested objects when both work,
   since primitive equality short-circuits faster than full object
   serialization.

4. The `enableWarnings`, `validateUrls`, and `preventDuplicates` options
   are read on every render, so swapping them between renders is fine —
   their cost is constant.

## Hook Return Methods

The hook returns an object with methods for programmatic tag management:

```tsx
const { updateMetaTag, updateLinkTag, clearSEOTags, getCurrentSEO } = useSEO({
  title: 'My Page',
});

// Update a meta tag programmatically
updateMetaTag({ name: 'description' }, 'Updated description');
updateMetaTag({ property: 'og:title' }, 'Updated OG Title');

// Update a link tag programmatically
updateLinkTag('stylesheet', 'https://example.com/style.css', {
  type: 'text/css',
});

// Remove all SEO tags added by this hook
clearSEOTags();

// Get the current SEO configuration
const currentConfig = getCurrentSEO();
console.log(currentConfig.title); // 'My Page'
```

## TypeScript Support

All types are exported for use in your TypeScript projects:

```tsx
import type {
  SEOProps,
  SEOHookReturn,
  OpenGraphImage,
  OpenGraphVideo,
  OpenGraphAudio,
  HreflangLink,
  RobotsOptions,
  RobotsObject,
  AdditionalMetaTag,
  AdditionalLinkTag,
  StructuredData,
  MetaTagKey,
  LinkTagAttrs,
} from '@hiprax/use-seo';

// Use types in your code
const seoConfig: SEOProps = {
  title: 'My Page',
  description: 'Page description',
};

const images: OpenGraphImage[] = [
  { url: 'https://example.com/image.jpg', width: 1200, height: 630 },
];
```

## SSR Considerations

The hook is SSR-safe — it never throws on the server, but it only mutates
the DOM on the client. The general pattern is the same in every framework:
let the framework render its initial meta tags on the server, and use
`@hiprax/use-seo` from a client component for any dynamic updates after
hydration.

### Next.js (App Router)

Use Next.js's built-in metadata API for the server pass and a client
component for dynamic updates. The `'use client'` directive must be the
FIRST statement of the file — an unparenthesized string literal at the
top, no leading whitespace.

```tsx
// app/page.tsx
export const metadata = {
  title: 'Static Title',
  description: 'Static description',
};
```

```tsx
// app/components/DynamicSection.tsx
'use client';

import { useSEO } from '@hiprax/use-seo';

export function DynamicSection({ dynamicTitle }: { dynamicTitle: string }) {
  useSEO({ title: dynamicTitle });
  return <div>Content</div>;
}
```

### Next.js (Pages Router)

Render the static tags inside `<Head>` and call `useSEO` from any child
client component for the dynamic ones.

```tsx
import Head from 'next/head';
import { useSEO } from '@hiprax/use-seo';

function Page() {
  return (
    <>
      <Head>
        <title>My Page</title>
      </Head>
      <ClientSideComponent />
    </>
  );
}

function ClientSideComponent() {
  useSEO({ title: 'Dynamic Title' });
  return <div>Content</div>;
}
```

## Constants

The package exports useful constants for customization:

```tsx
import {
  DEFAULT_OG_TYPE, // 'website'
  DEFAULT_TWITTER_CARD, // 'summary_large_image'
  DEFAULT_AUTO_CANONICAL, // true
  DEFAULT_PREVENT_DUPLICATES, // true
  DEFAULT_VALIDATE_URLS, // true
  MIN_TITLE_LENGTH, // 30
  MAX_TITLE_LENGTH, // 60
  MIN_DESCRIPTION_LENGTH, // 120
  MAX_DESCRIPTION_LENGTH, // 160
  MAX_KEYWORDS_COUNT, // 10
} from '@hiprax/use-seo';
```

## Best Practices

### Title

- Keep titles between **30-60 characters**
- Put important keywords at the beginning
- Make each page title unique
- Include your brand name (use `titleSuffix`)

### Description

- Keep descriptions between **120-160 characters**
- Include a call-to-action when relevant
- Make each description unique and compelling
- Include relevant keywords naturally

### Open Graph Images

- Use **1200x630 pixels** for optimal display
- Provide `alt` text for accessibility
- Use high-quality, relevant images
- Test with Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/)

### Structured Data

- Validate with Google's [Rich Results Test](https://search.google.com/test/rich-results)
- Use appropriate schema types for your content
- Keep structured data accurate and up-to-date

### Canonical URLs

- Always set canonical URLs to prevent duplicate content
- Use absolute URLs
- Point to the preferred version of the page

## Development

This project uses [tsup](https://tsup.egoist.dev/) for bundling and outputs both ESM and CJS formats with TypeScript declarations and sourcemaps.

### Available Scripts

```bash
# Build the library (uses tsup)
npm run build

# Watch mode for development
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint source files
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format source files with Prettier
npm run format

# Check formatting without writing
npm run format:check

# TypeScript type checking (no emit)
npm run typecheck

# Remove dist and coverage directories
npm run clean
```

### Project Structure

```
src/
  index.ts          # Public API exports
  useSEO.ts         # Main hook implementation
  types.ts          # TypeScript type definitions
  constants.ts      # Default values and limits
  utils/
    index.ts        # Barrel re-export for utilities
    dom.ts          # DOM manipulation helpers
    validation.ts   # URL and language validation
    robots.ts       # Robots directive builder
    title.ts        # Title formatting logic
    warnings.ts     # Development warning utilities
```

## Coverage

The package is exercised by a comprehensive Jest suite under `tests/`
covering the public hook, every utility module, the package's `exports`
manifest, SSR (`node` Jest environment) safety, and dozens of regression
cases. As of v0.3.2 the suite ships **512 tests** and reports
**98.65% statements, 95.36% branches, 100% functions, and 100% lines**;
the exact numbers may vary slightly per release. To reproduce the report
locally:

```bash
npm run test:coverage
```

## Browser Support

The hook targets **modern browsers** — anything that ships
`Intl.getCanonicalLocales`, `URL`, `Set`, `Map`, and the standard ES2018
language features the bundle is compiled to. Concretely, that means
recent Chrome, Edge, Firefox, Safari (desktop and iOS), Samsung Internet,
and Node 20.19+ for SSR (matching the package's `engines.node`). The build
is published as both ESM and CommonJS so
modern bundlers (Vite, Webpack 5, Rollup, esbuild, Next.js, Remix) can
pick whichever suits their target.

> **Note on `getCurrentSEO()`:** the snapshot returned by `getCurrentSEO()`
> is a deep clone produced via `JSON.parse(JSON.stringify(...))`, so any
> keys whose value is `undefined` are dropped from the result and the
> schema must be JSON-clean (no `Date`, `Map`, `Set`, `BigInt`, functions,
> or circular references). `SEOProps` is intentionally JSON-clean — it
> exposes only primitives, strings, plain arrays, and plain objects — so
> the result shape is uniform across every supported runtime.

> **Internet Explorer is not a supported target.** IE11 lacks
> `Intl.getCanonicalLocales`, has incomplete `URL`/`Set`/`Map` support,
> and never received many of the language features the bundle relies on.
> If you must support IE11, you would need polyfills for at least
> `Intl.getCanonicalLocales`, `URL`, `Set`, `Map`, and a downlevel
> compile pass — and even then several behaviors (e.g., the BCP 47
> language-tag normalization) would degrade silently to the regex
> fallback. We do not test against IE11 and consider it out of scope.

## Contributing

Contributions are welcome! Please submit pull requests to the [GitHub repository](https://github.com/Hiprax/use-seo). See the [Development](#development) section above for setup instructions.

To report bugs or request features, please use [GitHub Issues](https://github.com/Hiprax/use-seo/issues).

## License

MIT © [Hiprax](https://github.com/Hiprax)

---

Made with ❤️ for the React community
