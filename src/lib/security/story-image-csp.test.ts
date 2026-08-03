// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  storyImageCspOrigin,
  storyImageSignedCspOrigin,
} from './story-image-csp';

describe('storyImageCspOrigin', () => {
  it('returns the origin for a valid public base url', () => {
    expect(storyImageCspOrigin('https://media.sahilbzy.com')).toBe(
      'https://media.sahilbzy.com'
    );
    expect(storyImageCspOrigin('https://media.sahilbzy.com/path/')).toBe(
      'https://media.sahilbzy.com'
    );
  });

  it('rejects empty or invalid values', () => {
    expect(storyImageCspOrigin(undefined)).toBeNull();
    expect(storyImageCspOrigin('')).toBeNull();
    expect(storyImageCspOrigin('not-a-url')).toBeNull();
    expect(storyImageCspOrigin('ftp://media.example.com')).toBeNull();
  });
});

describe('storyImageSignedCspOrigin', () => {
  it('builds the r2 api origin from a hex account id', () => {
    expect(storyImageSignedCspOrigin('0123456789abcdef0123456789abcdef')).toBe(
      'https://0123456789abcdef0123456789abcdef.r2.cloudflarestorage.com'
    );
  });

  it('rejects empty or non-account ids', () => {
    expect(storyImageSignedCspOrigin(undefined)).toBeNull();
    expect(storyImageSignedCspOrigin('')).toBeNull();
    expect(storyImageSignedCspOrigin('not-hex')).toBeNull();
  });
});
