# Changelog

## [0.2.1] - 2026-02-22

### Fixed

- **Weak test assertions** - Fixed several tests that had missing or weak assertions: "removes robots meta when not needed" now properly asserts the marked element is removed; "clearSEOTags removes all added elements" now verifies elements are actually gone from the DOM; "skips invalid URLs when validateUrls is true" now uses a truly invalid URL (`http://[invalid`) instead of `not-a-valid-url` (which is a valid relative URL). (`tests/useSEO.test.tsx`)
- **Weak `normalizeLanguageTag` assertions** - Strengthened assertions from `toBeDefined()` to exact value checks (`toBe('en')`, `toBe('en-US')`, etc.) to catch regressions in normalization behavior. (`tests/utils/validation.test.ts`)
- **Weak `logError` assertion** - Now asserts exact call arguments instead of just `toHaveBeenCalled()`. (`tests/utils/warnings.test.ts`)

### Added

- **33 new tests** (241 → 274 total) covering important behavioral contracts:
  - `ogImages` takes precedence over `ogImage` when both are provided (`tests/useSEO.test.tsx`)
  - Twitter title/description fallback chains through `ogTitle`/`ogDescription` (`tests/useSEO.test.tsx`)
  - `og:url` falls back to effective canonical URL (`tests/useSEO.test.tsx`)
  - JSON-LD scripts properly replaced on re-render (`tests/useSEO.test.tsx`)
  - `ogLocaleAlternates` cleanup on re-render (`tests/useSEO.test.tsx`)
  - Hreflang links updated and old ones removed on re-render (`tests/useSEO.test.tsx`)
  - `updateMetaTag` with `httpEquiv` via legacy signature (`tests/useSEO.test.tsx`)
  - `getCurrentSEO` returns independent copy (`tests/useSEO.test.tsx`)
  - Boundary value tests for title (30/60), description (120/160), and keywords (10) validators (`tests/utils/title.test.ts`)
  - `inferImageMimeType` for `.ico` and uppercase extensions (`tests/utils/validation.test.ts`)
  - `normalizeCanonical` with empty hash fragments (`tests/utils/validation.test.ts`)
  - `maxVideoPreview: 'none'`, `maxImagePreview: 'none'/'standard'`, `maxSnippet: 0` (`tests/utils/robots.test.ts`)
  - `getOrCreateMeta` with `preventDuplicates=false` (`tests/utils/dom.test.ts`)
  - `ensureEssentialMeta` when only one of charset/viewport exists (`tests/utils/dom.test.ts`)
  - `removeMarkedElements` with no matching elements (`tests/utils/dom.test.ts`)
  - `warn` suppressed in test environment (`tests/utils/warnings.test.ts`)

## [0.2.0] - 2026-02-22

### Added

- **`titleSeparator` prop** - New `titleSeparator` property in `SEOProps` allows customizing the separator between title prefix/suffix and the base title. Defaults to `' | '`. (`src/types.ts`, `src/useSEO.ts`)
- **CSS selector sanitization** - New `escapeSelectorValue()` utility function in `src/utils/dom.ts` escapes special characters (`"`, `\`) in CSS selector attribute values, preventing malformed selectors when meta tag names or properties contain special characters.
- **URL validation for prop-based meta tags** - URLs passed through props (`ogImage`, `ogUrl`, `twitterImage`, `ogImages[].url`) are now validated when `validateUrls` is true. Previously only URLs set through `updateMetaTag()` and `updateLinkTag()` were validated. (`src/useSEO.ts`)
- **`removeMarkedElements` tracking** - `removeMarkedElements()` now accepts an optional `trackedElements` Set parameter to also remove cleaned-up elements from the tracking Set, preventing memory leaks. (`src/utils/dom.ts`)
- **18 new tests** covering all the changes below across `tests/utils/dom.test.ts`, `tests/utils/validation.test.ts`, and `tests/useSEO.test.tsx`.

### Fixed

- **Memory leak in `addedElements` Set** - When `removeMarkedElements` removed elements from the DOM (for og:locale:alternate, og:image, hreflang, JSON-LD, robots), the elements were not removed from the `addedElements` tracking Set. This caused the Set to grow unboundedly with stale references to detached DOM nodes, preventing garbage collection. All `removeMarkedElements` calls now pass the tracking Set for cleanup. (`src/useSEO.ts`)
- **`inferImageMimeType` hash fragment handling** - URLs with hash fragments (e.g., `image.jpg#section`) now correctly extract the file extension. The regex was updated from `/\.([a-z0-9]+)(?:\?.*)?$/i` to `/\.([a-z0-9]+)(?:[?#].*)?$/i`. (`src/utils/validation.ts`)
- **`additionalMetaTags` without key identifier** - Tags missing all key identifiers (`name`, `property`, `httpEquiv`) are now skipped. Previously, such tags would generate an empty CSS selector that could match any meta element, potentially overwriting unrelated meta tags. (`src/useSEO.ts`)
- **Missing `SEO_MARKER` on charset meta** - The charset meta element created by `ensureEssentialMeta()` now receives the `data-use-seo` marker attribute, consistent with all other elements created by the hook. (`src/utils/dom.ts`)
- **Misleading cleanup function comment** - The useEffect cleanup function (which was intentionally a no-op) had a misleading comment suggesting it cleaned up JSON-LD scripts. Replaced with an accurate comment explaining the intentional no-cleanup behavior for SPA navigation. (`src/useSEO.ts`)

### Changed

- **Hardcoded thresholds replaced with constants** - Warning thresholds in `useSEO.ts` (title length 30/60, description length 120/160, keywords count 10) and `src/utils/title.ts` (`validateTitleLength`, `validateDescriptionLength`, `validateKeywordsCount`) now use the exported constants (`MIN_TITLE_LENGTH`, `MAX_TITLE_LENGTH`, `MIN_DESCRIPTION_LENGTH`, `MAX_DESCRIPTION_LENGTH`, `MAX_KEYWORDS_COUNT`) instead of hardcoded values. This ensures the constants and actual behavior stay in sync.
