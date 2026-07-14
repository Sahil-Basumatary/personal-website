import type { CoreSoundName } from './audio-state';
import { getSoundSpec, type ToneSegment } from './sound-specs';

export interface SynthAudioContext {
  currentTime: number;
  createOscillator(): {
    type: string;
    frequency: {
      setValueAtTime(value: number, time: number): void;
      linearRampToValueAtTime(value: number, time: number): void;
    };
    connect(node: unknown): void;
    start(when?: number): void;
    stop(when?: number): void;
  };
  createGain(): {
    gain: {
      setValueAtTime(value: number, time: number): void;
      linearRampToValueAtTime(value: number, time: number): void;
    };
    connect(node: unknown): void;
  };
  destination: unknown;
}

function scheduleTone(
  ctx: SynthAudioContext,
  tone: ToneSegment,
  startAt: number,
  volume: number
): number {
  const durationSec = tone.durationMs / 1000;
  const endAt = startAt + durationSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tone.type;
  osc.frequency.setValueAtTime(tone.frequency, startAt);
  if (tone.slideTo !== undefined) {
    osc.frequency.linearRampToValueAtTime(tone.slideTo, endAt);
  }
  const peak = Math.max(0, Math.min(1, tone.gain * volume));
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.linearRampToValueAtTime(
    peak,
    startAt + Math.min(0.008, durationSec / 3)
  );
  gain.gain.linearRampToValueAtTime(0.0001, endAt);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(endAt + 0.01);
  return endAt;
}

export function playSynthesizedSound(
  ctx: SynthAudioContext,
  name: CoreSoundName,
  volume: number
): number {
  let cursor = ctx.currentTime;
  for (const tone of getSoundSpec(name)) {
    cursor = scheduleTone(ctx, tone, cursor, volume);
  }
  return cursor;
}
