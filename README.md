# use-seo

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![npm version](https://img.shields.io/npm/v/@hiprax/use-seo.svg)](https://www.npmjs.com/package/@hiprax/use-seo)

A production-ready React hook for managing SEO meta tags, Open Graph, Twitter Cards, structured data (JSON-LD), and more. Fully typed with TypeScript and optimized for all React versions (16.8+).

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
- 🧪 **100% Test Coverage** - Thoroughly tested for reliability

## Installation

```bash
npm install @hiprax/use-seo
```

## Quick Start

```tsx
import { useSEO } from '@hiprax/use-seo';

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

### Article Metadata

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

    // Googlebot-specific directives
    googlebot: {
      index: true,
      follow: true,
      maxVideoPreview: 0,
    },
  },
});
```

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

### Advanced Options

```tsx
useSEO({
  // Prevent duplicate meta tags (default: true)
  preventDuplicates: true,

  // Enable development warnings (default: true in dev, false in prod)
  enableWarnings: true,

  // Validate URLs in meta/link tags (default: true)
  validateUrls: true,
});
```

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

The hook is SSR-safe and will not throw errors during server-side rendering. However, it only manipulates the DOM on the client side. For server-side meta tag rendering, consider:

### Next.js (App Router)

Use Next.js's built-in metadata API for server-rendered meta tags, and use `@hiprax/use-seo` for client-side dynamic updates:

```tsx
// app/page.tsx
export const metadata = {
  title: 'Static Title',
  description: 'Static description',
};

// For dynamic client-side updates:
('use client');
import { useSEO } from '@hiprax/use-seo';

function DynamicSection({ dynamicTitle }) {
  useSEO({
    title: dynamicTitle,
  });
  return <div>Content</div>;
}
```

### Next.js (Pages Router)

```tsx
import Head from 'next/head';
import { useSEO } from '@hiprax/use-seo';

function Page() {
  // For SSR
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
  // For client-side dynamic updates
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

## Browser Support

Supports all modern browsers and IE11+ (with appropriate polyfills).

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT © [Hiprax](https://github.com/Hiprax)

---

Made with ❤️ for the React community
