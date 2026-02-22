/**
 * @fileoverview useSEO - A production-ready React hook for managing SEO and social meta tags
 * @module use-seo
 *
 * @description
 * A comprehensive React hook for managing SEO meta tags, Open Graph, Twitter Cards,
 * structured data (JSON-LD), and more. Designed for both client-side and SSR-safe usage.
 *
 * @features
 * - Title formatting with template/prefix/suffix
 * - Meta tags: description, keywords, author, article dates
 * - Robots directives (string or granular object) + Googlebot support
 * - Canonical URL (auto-canonical option with URL normalization)
 * - Open Graph (full support including multiple images & alternates)
 * - Twitter Card (full support)
 * - Hreflang alternates for international SEO
 * - Pagination links (prev/next)
 * - Structured data (JSON-LD) with safe replacement
 * - Additional custom meta/link tags
 * - URL validation (configurable)
 * - Duplicate prevention & scoped cleanup
 * - SSR-safe (no-ops during server rendering)
 * - Development warnings for best practices
 *
 * @example
 * ```tsx
 * import { useSEO } from 'use-seo';
 *
 * function ProductPage() {
 *   useSEO({
 *     title: 'Amazing Product',
 *     titleSuffix: 'My Store',
 *     description: 'The best product you will ever find.',
 *     canonical: 'https://example.com/product',
 *     ogType: 'product',
 *     ogImages: [{ url: 'https://example.com/product.jpg', width: 1200, height: 630 }],
 *   });
 *
 *   return <div>Product content</div>;
 * }
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';

import type {
  SEOProps,
  SEOHookReturn,
  OpenGraphImage,
  RobotsOptions,
  MetaTagKey,
  LinkTagAttrs,
} from './types';

import {
  canUseDOM,
  createMeta,
  getOrCreateMeta,
  getOrCreateLink,
  removeMarkedElements,
  createJsonLdScript,
  ensureEssentialMeta,
} from './utils/dom';

import {
  isValidUrl,
  normalizeCanonical,
  normalizeLanguageTag,
  isUrlField,
  inferImageMimeType,
} from './utils/validation';

import { buildRobots, buildRobotsFromFlags } from './utils/robots';
import { formatTitle } from './utils/title';
import { warn, logError, shouldEnableWarnings } from './utils/warnings';

import {
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

/**
 * React hook for managing SEO meta tags and structured data.
 *
 * This hook manages `<head>` elements for SEO optimization including:
 * - Page title with formatting options
 * - Meta tags (description, keywords, author, robots)
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical and alternate URLs
 * - JSON-LD structured data
 *
 * @param props - SEO configuration options
 * @returns Object with methods for programmatic tag management
 *
 * @example
 * ```tsx
 * // Basic usage
 * useSEO({
 *   title: 'Page Title',
 *   description: 'Page description for search engines',
 * });
 *
 * // With returned methods
 * const { updateMetaTag, clearSEOTags } = useSEO({
 *   title: 'My Page',
 * });
 *
 * // Programmatically update a tag
 * updateMetaTag({ name: 'description' }, 'Updated description');
 * ```
 *
 * @see {@link SEOProps} for all available options
 * @see {@link SEOHookReturn} for returned methods
 */
export function useSEO(props: SEOProps = {}): SEOHookReturn {
  const {
    // Basic SEO
    title,
    description,
    keywords,
    canonical,
    autoCanonical = DEFAULT_AUTO_CANONICAL,
    language,
    author,
    publishedTime,
    modifiedTime,
    expirationTime,

    // Title formatting
    titlePrefix,
    titleSuffix,
    titleTemplate,
    titleSeparator,

    // Open Graph
    ogTitle,
    ogDescription,
    ogImage,
    ogImageWidth,
    ogImageHeight,
    ogImageAlt,
    ogImages,
    ogType = DEFAULT_OG_TYPE,
    ogSiteName,
    ogUrl,
    ogLocale,
    ogLocaleAlternates,

    // Twitter
    twitterCard = DEFAULT_TWITTER_CARD,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    twitterCreator,
    twitterSite,

    // Robots
    robots,
    // Deprecated booleans (still honored if robots not provided)
    noindex,
    nofollow,
    noarchive,
    nosnippet,
    noimageindex,

    // Links
    hreflangs,
    prev,
    next,

    // JSON-LD
    structuredData,

    // Extras
    additionalMetaTags = [],
    additionalLinkTags = [],

    // Options
    preventDuplicates = DEFAULT_PREVENT_DUPLICATES,
    enableWarnings = shouldEnableWarnings(),
    validateUrls = DEFAULT_VALIDATE_URLS,
  } = props;

  // Track elements added by this hook instance for cleanup
  const addedElements = useRef<Set<Element>>(new Set());
  // Track previous config JSON for change detection
  const prevConfigRef = useRef<string>('');
  // Store last applied config for getCurrentSEO
  const lastSnapshotRef = useRef<SEOProps>({});

  /**
   * Internal: Update or create a meta tag
   */
  const updateMetaInternal = useCallback(
    (key: MetaTagKey, content: string): void => {
      if (!canUseDOM()) return;
      if (!content || (typeof content === 'string' && !content.trim())) return;

      const meta = getOrCreateMeta(key, preventDuplicates);
      meta.setAttribute('content', content);
      addedElements.current.add(meta);
    },
    [preventDuplicates]
  );

  /**
   * Public: Update or create a meta tag (with overloaded signatures)
   */
  const updateMetaTag = useCallback(
    (
      keyOrName: MetaTagKey | string,
      contentOrValue: string,
      property?: string,
      httpEquiv?: string
    ): void => {
      if (!canUseDOM()) return;

      let key: MetaTagKey;
      let content: string;

      // Handle overloaded signatures
      if (typeof keyOrName === 'string') {
        // Legacy signature: (name, content, property?, httpEquiv?)
        key = property
          ? { property }
          : httpEquiv
            ? { httpEquiv }
            : { name: keyOrName };
        content = contentOrValue;
      } else {
        // Modern signature: (key, content)
        key = keyOrName;
        content = contentOrValue;
      }

      // URL validation for URL-like fields
      if (validateUrls && content) {
        const fieldName = key.property ?? key.name ?? '';
        if (isUrlField(fieldName) && !isValidUrl(content, true)) {
          warn(
            `Invalid URL provided for ${fieldName}: ${content}`,
            enableWarnings
          );
          return;
        }
      }

      updateMetaInternal(key, content);
    },
    [updateMetaInternal, validateUrls, enableWarnings]
  ) as SEOHookReturn['updateMetaTag'];

  /**
   * Internal: Update or create a link tag
   */
  const updateLinkInternal = useCallback(
    (
      rel: string,
      href: string,
      attrs: LinkTagAttrs = {},
      unique = false,
      keySelector?: string
    ): void => {
      if (!canUseDOM()) return;
      if (!href?.trim()) return;

      // URL validation
      if (validateUrls && !isValidUrl(href, true)) {
        warn(
          `Invalid URL provided for link rel="${rel}": ${href}`,
          enableWarnings
        );
        return;
      }

      const link = getOrCreateLink(rel, unique, keySelector);
      link.setAttribute('href', href);

      // Set additional attributes
      if (attrs.type) link.setAttribute('type', attrs.type);
      if (attrs.sizes) link.setAttribute('sizes', attrs.sizes);
      if (attrs.media) link.setAttribute('media', attrs.media);
      if (attrs.hrefLang) link.setAttribute('hreflang', attrs.hrefLang);
      if (attrs.as) link.setAttribute('as', attrs.as);
      if (attrs.crossOrigin)
        link.setAttribute('crossorigin', attrs.crossOrigin);

      addedElements.current.add(link);
    },
    [validateUrls, enableWarnings]
  );

  /**
   * Public: Update or create a link tag (with overloaded signatures)
   */
  const updateLinkTag = useCallback(
    (
      rel: string,
      href: string,
      attrsOrType?: LinkTagAttrs | string,
      uniqueOrSizes?: boolean | string,
      keySelectorOrMedia?: string,
      hrefLangArg?: string,
      crossOriginArg?: string
    ): void => {
      if (!canUseDOM()) return;

      // Detect which signature is being used
      if (attrsOrType && typeof attrsOrType === 'object') {
        // Modern signature: (rel, href, attrs?, unique?, keySelector?)
        updateLinkInternal(
          rel,
          href,
          attrsOrType,
          typeof uniqueOrSizes === 'boolean' ? uniqueOrSizes : false,
          typeof keySelectorOrMedia === 'string'
            ? keySelectorOrMedia
            : undefined
        );
      } else {
        // Legacy signature: (rel, href, type?, sizes?, media?, hrefLang?, crossOrigin?)
        const attrs: LinkTagAttrs = {
          type: typeof attrsOrType === 'string' ? attrsOrType : undefined,
          sizes: typeof uniqueOrSizes === 'string' ? uniqueOrSizes : undefined,
          media: keySelectorOrMedia,
          hrefLang: hrefLangArg,
          crossOrigin: crossOriginArg,
        };
        updateLinkInternal(rel, href, attrs, false);
      }
    },
    [updateLinkInternal]
  ) as SEOHookReturn['updateLinkTag'];

  /**
   * Remove all SEO tags added by this hook instance
   */
  const clearSEOTags = useCallback((): void => {
    if (!canUseDOM()) return;

    addedElements.current.forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    addedElements.current.clear();
  }, []);

  /**
   * Get the current SEO configuration snapshot
   */
  const getCurrentSEO = useCallback((): SEOProps => {
    return { ...lastSnapshotRef.current };
  }, []);

  // Main effect for applying SEO tags
  useEffect(() => {
    if (!canUseDOM()) return;

    // Compute effective values
    const effectiveCanonical = normalizeCanonical(
      canonical ?? (autoCanonical ? window.location.href : '')
    );
    const effectiveOgUrl = ogUrl ?? effectiveCanonical ?? undefined;
    const effectiveTwitterImage = twitterImage ?? ogImage ?? ogImages?.[0]?.url;
    const formattedTitle = formatTitle(title, {
      template: titleTemplate,
      prefix: titlePrefix,
      suffix: titleSuffix,
      separator: titleSeparator,
    });

    // Build config snapshot for change detection
    const configSnapshot: SEOProps = {
      title,
      description,
      keywords,
      canonical: effectiveCanonical ?? undefined,
      autoCanonical,
      language,
      author,
      publishedTime,
      modifiedTime,
      expirationTime,
      titlePrefix,
      titleSuffix,
      titleTemplate,
      titleSeparator,
      ogTitle,
      ogDescription,
      ogImage,
      ogImageWidth,
      ogImageHeight,
      ogImageAlt,
      ogImages,
      ogType,
      ogSiteName,
      ogUrl: effectiveOgUrl,
      ogLocale,
      ogLocaleAlternates,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage: effectiveTwitterImage,
      twitterImageAlt,
      twitterCreator,
      twitterSite,
      robots,
      hreflangs,
      prev,
      next,
      structuredData,
      additionalMetaTags,
      additionalLinkTags,
      preventDuplicates,
      enableWarnings,
      validateUrls,
      noindex,
      nofollow,
      noarchive,
      nosnippet,
      noimageindex,
    };

    // Skip if config hasn't changed
    const configJSON = JSON.stringify(configSnapshot);
    if (configJSON === prevConfigRef.current) {
      return;
    }

    // Helper to validate a URL value and warn if invalid
    const isUrlValid = (url: string, fieldName: string): boolean => {
      if (!validateUrls) return true;
      if (isValidUrl(url, true)) return true;
      warn(`Invalid URL provided for ${fieldName}: ${url}`, enableWarnings);
      return false;
    };

    try {
      // === Title ===
      if (formattedTitle) {
        document.title = formattedTitle;

        // Dev warnings for title length
        if (enableWarnings) {
          if (formattedTitle.length > MAX_TITLE_LENGTH) {
            warn(
              `Title is ${formattedTitle.length} characters. Aim for ≤${MAX_TITLE_LENGTH} for optimal display.`,
              enableWarnings
            );
          } else if (formattedTitle.length < MIN_TITLE_LENGTH) {
            warn(
              `Title is ${formattedTitle.length} characters. Consider ${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} for better SEO.`,
              enableWarnings
            );
          }
        }
      }

      // === Essential meta tags (charset, viewport) ===
      ensureEssentialMeta(addedElements.current);

      // === Language ===
      const normalizedLang = normalizeLanguageTag(language);
      if (normalizedLang) {
        document.documentElement.setAttribute('lang', normalizedLang);
      }

      // === Basic meta tags ===
      if (description) {
        updateMetaInternal({ name: 'description' }, description);
        if (
          enableWarnings &&
          (description.length > MAX_DESCRIPTION_LENGTH ||
            description.length < MIN_DESCRIPTION_LENGTH)
        ) {
          warn(
            `Description is ${description.length} characters. Aim for ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH}.`,
            enableWarnings
          );
        }
      }

      if (keywords) {
        updateMetaInternal({ name: 'keywords' }, keywords);
        const keywordCount = keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean).length;
        if (enableWarnings && keywordCount > MAX_KEYWORDS_COUNT) {
          warn(
            `Too many keywords (${keywordCount}). Focus on ≤${MAX_KEYWORDS_COUNT}.`,
            enableWarnings
          );
        }
      }

      if (author) {
        updateMetaInternal({ name: 'author' }, author);
      }

      // === Article dates ===
      if (publishedTime) {
        updateMetaInternal(
          { property: 'article:published_time' },
          publishedTime
        );
      }
      if (modifiedTime) {
        updateMetaInternal({ property: 'article:modified_time' }, modifiedTime);
      }
      if (expirationTime) {
        updateMetaInternal(
          { property: 'article:expiration_time' },
          expirationTime
        );
      }

      // === Open Graph ===
      updateMetaInternal({ property: 'og:type' }, ogType);

      if (ogSiteName) {
        updateMetaInternal({ property: 'og:site_name' }, ogSiteName);
      }

      const effectiveOgTitle = ogTitle ?? formattedTitle;
      if (effectiveOgTitle) {
        updateMetaInternal({ property: 'og:title' }, effectiveOgTitle);
      }

      const effectiveOgDescription = ogDescription ?? description;
      if (effectiveOgDescription) {
        updateMetaInternal(
          { property: 'og:description' },
          effectiveOgDescription
        );
      }

      if (effectiveOgUrl && isUrlValid(effectiveOgUrl, 'og:url')) {
        updateMetaInternal({ property: 'og:url' }, effectiveOgUrl);
      }

      if (ogLocale) {
        updateMetaInternal({ property: 'og:locale' }, ogLocale);
      }

      // OG Locale Alternates
      if (ogLocaleAlternates?.length) {
        removeMarkedElements(
          'meta[property="og:locale:alternate"]',
          addedElements.current
        );
        ogLocaleAlternates.forEach((loc) => {
          // Create new meta for each alternate (don't reuse existing)
          const meta = createMeta({ property: 'og:locale:alternate' });
          meta.setAttribute('content', loc);
          addedElements.current.add(meta);
        });
      }

      // OG Images
      if (ogImages?.length) {
        // Remove previous OG image tags
        removeMarkedElements(
          'meta[property^="og:image"]',
          addedElements.current
        );

        ogImages.forEach((img: OpenGraphImage) => {
          // Skip images with invalid URLs
          if (!isUrlValid(img.url, 'og:image')) return;

          // Create new meta for each image (don't reuse existing)
          const imageMeta = createMeta({ property: 'og:image' });
          imageMeta.setAttribute('content', img.url);
          addedElements.current.add(imageMeta);

          if (img.secureUrl) {
            const secureUrlMeta = createMeta({
              property: 'og:image:secure_url',
            });
            secureUrlMeta.setAttribute('content', img.secureUrl);
            addedElements.current.add(secureUrlMeta);
          } else if (img.url.startsWith('https:')) {
            const secureUrlMeta = createMeta({
              property: 'og:image:secure_url',
            });
            secureUrlMeta.setAttribute('content', img.url);
            addedElements.current.add(secureUrlMeta);
          }

          if (img.width) {
            const widthMeta = createMeta({ property: 'og:image:width' });
            widthMeta.setAttribute('content', String(img.width));
            addedElements.current.add(widthMeta);
          }
          if (img.height) {
            const heightMeta = createMeta({ property: 'og:image:height' });
            heightMeta.setAttribute('content', String(img.height));
            addedElements.current.add(heightMeta);
          }
          if (img.alt) {
            const altMeta = createMeta({ property: 'og:image:alt' });
            altMeta.setAttribute('content', img.alt);
            addedElements.current.add(altMeta);
          }

          // Image type (provided or inferred)
          const imageType = img.type ?? inferImageMimeType(img.url);
          if (imageType) {
            const typeMeta = createMeta({ property: 'og:image:type' });
            typeMeta.setAttribute('content', imageType);
            addedElements.current.add(typeMeta);
          }
        });
      } else if (ogImage && isUrlValid(ogImage, 'og:image')) {
        // Single image (legacy)
        updateMetaInternal({ property: 'og:image' }, ogImage);

        if (ogImage.startsWith('https:')) {
          updateMetaInternal({ property: 'og:image:secure_url' }, ogImage);
        }
        if (ogImageWidth) {
          updateMetaInternal(
            { property: 'og:image:width' },
            String(ogImageWidth)
          );
        }
        if (ogImageHeight) {
          updateMetaInternal(
            { property: 'og:image:height' },
            String(ogImageHeight)
          );
        }
        if (ogImageAlt) {
          updateMetaInternal({ property: 'og:image:alt' }, ogImageAlt);
        }

        const imageType = inferImageMimeType(ogImage);
        if (imageType) {
          updateMetaInternal({ property: 'og:image:type' }, imageType);
        }
      }

      // === Twitter Card ===
      if (twitterCard) {
        updateMetaInternal({ name: 'twitter:card' }, twitterCard);
      }

      const effectiveTwitterTitle = twitterTitle ?? ogTitle ?? formattedTitle;
      if (effectiveTwitterTitle) {
        updateMetaInternal({ name: 'twitter:title' }, effectiveTwitterTitle);
      }

      const effectiveTwitterDescription =
        twitterDescription ?? ogDescription ?? description;
      if (effectiveTwitterDescription) {
        updateMetaInternal(
          { name: 'twitter:description' },
          effectiveTwitterDescription
        );
      }

      if (
        effectiveTwitterImage &&
        isUrlValid(effectiveTwitterImage, 'twitter:image')
      ) {
        updateMetaInternal({ name: 'twitter:image' }, effectiveTwitterImage);
      }
      if (twitterImageAlt) {
        updateMetaInternal({ name: 'twitter:image:alt' }, twitterImageAlt);
      }
      if (twitterCreator) {
        updateMetaInternal({ name: 'twitter:creator' }, twitterCreator);
      }
      if (twitterSite) {
        updateMetaInternal({ name: 'twitter:site' }, twitterSite);
      }

      // === Canonical / Pagination / Hreflang ===
      if (effectiveCanonical) {
        updateLinkInternal('canonical', effectiveCanonical, {}, true);
      }
      if (prev) {
        updateLinkInternal('prev', prev, {}, true);
      }
      if (next) {
        updateLinkInternal('next', next, {}, true);
      }

      if (hreflangs?.length) {
        removeMarkedElements(
          'link[rel="alternate"][hreflang]',
          addedElements.current
        );
        hreflangs.forEach((h) => {
          updateLinkInternal(
            'alternate',
            h.href,
            { hrefLang: h.hrefLang },
            false,
            `[hreflang="${h.hrefLang}"]`
          );
        });
      }

      // === Robots ===
      // Prefer `robots` prop, fall back to deprecated booleans
      const robotsFromFlags = buildRobotsFromFlags({
        noindex,
        nofollow,
        noarchive,
        nosnippet,
        noimageindex,
      });
      const effectiveRobots: RobotsOptions | undefined =
        robots ?? robotsFromFlags;
      const { robots: robotsStr, googlebot } = buildRobots(effectiveRobots);

      if (robotsStr) {
        updateMetaInternal({ name: 'robots' }, robotsStr);
      } else {
        // Remove robots meta if we previously added it and now it's not needed
        removeMarkedElements('meta[name="robots"]', addedElements.current);
      }

      if (googlebot) {
        updateMetaInternal({ name: 'googlebot' }, googlebot);
      }

      // === Additional custom tags ===
      additionalMetaTags.forEach((tag) => {
        if (!tag?.content) return;
        // Skip tags without any key identifier to avoid matching any meta element
        if (!tag.name && !tag.property && !tag.httpEquiv) return;
        const key: MetaTagKey = tag.property
          ? { property: tag.property }
          : tag.httpEquiv
            ? { httpEquiv: tag.httpEquiv }
            : { name: tag.name };
        updateMetaInternal(key, tag.content);
      });

      additionalLinkTags.forEach((tag) => {
        if (!tag?.href) return;
        updateLinkInternal(tag.rel, tag.href, {
          type: tag.type,
          sizes: tag.sizes,
          media: tag.media,
          hrefLang: tag.hrefLang,
          as: tag.as,
          crossOrigin: tag.crossOrigin,
        });
      });

      // === Structured Data (JSON-LD) ===
      removeMarkedElements(
        'script[type="application/ld+json"]',
        addedElements.current
      );

      if (structuredData) {
        const items = Array.isArray(structuredData)
          ? structuredData
          : [structuredData];
        items.forEach((data, index) => {
          const script = createJsonLdScript(data, index);
          if (script) {
            document.head.appendChild(script);
            addedElements.current.add(script);
          } else if (enableWarnings) {
            warn(`Invalid structured data at index ${index}`, enableWarnings);
          }
        });
      }

      // Store snapshot
      lastSnapshotRef.current = configSnapshot;
      prevConfigRef.current = configJSON;

      // === Dev best-practice warnings ===
      if (enableWarnings) {
        if (!title && !ogTitle && !twitterTitle) {
          warn(
            'No title provided. Page titles are essential for SEO.',
            enableWarnings
          );
        }
        if (!description && !ogDescription && !twitterDescription) {
          warn(
            'No description provided. Add a compelling meta description.',
            enableWarnings
          );
        }
        if (!effectiveCanonical && !ogUrl) {
          warn(
            'No canonical URL provided. Consider setting one to avoid duplicate content.',
            enableWarnings
          );
        }
        if (
          (ogImage ?? ogImages?.length) &&
          !ogImageAlt &&
          !ogImages?.some((i) => i.alt)
        ) {
          warn(
            'OG image(s) without alt text. Consider adding for accessibility.',
            enableWarnings
          );
        }
        if (effectiveTwitterImage && !twitterImageAlt) {
          warn(
            'Twitter image without alt text. Consider adding `twitterImageAlt`.',
            enableWarnings
          );
        }
      }
    } catch (error) {
      logError('Error updating head tags', error);
    }

    // Intentionally no cleanup on unmount: meta/link tags persist across
    // component lifecycles to avoid flicker during SPA navigation.
    // Use clearSEOTags() for explicit cleanup when needed.
  }, [
    // Basic SEO
    title,
    description,
    keywords,
    canonical,
    autoCanonical,
    language,
    author,
    publishedTime,
    modifiedTime,
    expirationTime,
    // Title formatting
    titlePrefix,
    titleSuffix,
    titleTemplate,
    titleSeparator,
    // Open Graph
    ogTitle,
    ogDescription,
    ogImage,
    ogImageWidth,
    ogImageHeight,
    ogImageAlt,
    ogImages,
    ogType,
    ogSiteName,
    ogUrl,
    ogLocale,
    ogLocaleAlternates,
    // Twitter
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    twitterCreator,
    twitterSite,
    // Robots
    robots,
    noindex,
    nofollow,
    noarchive,
    nosnippet,
    noimageindex,
    // Links
    hreflangs,
    prev,
    next,
    // JSON-LD
    structuredData,
    // Extras
    additionalMetaTags,
    additionalLinkTags,
    // Options
    preventDuplicates,
    enableWarnings,
    validateUrls,
    // Internal callbacks
    updateMetaInternal,
    updateLinkInternal,
  ]);

  return {
    updateMetaTag,
    updateLinkTag,
    clearSEOTags,
    getCurrentSEO,
  };
}

// Default export for convenience
export default useSEO;
