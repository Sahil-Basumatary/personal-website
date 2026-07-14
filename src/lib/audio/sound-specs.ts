import type { CoreSoundName } from './audio-state';

export type SynthWave = 'sine' | 'square' | 'triangle';

export interface ToneSegment {
  frequency: number;
  durationMs: number;
  type: SynthWave;
  gain: number;
  slideTo?: number;
}

const SPECS: Record<CoreSoundName, readonly ToneSegment[]> = {
  click: [{ frequency: 920, durationMs: 28, type: 'triangle', gain: 0.22 }],
  windowOpen: [
    { frequency: 440, durationMs: 55, type: 'sine', gain: 0.18, slideTo: 660 },
    { frequency: 660, durationMs: 40, type: 'sine', gain: 0.12 },
  ],
  windowClose: [
    { frequency: 660, durationMs: 55, type: 'sine', gain: 0.18, slideTo: 420 },
    { frequency: 420, durationMs: 35, type: 'sine', gain: 0.1 },
  ],
  alert: [
    { frequency: 880, durationMs: 90, type: 'square', gain: 0.14 },
    { frequency: 880, durationMs: 70, type: 'square', gain: 0.1 },
  ],
};

export function getSoundSpec(name: CoreSoundName): readonly ToneSegment[] {
  return SPECS[name];
}

export function soundDurationMs(name: CoreSoundName): number {
  return getSoundSpec(name).reduce((total, tone) => total + tone.durationMs, 0);
}
