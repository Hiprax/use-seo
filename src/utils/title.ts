/**
 * @fileoverview Title formatting utilities
 * @module use-seo/utils/title
 */

import {
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_KEYWORDS_COUNT,
} from '../constants';

/**
 * Options for title formatting.
 */
export interface TitleFormatOptions {
  /** Prefix to prepend (becomes "prefix | title") */
  prefix?: string;
  /** Suffix to append (becomes "title | suffix") */
  suffix?: string;
  /** Template with {title} or %s placeholder */
  template?: string;
  /** Separator between prefix/suffix and title */
  separator?: string;
}

/**
 * Default separator for title formatting.
 */
export const DEFAULT_TITLE_SEPARATOR = ' | ';

/**
 * Formats a page title with prefix, suffix, and/or template.
 *
 * Priority order:
 * 1. Template (if provided)
 * 2. Prefix and/or suffix
 * 3. Base title as-is
 *
 * @param baseTitle - The base page title
 * @param options - Formatting options
 * @returns The formatted title, or undefined if baseTitle is empty
 *
 * @example
 * ```typescript
 * // With template
 * formatTitle('Contact', { template: '%s - My Site' });
 * // Returns: 'Contact - My Site'
 *
 * // With suffix
 * formatTitle('Contact', { suffix: 'My Site' });
 * // Returns: 'Contact | My Site'
 *
 * // With prefix
 * formatTitle('Contact', { prefix: 'My Site' });
 * // Returns: 'My Site | Contact'
 *
 * // With both
 * formatTitle('Contact', { prefix: 'Prefix', suffix: 'Suffix' });
 * // Returns: 'Prefix | Contact | Suffix'
 * ```
 */
export function formatTitle(
  baseTitle?: string,
  options: TitleFormatOptions = {}
): string | undefined {
  if (!baseTitle || typeof baseTitle !== 'string') {
    return undefined;
  }

  const trimmedTitle = baseTitle.trim();
  if (!trimmedTitle) {
    return undefined;
  }

  const {
    template,
    prefix,
    suffix,
    separator = DEFAULT_TITLE_SEPARATOR,
  } = options;

  // Template takes priority
  if (template) {
    // Support {title} placeholder. Use split/join instead of `String.replace`
    // because `String.prototype.replace` interprets a STRING replacement's
    // `$&`, `$1`, `$<name>`, etc. as backreference patterns. A title that
    // literally contains those tokens (e.g. `'$&'`, `"$<x>"`) would be
    // mangled — `'Site - $&'` would substitute the entire match (the placeholder
    // string) back into the result. `split('{title}').join(trimmedTitle)`
    // performs a literal substitution with no special-character processing,
    // and as a bonus replaces ALL occurrences of `{title}` in the template
    // (matching the long-standing behavior of the `%s` branch).
    if (template.includes('{title}')) {
      return template.split('{title}').join(trimmedTitle);
    }
    // Support %s placeholder. Same rationale as above: split/join makes the
    // substitution literal so a title containing `$&`, `$'`, `` $` ``,
    // `$1`, or `$<name>` cannot trigger the replacement-pattern semantics
    // of `String.prototype.replace`.
    if (template.includes('%s')) {
      return template.split('%s').join(trimmedTitle);
    }
    // If no placeholder, append with separator (fallback behavior)
    return `${trimmedTitle}${separator}${template}`;
  }

  // Apply prefix and suffix
  let formatted = trimmedTitle;

  if (prefix && typeof prefix === 'string') {
    const trimmedPrefix = prefix.trim();
    if (trimmedPrefix) {
      formatted = `${trimmedPrefix}${separator}${formatted}`;
    }
  }

  if (suffix && typeof suffix === 'string') {
    const trimmedSuffix = suffix.trim();
    if (trimmedSuffix) {
      formatted = `${formatted}${separator}${trimmedSuffix}`;
    }
  }

  return formatted;
}

/**
 * Validates title length and returns warnings if needed.
 *
 * @param title - The title to validate
 * @returns Array of warning messages (empty if no warnings)
 *
 * @example
 * ```typescript
 * validateTitleLength('Short');
 * // Returns: ['Title is 5 characters. Consider 30-60 characters for optimal SEO.']
 *
 * validateTitleLength('A title that is between 30 and 60 characters long');
 * // Returns: []
 * ```
 */
export function validateTitleLength(title: string): string[] {
  const warnings: string[] = [];
  const length = title.length;

  if (length > MAX_TITLE_LENGTH) {
    warnings.push(
      `Title is ${length} characters. Aim for ${MAX_TITLE_LENGTH} or fewer for optimal display in search results.`
    );
  } else if (length < MIN_TITLE_LENGTH) {
    warnings.push(
      `Title is ${length} characters. Consider ${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} characters for better descriptiveness.`
    );
  }

  return warnings;
}

/**
 * Validates description length and returns warnings if needed.
 *
 * @param description - The description to validate
 * @returns Array of warning messages (empty if no warnings)
 *
 * @example
 * ```typescript
 * validateDescriptionLength('Short description');
 * // Returns: ['Description is 17 characters. Aim for 120-160 characters.']
 * ```
 */
export function validateDescriptionLength(description: string): string[] {
  const warnings: string[] = [];
  const length = description.length;

  if (length > MAX_DESCRIPTION_LENGTH) {
    warnings.push(
      `Description is ${length} characters. Aim for ${MAX_DESCRIPTION_LENGTH} or fewer to avoid truncation.`
    );
  } else if (length < MIN_DESCRIPTION_LENGTH) {
    warnings.push(
      `Description is ${length} characters. Consider ${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH} characters for better SEO.`
    );
  }

  return warnings;
}

/**
 * Validates keywords count and returns warnings if needed.
 *
 * @param keywords - Comma-separated keywords string
 * @returns Array of warning messages (empty if no warnings)
 *
 * @example
 * ```typescript
 * validateKeywordsCount('a,b,c,d,e,f,g,h,i,j,k,l');
 * // Returns: ['Too many keywords (12). Focus on 10 or fewer relevant keywords.']
 * ```
 */
export function validateKeywordsCount(keywords: string): string[] {
  const warnings: string[] = [];
  const keywordList = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  if (keywordList.length > MAX_KEYWORDS_COUNT) {
    warnings.push(
      `Too many keywords (${keywordList.length}). Focus on ${MAX_KEYWORDS_COUNT} or fewer relevant keywords.`
    );
  }

  return warnings;
}
