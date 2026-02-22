/**
 * @fileoverview Utility exports for useSEO hook
 * @module use-seo/utils
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

export {
  buildRobots,
  buildRobotsFromFlags,
  type RobotsResult,
} from './robots';

export {
  formatTitle,
  validateTitleLength,
  validateDescriptionLength,
  validateKeywordsCount,
  DEFAULT_TITLE_SEPARATOR,
  type TitleFormatOptions,
} from './title';

export {
  warn,
  logError,
  shouldEnableWarnings,
} from './warnings';

