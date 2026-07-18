// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { storyImageCspOrigin } from './story-image-csp';

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
