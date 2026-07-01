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
  OpenGraphVideo,
  OpenGraphAudio,
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
  escapeSelectorValue,
  hashJsonLd,
  serializeJsonLdContent,
  SEO_MARKER,
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
 * @remarks
 * **Performance note — `JSON.stringify` order-sensitivity in change detection.**
 * The hook serializes the resolved props with `JSON.stringify` and skips the
 * effect when the new serialization matches the previous one. `JSON.stringify`
 * walks an object's keys in insertion order, so the SAME data passed with a
 * different key order produces a DIFFERENT string and forces the effect to
 * re-run (a no-op in DOM terms but wasted work). Two practical guidelines:
 *
 * 1. Stabilize the props object across renders (e.g., `useMemo`) instead of
 *    constructing a fresh object literal each render. Even when the values
 *    are identical, a fresh literal is a different reference and React calls
 *    your hook with a new object each render — change detection then has to
 *    serialize and compare to detect that nothing changed.
 * 2. When you DO build the props object inline, keep the key order stable
 *    across renders. Don't conditionally swap key positions — the change
 *    detection will treat that as a real change.
 * 3. Prefer top-level primitive props over nested objects/arrays when both
 *    work, since primitive equality is faster than object serialization.
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
    ogVideo,
    ogVideos,
    ogAudio,
    ogAudios,

    // Article-specific OG
    articleAuthor,
    articleSection,
    articleTags,

    // Twitter
    twitterCard = DEFAULT_TWITTER_CARD,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    twitterCreator,
    twitterSite,
    twitterPlayer,
    twitterPlayerWidth,
    twitterPlayerHeight,
    twitterPlayerStream,
    twitterPlayerStreamContentType,

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
    clearOnUnmount = false,
  } = props;

  // Track elements added by this hook instance for cleanup
  const addedElements = useRef<Set<Element>>(new Set());
  // Track previous config JSON for change detection
  const prevConfigRef = useRef<string>('');
  // Store last applied config for getCurrentSEO
  const lastSnapshotRef = useRef<SEOProps>({});
  // Track the latest `clearOnUnmount` value so the unmount-cleanup effect
  // (which runs only once with `[]` deps) can read the most recent setting
  // at the moment of unmount, not a stale closure value.
  const clearOnUnmountRef = useRef<boolean>(clearOnUnmount);
  clearOnUnmountRef.current = clearOnUnmount;
  // Track JSON-LD scripts by stable content hash. The Map preserves insertion
  // order so we can reconcile incrementally: scripts whose hash is unchanged
  // across renders are reused (not torn down + recreated), scripts for stale
  // hashes are removed, and brand-new hashes get freshly created scripts.
  // This avoids unnecessary DOM churn when (a) only one item in a multi-item
  // structuredData array changed, or (b) some unrelated SEO prop changed but
  // the structuredData array was untouched.
  //
  // Each entry stores BOTH the live element AND the previously-rendered
  // serialized content. On the reuse path we re-serialize the new payload and
  // compare it against the stored content; if they differ we know we hit a
  // hash collision (two semantically distinct payloads produced the same
  // FNV-1a hash) and re-write the script's `textContent` so the DOM never
  // serves stale data. Without the stored content we'd have to either always
  // re-write (defeating the perf optimization) or accept silent staleness.
  const jsonLdScriptsRef = useRef<
    Map<string, { element: HTMLScriptElement; content: string }>
  >(new Map());

  /**
   * Internal: Update or create a meta tag
   */
  const updateMetaInternal = useCallback(
    (key: MetaTagKey, content: string): void => {
      if (!canUseDOM()) return;
      if (!content || (typeof content === 'string' && !content.trim())) return;
      // Bail out if the caller forgot to provide an identifier — without one,
      // `getOrCreateMeta` would refuse to operate (returns null) to avoid
      // overwriting an unrelated meta element.
      if (!key.name && !key.property && !key.httpEquiv) return;

      // Ownership tracking now happens INSIDE `getOrCreateMeta`, on its
      // create path only: it adds a brand-new element to `addedElements`
      // but skips a reused one. That distinction matters across multiple
      // live `useSEO` instances sharing one document — a marker-based check
      // here (`meta.getAttribute(SEO_MARKER) === 'true'`) can't tell "I
      // created this" from "some OTHER instance created this and I'm just
      // mutating it", so it used to adopt other instances' elements into
      // this instance's Set. Adopting them meant this instance's
      // `clearSEOTags`/`clearOnUnmount` could delete an element a sibling
      // instance still depended on.
      const meta = getOrCreateMeta(
        key,
        preventDuplicates,
        addedElements.current
      );
      if (!meta) return;
      meta.setAttribute('content', content);
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

      // Refuse to operate without a key — this prevents `getOrCreateMeta`
      // from being asked to match "any meta" and silently overwriting an
      // unrelated tag. Surface a dev warning so the misuse is visible.
      if (!key.name && !key.property && !key.httpEquiv) {
        warn(
          'updateMetaTag called without a key (name/property/httpEquiv). The call was ignored.',
          enableWarnings
        );
        return;
      }

      // URL validation for URL-like fields. Honor `httpEquiv` too — some
      // http-equiv values can carry URLs (e.g., `Content-Location`,
      // `X-Frame-Options` with a URI), and the previous heuristic ignored
      // them entirely. `isUrlField` is conservative enough that ordinary
      // http-equiv names like `refresh`/`Content-Type` (whose content is
      // composite, NOT a bare URL) won't be misclassified as URL fields.
      if (validateUrls && content) {
        const fieldName = key.property ?? key.name ?? key.httpEquiv ?? '';
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
      // Refuse to operate without a `rel` — otherwise `getOrCreateLink`
      // would build a `link[rel=""]` selector and either match the wrong
      // element or create a useless empty `<link>`.
      if (typeof rel !== 'string' || !rel.trim()) {
        warn(
          'updateLinkTag called without a rel. The call was ignored.',
          enableWarnings
        );
        return;
      }
      // Reject null/undefined/empty/whitespace-only href values up front so
      // we don't silently create a `<link href="">` (which is treated by
      // the browser as the document URL — almost never what the caller
      // wants). Use a non-throwing string-coercion check instead of
      // `href?.trim()` because `href` may be `null` at runtime even though
      // the TypeScript signature says `string`.
      if (typeof href !== 'string' || !href.trim()) {
        warn(
          `updateLinkTag called for rel="${rel}" with empty or missing href. The call was ignored.`,
          enableWarnings
        );
        return;
      }

      // URL validation
      if (validateUrls && !isValidUrl(href, true)) {
        warn(
          `Invalid URL provided for link rel="${rel}": ${href}`,
          enableWarnings
        );
        return;
      }

      // See the matching comment in `updateMetaInternal`: ownership tracking
      // now happens INSIDE `getOrCreateLink`'s create path, so a reused
      // element created by a different `useSEO` instance is never adopted
      // into this instance's `addedElements` Set.
      const link = getOrCreateLink(
        rel,
        unique,
        keySelector,
        addedElements.current
      );
      link.setAttribute('href', href);

      // Set additional attributes
      if (attrs.type) link.setAttribute('type', attrs.type);
      if (attrs.sizes) link.setAttribute('sizes', attrs.sizes);
      if (attrs.media) link.setAttribute('media', attrs.media);
      if (attrs.hrefLang) link.setAttribute('hreflang', attrs.hrefLang);
      if (attrs.as) link.setAttribute('as', attrs.as);
      if (attrs.crossOrigin)
        link.setAttribute('crossorigin', attrs.crossOrigin);
    },
    [validateUrls, enableWarnings]
  );

  /**
   * Public: Update or create a link tag (with overloaded signatures)
   *
   * Overload disambiguation uses the type of the third argument:
   * - Object (non-null) → modern signature
   *   `(rel, href, attrs, unique?, keySelector?)`
   * - String → legacy signature
   *   `(rel, href, type, sizes?, media?, hrefLang?, crossOrigin?)`
   * - `null`/`undefined` → looked up in the fourth argument; if it is a
   *   `boolean` we treat the call as modern (`attrs` is empty), otherwise
   *   we treat it as legacy. This means a caller who only wants to set
   *   `unique` can write `updateLinkTag('canonical', 'https://x', undefined, true)`.
   */
  const updateLinkTag = useCallback(
    (
      rel: string,
      href: string,
      attrsOrType?: LinkTagAttrs | string | null,
      uniqueOrSizes?: boolean | string,
      keySelectorOrMedia?: string,
      hrefLangArg?: string,
      crossOriginArg?: string
    ): void => {
      if (!canUseDOM()) return;

      // Disambiguate the overloads by inspecting the third argument's type,
      // falling back to the fourth argument when the third is null/undefined.
      const isModernByThird =
        attrsOrType !== null &&
        attrsOrType !== undefined &&
        typeof attrsOrType === 'object';
      const isLegacyByThird = typeof attrsOrType === 'string';
      // When `attrsOrType` is null/undefined and the fourth arg is a boolean,
      // the caller is unambiguously using the modern signature with no attrs
      // (they only care about `unique`).
      const isModernByFourth =
        !isModernByThird &&
        !isLegacyByThird &&
        typeof uniqueOrSizes === 'boolean';

      if (isModernByThird || isModernByFourth) {
        // Modern signature: (rel, href, attrs?, unique?, keySelector?)
        // When `attrsOrType` is non-string and non-null/undefined, it must
        // be a `LinkTagAttrs` per the overload signature; otherwise we
        // default to an empty attrs object.
        const attrs: LinkTagAttrs =
          isModernByThird && attrsOrType && typeof attrsOrType !== 'string'
            ? attrsOrType
            : {};
        updateLinkInternal(
          rel,
          href,
          attrs,
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
   * Remove all SEO tags added by this hook instance.
   *
   * Only elements created by the hook (those carrying the
   * `data-use-seo="true"` marker) are removed. Pre-existing user-authored
   * elements that the hook merely mutated are preserved — removing them
   * would be silent data loss.
   *
   * Also resets the hook's internal change-detection state (`prevConfigRef`
   * and `jsonLdScriptsRef`), so a subsequent render — even one whose config
   * serializes identically to the last-applied one — re-applies every tag
   * from scratch instead of hitting the main effect's early-return and
   * leaving `<head>` empty until some prop actually changes.
   */
  const clearSEOTags = useCallback((): void => {
    if (!canUseDOM()) return;

    addedElements.current.forEach((el) => {
      // Defense in depth: even if a non-created element somehow ended up in
      // the tracking Set, only remove ones that carry the SEO marker.
      if (el.getAttribute(SEO_MARKER) === 'true' && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    addedElements.current.clear();

    // Invalidate change-detection + JSON-LD reconciliation state so the next
    // effect run re-applies every tag from scratch. Without this, a
    // re-render with an unchanged config would hit the early-return in the
    // main effect and never recreate the tags we just removed. Mirrors the
    // unmount-cleanup effect below.
    prevConfigRef.current = '';
    jsonLdScriptsRef.current.clear();
  }, []);

  /**
   * Get the current SEO configuration snapshot.
   *
   * Returns a deep clone so callers can mutate nested arrays/objects (e.g.
   * `getCurrentSEO().ogImages.push(...)`) without corrupting the internal
   * snapshot. Always uses a `JSON.parse(JSON.stringify(...))` round-trip so
   * the result shape is identical across every supported runtime (Node 16+,
   * every modern browser, every bundler) — there is no `structuredClone`
   * fast-path to diverge from. The implication is that any keys whose value
   * is `undefined` are DROPPED from the returned object (since
   * `JSON.stringify` omits `undefined` values), and the schema must be
   * JSON-clean (no `Date`/`Map`/`Set`/`BigInt`/functions/circular refs).
   * `SEOProps` is intentionally JSON-clean — it exposes only primitives,
   * strings, plain arrays, and plain objects — so this trade-off is safe
   * and the cross-runtime shape is uniform.
   *
   * Cost note: serialising tens of primitives is in the microsecond range
   * and `getCurrentSEO()` is typically called once per consumer (e.g., to
   * read the current state from a debugging panel or test), so the small
   * perf delta versus `structuredClone` is irrelevant in practice.
   */
  const getCurrentSEO = useCallback((): SEOProps => {
    const snap = lastSnapshotRef.current;
    return JSON.parse(JSON.stringify(snap)) as SEOProps;
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
      ogVideo,
      ogVideos,
      ogAudio,
      ogAudios,
      articleAuthor,
      articleSection,
      articleTags,
      twitterCard,
      twitterTitle,
      twitterDescription,
      twitterImage: effectiveTwitterImage,
      twitterImageAlt,
      twitterCreator,
      twitterSite,
      twitterPlayer,
      twitterPlayerWidth,
      twitterPlayerHeight,
      twitterPlayerStream,
      twitterPlayerStreamContentType,
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
      } else {
        // Stale-cleanup parity with the sibling `article:section` tag: an
        // SPA nav away from an article page (same hook instance) must not
        // leave a stale published-time directive in the DOM for crawlers.
        removeMarkedElements(
          'meta[property="article:published_time"]',
          addedElements.current
        );
      }
      if (modifiedTime) {
        updateMetaInternal({ property: 'article:modified_time' }, modifiedTime);
      } else {
        removeMarkedElements(
          'meta[property="article:modified_time"]',
          addedElements.current
        );
      }
      if (expirationTime) {
        updateMetaInternal(
          { property: 'article:expiration_time' },
          expirationTime
        );
      } else {
        removeMarkedElements(
          'meta[property="article:expiration_time"]',
          addedElements.current
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
      } else {
        // The effective value disappeared on this render (no ogUrl, no
        // canonical). Remove any previously hook-created og:url so it
        // doesn't linger as stale metadata.
        removeMarkedElements('meta[property="og:url"]', addedElements.current);
      }

      if (ogLocale) {
        updateMetaInternal({ property: 'og:locale' }, ogLocale);
      } else {
        // The user removed `ogLocale` between renders — clean up any
        // previously hook-created og:locale instead of leaving it stale.
        removeMarkedElements(
          'meta[property="og:locale"]',
          addedElements.current
        );
      }

      // OG Locale Alternates
      // ALWAYS clean up previous alternates before re-creating, even when
      // the new value is empty/undefined — otherwise stale tags from the
      // last render would persist after the user removes the prop.
      removeMarkedElements(
        'meta[property="og:locale:alternate"]',
        addedElements.current
      );
      if (ogLocaleAlternates?.length) {
        ogLocaleAlternates.forEach((loc) => {
          // Create new meta for each alternate (don't reuse existing)
          const meta = createMeta({ property: 'og:locale:alternate' });
          meta.setAttribute('content', loc);
          addedElements.current.add(meta);
        });
      }

      // OG Images
      // ALWAYS clean up previous og:image* tags before re-creating, even
      // when the new value is empty/undefined — otherwise stale tags from
      // the last render would persist after the user removes the prop.
      // The `og:image*` selector covers og:image, og:image:width,
      // og:image:height, og:image:alt, og:image:secure_url, og:image:type.
      removeMarkedElements('meta[property^="og:image"]', addedElements.current);
      if (ogImages?.length) {
        ogImages.forEach((img: OpenGraphImage) => {
          // Skip images with invalid URLs
          if (!isUrlValid(img.url, 'og:image')) return;

          // Create new meta for each image (don't reuse existing)
          const imageMeta = createMeta({ property: 'og:image' });
          imageMeta.setAttribute('content', img.url);
          addedElements.current.add(imageMeta);

          if (img.secureUrl) {
            // Validate the explicit `secureUrl` separately from the primary
            // `url` so a malformed CMS value doesn't slip a broken
            // `og:image:secure_url` into the DOM. The rest of the image
            // entry (og:image, width/height/alt/type) still emits.
            if (isUrlValid(img.secureUrl, 'og:image:secure_url')) {
              const secureUrlMeta = createMeta({
                property: 'og:image:secure_url',
              });
              secureUrlMeta.setAttribute('content', img.secureUrl);
              addedElements.current.add(secureUrlMeta);
            }
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

      // === OG Video ===
      // ALWAYS clean up previous og:video* tags before re-creating, even
      // when the new value is empty/undefined — otherwise stale tags from
      // the last render would persist after the user removes the prop.
      // The `og:video*` selector covers og:video, og:video:secure_url,
      // og:video:type, og:video:width, og:video:height, og:video:alt.
      removeMarkedElements('meta[property^="og:video"]', addedElements.current);
      if (ogVideos?.length) {
        ogVideos.forEach((video: OpenGraphVideo) => {
          if (!isUrlValid(video.url, 'og:video')) return;

          const videoMeta = createMeta({ property: 'og:video' });
          videoMeta.setAttribute('content', video.url);
          addedElements.current.add(videoMeta);

          if (video.secureUrl) {
            // Validate the explicit `secureUrl` separately from the primary
            // `url` so a malformed value doesn't slip a broken
            // `og:video:secure_url` into the DOM. The rest of the video
            // entry still emits.
            if (isUrlValid(video.secureUrl, 'og:video:secure_url')) {
              const secureUrlMeta = createMeta({
                property: 'og:video:secure_url',
              });
              secureUrlMeta.setAttribute('content', video.secureUrl);
              addedElements.current.add(secureUrlMeta);
            }
          } else if (video.url.startsWith('https:')) {
            const secureUrlMeta = createMeta({
              property: 'og:video:secure_url',
            });
            secureUrlMeta.setAttribute('content', video.url);
            addedElements.current.add(secureUrlMeta);
          }

          if (video.type) {
            const typeMeta = createMeta({ property: 'og:video:type' });
            typeMeta.setAttribute('content', video.type);
            addedElements.current.add(typeMeta);
          }
          if (video.width) {
            const widthMeta = createMeta({ property: 'og:video:width' });
            widthMeta.setAttribute('content', String(video.width));
            addedElements.current.add(widthMeta);
          }
          if (video.height) {
            const heightMeta = createMeta({ property: 'og:video:height' });
            heightMeta.setAttribute('content', String(video.height));
            addedElements.current.add(heightMeta);
          }
          if (video.alt) {
            const altMeta = createMeta({ property: 'og:video:alt' });
            altMeta.setAttribute('content', video.alt);
            addedElements.current.add(altMeta);
          }
        });
      } else if (ogVideo && isUrlValid(ogVideo, 'og:video')) {
        // Single video shorthand (legacy parity with `ogImage`).
        const videoMeta = createMeta({ property: 'og:video' });
        videoMeta.setAttribute('content', ogVideo);
        addedElements.current.add(videoMeta);

        if (ogVideo.startsWith('https:')) {
          const secureUrlMeta = createMeta({
            property: 'og:video:secure_url',
          });
          secureUrlMeta.setAttribute('content', ogVideo);
          addedElements.current.add(secureUrlMeta);
        }
      }

      // === OG Audio ===
      // ALWAYS clean up previous og:audio* tags before re-creating.
      removeMarkedElements('meta[property^="og:audio"]', addedElements.current);
      if (ogAudios?.length) {
        ogAudios.forEach((audio: OpenGraphAudio) => {
          if (!isUrlValid(audio.url, 'og:audio')) return;

          const audioMeta = createMeta({ property: 'og:audio' });
          audioMeta.setAttribute('content', audio.url);
          addedElements.current.add(audioMeta);

          if (audio.secureUrl) {
            // Validate the explicit `secureUrl` separately from the primary
            // `url` so a malformed value doesn't slip a broken
            // `og:audio:secure_url` into the DOM. The rest of the audio
            // entry still emits.
            if (isUrlValid(audio.secureUrl, 'og:audio:secure_url')) {
              const secureUrlMeta = createMeta({
                property: 'og:audio:secure_url',
              });
              secureUrlMeta.setAttribute('content', audio.secureUrl);
              addedElements.current.add(secureUrlMeta);
            }
          } else if (audio.url.startsWith('https:')) {
            const secureUrlMeta = createMeta({
              property: 'og:audio:secure_url',
            });
            secureUrlMeta.setAttribute('content', audio.url);
            addedElements.current.add(secureUrlMeta);
          }

          if (audio.type) {
            const typeMeta = createMeta({ property: 'og:audio:type' });
            typeMeta.setAttribute('content', audio.type);
            addedElements.current.add(typeMeta);
          }
        });
      } else if (ogAudio && isUrlValid(ogAudio, 'og:audio')) {
        // Single audio shorthand.
        const audioMeta = createMeta({ property: 'og:audio' });
        audioMeta.setAttribute('content', ogAudio);
        addedElements.current.add(audioMeta);

        if (ogAudio.startsWith('https:')) {
          const secureUrlMeta = createMeta({
            property: 'og:audio:secure_url',
          });
          secureUrlMeta.setAttribute('content', ogAudio);
          addedElements.current.add(secureUrlMeta);
        }
      }

      // === Article-specific Open Graph (independent of `ogType`) ===
      // These fields are emitted whenever the corresponding prop is
      // provided; we intentionally do NOT gate them on `ogType === 'article'`
      // (setting it is recommended for spec-conformant consumers/validators,
      // but not required). Multi-value tags (article:author, article:tag)
      // follow the same cleanup-then-recreate pattern as OG image/locale
      // alternates so a re-render with the prop unset removes stale tags.
      removeMarkedElements(
        'meta[property="article:author"]',
        addedElements.current
      );
      if (articleAuthor) {
        const authors = Array.isArray(articleAuthor)
          ? articleAuthor
          : [articleAuthor];
        authors.forEach((author) => {
          if (typeof author !== 'string' || !author.trim()) return;
          // Honor URL validation when the value looks like a URL — per the
          // OG Article spec the value SHOULD be a profile URL, but
          // historically some sites use plain text identifiers, so only
          // skip when validation explicitly rejects an absolute URL.
          if (validateUrls && /^https?:\/\//i.test(author)) {
            if (!isValidUrl(author, true)) {
              warn(
                `Invalid URL provided for article:author: ${author}`,
                enableWarnings
              );
              return;
            }
          }
          const authorMeta = createMeta({ property: 'article:author' });
          authorMeta.setAttribute('content', author);
          addedElements.current.add(authorMeta);
        });
      }

      if (articleSection) {
        updateMetaInternal({ property: 'article:section' }, articleSection);
      } else {
        // Stale-cleanup parity with other auto-emitted single-value tags.
        removeMarkedElements(
          'meta[property="article:section"]',
          addedElements.current
        );
      }

      removeMarkedElements(
        'meta[property="article:tag"]',
        addedElements.current
      );
      if (articleTags?.length) {
        articleTags.forEach((tag) => {
          if (typeof tag !== 'string' || !tag.trim()) return;
          const tagMeta = createMeta({ property: 'article:tag' });
          tagMeta.setAttribute('content', tag);
          addedElements.current.add(tagMeta);
        });
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
      } else {
        // The effective twitter image disappeared on this render
        // (no twitterImage, ogImage, or ogImages). Clean up any
        // previously hook-created twitter:image so it doesn't linger.
        removeMarkedElements(
          'meta[name="twitter:image"]',
          addedElements.current
        );
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

      // === Twitter Player Card (when twitterCard === 'player') ===
      // The fields are emitted whenever the user provides them; we intentionally
      // do NOT gate on `twitterCard === 'player'` because some validators are
      // happy with the player meta tags being present alongside other cards
      // (e.g., a fallback summary card). When the user removes the player URL
      // we still clean up the previously-emitted player meta tags so they
      // don't linger across re-renders.
      if (twitterPlayer && isUrlValid(twitterPlayer, 'twitter:player')) {
        if (!twitterPlayer.startsWith('https:')) {
          // Warn-don't-block, matching how og:url/og:image handle `http:`
          // values elsewhere: the tag is still emitted, but X's Player
          // Card validator/crawler silently rejects non-HTTPS player URLs.
          warn(
            'twitter:player should be an HTTPS URL; X rejects non-HTTPS player URLs.',
            enableWarnings
          );
        }
        updateMetaInternal({ name: 'twitter:player' }, twitterPlayer);
      } else {
        removeMarkedElements(
          'meta[name="twitter:player"]',
          addedElements.current
        );
      }
      if (twitterPlayerWidth !== undefined) {
        updateMetaInternal(
          { name: 'twitter:player:width' },
          String(twitterPlayerWidth)
        );
      } else {
        removeMarkedElements(
          'meta[name="twitter:player:width"]',
          addedElements.current
        );
      }
      if (twitterPlayerHeight !== undefined) {
        updateMetaInternal(
          { name: 'twitter:player:height' },
          String(twitterPlayerHeight)
        );
      } else {
        removeMarkedElements(
          'meta[name="twitter:player:height"]',
          addedElements.current
        );
      }
      if (
        twitterPlayerStream &&
        isUrlValid(twitterPlayerStream, 'twitter:player:stream')
      ) {
        if (!twitterPlayerStream.startsWith('https:')) {
          // Same HTTPS-only requirement as twitter:player above.
          warn(
            'twitter:player:stream should be an HTTPS URL; X rejects non-HTTPS player URLs.',
            enableWarnings
          );
        }
        updateMetaInternal(
          { name: 'twitter:player:stream' },
          twitterPlayerStream
        );
      } else {
        removeMarkedElements(
          'meta[name="twitter:player:stream"]',
          addedElements.current
        );
      }
      if (twitterPlayerStreamContentType) {
        updateMetaInternal(
          { name: 'twitter:player:stream:content_type' },
          twitterPlayerStreamContentType
        );
      } else {
        removeMarkedElements(
          'meta[name="twitter:player:stream:content_type"]',
          addedElements.current
        );
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

      // ALWAYS clean up previous hreflang alternates before re-creating,
      // even when the new value is empty/undefined — otherwise stale tags
      // from the last render would persist after the user removes the prop.
      removeMarkedElements(
        'link[rel="alternate"][hreflang]',
        addedElements.current
      );
      if (hreflangs?.length) {
        hreflangs.forEach((h) => {
          // Escape the hreflang value before interpolating it into the CSS
          // selector — otherwise a value like `en"]` would corrupt the
          // selector and either throw `SyntaxError` or match unrelated
          // elements.
          const escapedHrefLang = escapeSelectorValue(h.hrefLang);
          updateLinkInternal(
            'alternate',
            h.href,
            { hrefLang: h.hrefLang },
            false,
            `[hreflang="${escapedHrefLang}"]`
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
      } else {
        // Parity with robots above: remove a previously hook-created googlebot
        // meta when the effective googlebot directive disappears, so a stale
        // crawler directive doesn't linger across renders. Only hook-created
        // (data-use-seo="true") elements are removed; user-authored googlebot
        // tags are preserved.
        removeMarkedElements('meta[name="googlebot"]', addedElements.current);
      }

      // === Additional custom tags ===
      additionalMetaTags.forEach((tag) => {
        if (!tag?.content) return;
        // Trim each key field so whitespace-only values (e.g.
        // `{ name: '   ', content: 'foo' }`) cannot bypass the empty-trio
        // guard and create a `<meta name="   ">` element with a
        // syntactically valid but semantically meaningless identifier.
        const trimmedName = tag.name?.trim();
        const trimmedProperty = tag.property?.trim();
        const trimmedHttpEquiv = tag.httpEquiv?.trim();
        // Skip tags without any non-empty key identifier after trimming.
        if (!trimmedName && !trimmedProperty && !trimmedHttpEquiv) {
          warn(
            'additionalMetaTags entry has no non-empty name/property/httpEquiv after trimming; skipping.',
            enableWarnings
          );
          return;
        }
        const key: MetaTagKey = trimmedProperty
          ? { property: trimmedProperty }
          : trimmedHttpEquiv
            ? { httpEquiv: trimmedHttpEquiv }
            : { name: trimmedName };

        // Honor `validateUrls` for custom meta tags — previously this code
        // bypassed validation, so `additionalMetaTags: [{ property:
        // 'og:image', content: 'not-a-url' }]` slipped through even when
        // the matching built-in field would have been rejected.
        if (validateUrls && tag.content) {
          const fieldName =
            trimmedProperty ?? trimmedName ?? trimmedHttpEquiv ?? '';
          if (isUrlField(fieldName) && !isValidUrl(tag.content, true)) {
            warn(
              `Invalid URL provided for ${fieldName}: ${tag.content}`,
              enableWarnings
            );
            return;
          }
        }

        updateMetaInternal(key, tag.content);
      });

      additionalLinkTags.forEach((tag) => {
        if (!tag?.href) return;
        // `updateLinkInternal` already validates href when validateUrls is
        // true, but we duplicate the early return here so the warning
        // message is consistent (`additionalLinkTags[...]`) and so we can
        // skip without invoking the rest of `updateLinkInternal`.
        if (validateUrls && !isValidUrl(tag.href, true)) {
          warn(
            `Invalid URL provided for additionalLinkTags rel="${tag.rel}": ${tag.href}`,
            enableWarnings
          );
          return;
        }
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
      // Incremental reconciliation:
      //   1. Compute a stable hash for each item in the new array.
      //   2. Reuse the existing <script> element when its hash is still
      //      present in the new array (preserves element identity).
      //   3. Remove <script> elements whose hash disappeared.
      //   4. Create new <script> elements for new hashes.
      //   5. Re-append in the new array order so document order matches the
      //      caller-supplied order. `appendChild` on an already-attached node
      //      moves it without recreating it, so element identity is preserved
      //      even when the array is shuffled.
      const items = structuredData
        ? Array.isArray(structuredData)
          ? structuredData
          : [structuredData]
        : [];

      // Build the new ordered list of (hash, item, originalIndex) entries.
      // Items that fail to hash (circular refs, BigInt) get a synthetic
      // unique key so they always go through the create path — and the
      // create path will then log the error via createJsonLdScript.
      const newEntries: Array<{
        hash: string;
        data: object;
        index: number;
      }> = [];
      const seenHashes = new Set<string>();
      items.forEach((data, index) => {
        const baseHash = hashJsonLd(data);
        // De-duplicate identical payloads within the SAME render by suffixing
        // the index so each occurrence gets its own slot. Without this, two
        // identical items would collapse to a single <script> element.
        let hash = baseHash ?? `__unhashable_${index}`;
        if (seenHashes.has(hash)) {
          hash = `${hash}__dup_${index}`;
        }
        seenHashes.add(hash);
        newEntries.push({ hash, data, index });
      });

      const previousMap = jsonLdScriptsRef.current;
      const nextMap = new Map<
        string,
        { element: HTMLScriptElement; content: string }
      >();

      // Step 1: remove scripts whose hash is no longer present.
      previousMap.forEach((entry, hash) => {
        if (!seenHashes.has(hash)) {
          entry.element.parentElement?.removeChild(entry.element);
          addedElements.current.delete(entry.element);
        }
      });

      // Step 2: walk the new entries, reusing or creating scripts in order.
      newEntries.forEach(({ hash, data, index }) => {
        const existing = previousMap.get(hash);
        if (existing?.element.isConnected) {
          // Reuse: re-append to enforce document order. `appendChild` on an
          // attached node detaches and re-inserts WITHOUT recreating, so the
          // Element identity is preserved (verified by the test suite).
          document.head.appendChild(existing.element);
          // Keep the data-seo-index in sync with the new position so callers
          // that key off this attribute still see the correct order.
          existing.element.setAttribute('data-seo-index', String(index));
          // Hash-collision defense: serialize the new payload and compare
          // against the previously-rendered content. If the hash matched but
          // the actual content differs (rare FNV-1a collision), update the
          // script's textContent so the DOM reflects the caller's intent.
          // When the content matches exactly we skip the DOM write so the
          // perf characteristic of incremental reconciliation is preserved.
          const newContent = serializeJsonLdContent(data, index);
          if (newContent !== null && newContent !== existing.content) {
            existing.element.textContent = newContent;
            nextMap.set(hash, {
              element: existing.element,
              content: newContent,
            });
          } else {
            // No content change — keep the previously-stored content so a
            // future reuse can still detect any future collision.
            nextMap.set(hash, existing);
          }
          // Element is still tracked in addedElements; nothing else to do.
        } else {
          const script = createJsonLdScript(data, index);
          if (script) {
            document.head.appendChild(script);
            addedElements.current.add(script);
            // Capture the content actually written to the element so future
            // reuses can detect collisions. `script.textContent` is the
            // already-escaped string produced by `createJsonLdScript`.
            nextMap.set(hash, {
              element: script,
              content: script.textContent ?? '',
            });
          } else if (enableWarnings) {
            warn(`Invalid structured data at index ${index}`, enableWarnings);
          }
        }
      });

      jsonLdScriptsRef.current = nextMap;

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

    // Cleanup policy (see the per-tag `removeMarkedElements` calls above):
    // - Multi-value tags (og:image*, og:video*, og:audio*,
    //   og:locale:alternate, article:author, article:tag, hreflang) are
    //   removed then recreated on every render, since `createMeta` always
    //   appends — without the up-front removal, an unset-then-reset prop
    //   would accumulate duplicate elements.
    // - Single-value tags whose effective value can collapse to absent
    //   between renders — either because they're computed from a fallback
    //   chain (og:url, twitter:image, robots) or because a stale directive
    //   would mislead crawlers/social scrapers (og:locale, article:section,
    //   article:published_time, article:modified_time,
    //   article:expiration_time, twitter:player and its
    //   width/height/stream/stream:content_type sub-fields, googlebot) —
    //   are cleaned up via `removeMarkedElements` when that render's
    //   effective value is absent.
    // - Primary content that mirrors document-global state (title, language)
    //   and plain descriptive scalars (e.g. description, og:site_name,
    //   twitter:creator/site/image:alt, and the OG/Twitter title/description
    //   that fall back to title/description) are intentionally LEFT IN
    //   PLACE across re-renders to avoid flicker during SPA navigation;
    //   callers opt into removal via `clearOnUnmount` or the returned
    //   `clearSEOTags()` method explicitly whenever they need to.
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
    ogVideo,
    ogVideos,
    ogAudio,
    ogAudios,
    // Article-specific OG
    articleAuthor,
    articleSection,
    articleTags,
    // Twitter
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterImageAlt,
    twitterCreator,
    twitterSite,
    twitterPlayer,
    twitterPlayerWidth,
    twitterPlayerHeight,
    twitterPlayerStream,
    twitterPlayerStreamContentType,
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

  // Dedicated unmount-cleanup effect.
  //
  // Runs once at mount and registers a cleanup function that fires only on
  // unmount (because the deps array is empty). The cleanup reads the LATEST
  // values from refs so changes between mount and unmount are honored —
  // this is the intended pattern, not a bug. When opted in via
  // `clearOnUnmount`, it runs the same logic as the returned
  // `clearSEOTags()` method: only elements carrying the
  // `data-use-seo="true"` marker are removed; pre-existing user-authored
  // elements that the hook merely mutated are preserved.
  //
  // The `react-hooks/exhaustive-deps` rule warns about reading
  // `addedElements.current` / `jsonLdScriptsRef.current` inside the
  // cleanup because for refs that point to a React-managed DOM node the
  // ref's value may have moved by the time cleanup runs. Here the refs
  // hold a `Set` and a `Map` that the hook itself owns, not React-managed
  // nodes, so the standard "snapshot the ref" guidance doesn't apply —
  // we WANT the up-to-the-moment Set/Map at unmount time. Suppress the
  // false-positive at the specific lines.
  useEffect(() => {
    return () => {
      if (!clearOnUnmountRef.current) return;
      if (!canUseDOM()) return;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const tracked = addedElements.current;
      tracked.forEach((el) => {
        if (el.getAttribute(SEO_MARKER) === 'true' && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      tracked.clear();
      // Also drop the JSON-LD reconciliation map so a subsequent remount
      // starts from a clean slate rather than trying to reuse detached
      // <script> elements.
      jsonLdScriptsRef.current.clear();
    };
  }, []);

  return {
    updateMetaTag,
    updateLinkTag,
    clearSEOTags,
    getCurrentSEO,
  };
}

// Default export for convenience
export default useSEO;
