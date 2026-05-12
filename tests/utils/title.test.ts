/**
 * Tests for title utility functions
 */

import {
  formatTitle,
  validateTitleLength,
  validateDescriptionLength,
  validateKeywordsCount,
  DEFAULT_TITLE_SEPARATOR,
} from '../../src/utils/title';

describe('formatTitle', () => {
  it('returns undefined for empty input', () => {
    expect(formatTitle('')).toBeUndefined();
    expect(formatTitle(undefined)).toBeUndefined();
    expect(formatTitle('   ')).toBeUndefined();
  });

  it('returns base title when no options provided', () => {
    expect(formatTitle('My Title')).toBe('My Title');
  });

  it('applies template with {title} placeholder', () => {
    expect(formatTitle('Contact', { template: '{title} - My Site' })).toBe(
      'Contact - My Site'
    );
  });

  it('applies template with %s placeholder', () => {
    expect(formatTitle('Contact', { template: '%s | My Site' })).toBe(
      'Contact | My Site'
    );
  });

  it('replaces multiple %s placeholders', () => {
    expect(formatTitle('Test', { template: '%s - %s' })).toBe('Test - Test');
  });

  // Regression: `String.prototype.replace` with a STRING replacement
  // interprets `$&`, `$1`, `$<name>`, etc. as backreference patterns. A
  // page title that legitimately contains one of those tokens (commonly
  // seen with template-engine artefacts, money symbols followed by an
  // ampersand, or i18n placeholders) would be mangled. The split/join
  // implementation is required to be literal — these tests lock that in.
  it('treats `$&` in the title as a literal substring (no backreference expansion) for %s template', () => {
    expect(formatTitle('$&', { template: 'Site - %s' })).toBe('Site - $&');
  });

  it('treats `$&` in the title as a literal substring for {title} template', () => {
    expect(formatTitle('$&', { template: '{title} - Site' })).toBe('$& - Site');
  });

  it("treats other replacement patterns (`$1`, `$\\``, `$\\'`, `$<x>`) literally for %s template", () => {
    expect(formatTitle("$1 $` $' $<x>", { template: '%s | Brand' })).toBe(
      "$1 $` $' $<x> | Brand"
    );
  });

  it('treats other replacement patterns literally for {title} template', () => {
    expect(formatTitle("$1 $` $' $<x>", { template: '{title} | Brand' })).toBe(
      "$1 $` $' $<x> | Brand"
    );
  });

  it('replaces ALL occurrences of {title} in the template (matching %s multi-occurrence behavior)', () => {
    expect(formatTitle('Test', { template: '{title} - {title}' })).toBe(
      'Test - Test'
    );
  });

  it('appends template with separator when no placeholder', () => {
    expect(formatTitle('Page', { template: 'My Site' })).toBe(
      `Page${DEFAULT_TITLE_SEPARATOR}My Site`
    );
  });

  it('applies prefix', () => {
    expect(formatTitle('Contact', { prefix: 'MyBrand' })).toBe(
      'MyBrand | Contact'
    );
  });

  it('applies suffix', () => {
    expect(formatTitle('Contact', { suffix: 'MyBrand' })).toBe(
      'Contact | MyBrand'
    );
  });

  it('applies both prefix and suffix', () => {
    expect(formatTitle('Contact', { prefix: 'Prefix', suffix: 'Suffix' })).toBe(
      'Prefix | Contact | Suffix'
    );
  });

  it('uses custom separator', () => {
    expect(formatTitle('Contact', { suffix: 'Site', separator: ' - ' })).toBe(
      'Contact - Site'
    );
  });

  it('template takes priority over prefix/suffix', () => {
    expect(
      formatTitle('Contact', {
        template: '%s | Template',
        prefix: 'Prefix',
        suffix: 'Suffix',
      })
    ).toBe('Contact | Template');
  });

  it('trims whitespace from title', () => {
    expect(formatTitle('  My Title  ')).toBe('My Title');
  });

  it('handles empty prefix/suffix', () => {
    expect(formatTitle('Title', { prefix: '', suffix: '' })).toBe('Title');
    expect(formatTitle('Title', { prefix: '   ', suffix: '   ' })).toBe(
      'Title'
    );
  });

  it('handles non-string input gracefully', () => {
    expect(formatTitle(123 as unknown as string)).toBeUndefined();
    expect(formatTitle(null as unknown as string)).toBeUndefined();
  });
});

describe('validateTitleLength', () => {
  it('returns warning for title > 60 characters', () => {
    const longTitle = 'A'.repeat(65);
    const warnings = validateTitleLength(longTitle);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('65 characters');
  });

  it('returns warning for title < 30 characters', () => {
    const shortTitle = 'Short';
    const warnings = validateTitleLength(shortTitle);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('5 characters');
  });

  it('returns no warning for optimal length', () => {
    const optimalTitle = 'A'.repeat(45);
    const warnings = validateTitleLength(optimalTitle);
    expect(warnings.length).toBe(0);
  });

  it('returns no warning at exactly 30 characters (lower boundary)', () => {
    const warnings = validateTitleLength('A'.repeat(30));
    expect(warnings.length).toBe(0);
  });

  it('returns no warning at exactly 60 characters (upper boundary)', () => {
    const warnings = validateTitleLength('A'.repeat(60));
    expect(warnings.length).toBe(0);
  });

  it('returns warning at 29 characters (just below lower boundary)', () => {
    const warnings = validateTitleLength('A'.repeat(29));
    expect(warnings.length).toBe(1);
  });

  it('returns warning at 61 characters (just above upper boundary)', () => {
    const warnings = validateTitleLength('A'.repeat(61));
    expect(warnings.length).toBe(1);
  });
});

describe('validateDescriptionLength', () => {
  it('returns warning for description > 160 characters', () => {
    const longDesc = 'A'.repeat(170);
    const warnings = validateDescriptionLength(longDesc);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('170 characters');
  });

  it('returns warning for description < 120 characters', () => {
    const shortDesc = 'Short description';
    const warnings = validateDescriptionLength(shortDesc);
    expect(warnings.length).toBe(1);
  });

  it('returns no warning for optimal length', () => {
    const optimalDesc = 'A'.repeat(140);
    const warnings = validateDescriptionLength(optimalDesc);
    expect(warnings.length).toBe(0);
  });

  it('returns no warning at exactly 120 characters (lower boundary)', () => {
    const warnings = validateDescriptionLength('A'.repeat(120));
    expect(warnings.length).toBe(0);
  });

  it('returns no warning at exactly 160 characters (upper boundary)', () => {
    const warnings = validateDescriptionLength('A'.repeat(160));
    expect(warnings.length).toBe(0);
  });

  it('returns warning at 119 characters (just below lower boundary)', () => {
    const warnings = validateDescriptionLength('A'.repeat(119));
    expect(warnings.length).toBe(1);
  });

  it('returns warning at 161 characters (just above upper boundary)', () => {
    const warnings = validateDescriptionLength('A'.repeat(161));
    expect(warnings.length).toBe(1);
  });
});

describe('validateKeywordsCount', () => {
  it('returns warning for > 10 keywords', () => {
    const keywords = Array(15).fill('keyword').join(',');
    const warnings = validateKeywordsCount(keywords);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('15');
  });

  it('returns no warning for <= 10 keywords', () => {
    const keywords = 'a,b,c,d,e';
    const warnings = validateKeywordsCount(keywords);
    expect(warnings.length).toBe(0);
  });

  it('ignores empty keywords', () => {
    const keywords = 'a, , b, , c';
    const warnings = validateKeywordsCount(keywords);
    expect(warnings.length).toBe(0);
  });

  it('returns no warning at exactly 10 keywords (boundary)', () => {
    const keywords = Array(10).fill('kw').join(',');
    const warnings = validateKeywordsCount(keywords);
    expect(warnings.length).toBe(0);
  });

  it('returns warning at 11 keywords (just above boundary)', () => {
    const keywords = Array(11).fill('kw').join(',');
    const warnings = validateKeywordsCount(keywords);
    expect(warnings.length).toBe(1);
  });
});
