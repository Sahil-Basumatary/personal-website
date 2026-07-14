// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { CORE_SOUND_NAMES } from './audio-state';
import { getSoundSpec, soundDurationMs } from './sound-specs';

describe('sound specs', () => {
  it('defines a positive-duration original for every core sound', () => {
    for (const name of CORE_SOUND_NAMES) {
      const spec = getSoundSpec(name);
      expect(spec.length).toBeGreaterThan(0);
      expect(soundDurationMs(name)).toBeGreaterThan(0);
      for (const tone of spec) {
        expect(tone.frequency).toBeGreaterThan(0);
        expect(tone.durationMs).toBeGreaterThan(0);
        expect(tone.gain).toBeGreaterThan(0);
        expect(tone.gain).toBeLessThanOrEqual(1);
      }
    }
  });
});
