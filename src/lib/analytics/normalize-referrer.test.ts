// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { normalizeReferrerOrigin } from './normalize-referrer';

describe('normalizeReferrerOrigin', () => {
  it('keeps only the origin from a full URL', () => {
    expect(
      normalizeReferrerOrigin(
        'https://www.google.com/search?q=sahil+bzy&email=a@b.com'
      )
    ).toBe('https://www.google.com');
  });

  it('returns null for empty, invalid, or non-http values', () => {
    expect(normalizeReferrerOrigin(null)).toBeNull();
    expect(normalizeReferrerOrigin('')).toBeNull();
    expect(normalizeReferrerOrigin('not a url')).toBeNull();
    expect(normalizeReferrerOrigin('javascript:alert(1)')).toBeNull();
  });
});
