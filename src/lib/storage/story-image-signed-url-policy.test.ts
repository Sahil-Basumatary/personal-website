// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { STORY_IMAGE_SIGNED_URL_TTL_SECONDS } from './story-image-limits';

describe('story image signed url policy', () => {
  it('keeps admin preview signatures short-lived', () => {
    expect(STORY_IMAGE_SIGNED_URL_TTL_SECONDS).toBe(15 * 60);
  });
});
