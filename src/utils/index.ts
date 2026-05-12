/**
 * @fileoverview Utility exports for useSEO hook
 * @module use-seo/utils
 *
 * @remarks
 * **Internal-vs-public re-export policy.** This barrel re-exports every
 * helper that the hook composes publicly (`canUseDOM`, `getOrCreateMeta`,
 * `removeMarkedElements`, etc.) plus the public `SEOProps` validators
 * (`isValidUrl`, `normalizeCanonical`, …). Helpers marked `@internal` in
 * their JSDoc — currently `escapeJsonForHtml` (file-private) and the two
 * JSON-LD primitives `serializeJsonLdContent` / `hashJsonLd` (used only by
 * `useSEO.ts` and the dom test suite) — are intentionally NOT re-exported
 * from this barrel and NOT re-exported from the package root
 * (`src/index.ts`). They have no semver guarantees and may change shape or
 * disappear between minor releases. Prefer the public hook surface.
 */

export {
  canUseDOM,
  resetCanUseDOMCache,
  createMeta,
  getOrCreateMeta,
  getOrCreateLink,
  removeMarkedElements,
  createJsonLdScript,
  ensureEssentialMeta,
  escapeSelectorValue,
  SEO_MARKER,
  type MetaKey,
} from './dom';

export {
  isValidUrl,
  normalizeCanonical,
  normalizeLanguageTag,
  isUrlField,
  inferImageMimeType,
} from './validation';

export { buildRobots, buildRobotsFromFlags, type RobotsResult } from './robots';

export {
  formatTitle,
  validateTitleLength,
  validateDescriptionLength,
  validateKeywordsCount,
  DEFAULT_TITLE_SEPARATOR,
  type TitleFormatOptions,
} from './title';

export { warn, logError, shouldEnableWarnings } from './warnings';
