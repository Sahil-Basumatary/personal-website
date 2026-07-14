// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getSoundSpec } from './sound-specs';
import { playSynthesizedSound, type SynthAudioContext } from './synthesize';

function createMockContext() {
  const state = { starts: 0, stops: 0 };
  const ctx: SynthAudioContext = {
    currentTime: 1,
    destination: {},
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
        },
        connect() {},
        start() {
          state.starts += 1;
        },
        stop() {
          state.stops += 1;
        },
      };
    },
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
        },
        connect() {},
      };
    },
  };
  return { ctx, state };
}

describe('synthesize', () => {
  it('schedules oscillators for sliding window tones', () => {
    const { ctx, state } = createMockContext();
    const end = playSynthesizedSound(ctx, 'windowOpen', 0.5);
    expect(end).toBeGreaterThan(ctx.currentTime);
    expect(state.starts).toBe(getSoundSpec('windowOpen').length);
    expect(state.stops).toBe(getSoundSpec('windowOpen').length);
  });

  it('schedules the alert double-beep and close fall', () => {
    const alertRun = createMockContext();
    playSynthesizedSound(alertRun.ctx, 'alert', 1);
    expect(alertRun.state.starts).toBe(2);
    const closeRun = createMockContext();
    playSynthesizedSound(closeRun.ctx, 'windowClose', 0.4);
    expect(closeRun.state.starts).toBe(getSoundSpec('windowClose').length);
    const clickRun = createMockContext();
    playSynthesizedSound(clickRun.ctx, 'click', 0);
    expect(clickRun.state.starts).toBe(1);
  });
});
