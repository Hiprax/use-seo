/**
 * Tests for constants
 */

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
} from '../src/constants';

describe('Constants', () => {
  it('exports DEFAULT_OG_TYPE', () => {
    expect(DEFAULT_OG_TYPE).toBe('website');
  });

  it('exports DEFAULT_TWITTER_CARD', () => {
    expect(DEFAULT_TWITTER_CARD).toBe('summary_large_image');
  });

  it('exports DEFAULT_AUTO_CANONICAL', () => {
    expect(DEFAULT_AUTO_CANONICAL).toBe(true);
  });

  it('exports DEFAULT_PREVENT_DUPLICATES', () => {
    expect(DEFAULT_PREVENT_DUPLICATES).toBe(true);
  });

  it('exports DEFAULT_VALIDATE_URLS', () => {
    expect(DEFAULT_VALIDATE_URLS).toBe(true);
  });

  it('exports title length constants', () => {
    expect(MIN_TITLE_LENGTH).toBe(30);
    expect(MAX_TITLE_LENGTH).toBe(60);
  });

  it('exports description length constants', () => {
    expect(MIN_DESCRIPTION_LENGTH).toBe(120);
    expect(MAX_DESCRIPTION_LENGTH).toBe(160);
  });

  it('exports MAX_KEYWORDS_COUNT', () => {
    expect(MAX_KEYWORDS_COUNT).toBe(10);
  });
});

