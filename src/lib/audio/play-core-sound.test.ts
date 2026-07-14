/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { playCoreSound, resetAudioRuntimeForTests } from './play-core-sound';

describe('playCoreSound', () => {
  beforeEach(() => {
    resetAudioRuntimeForTests();
  });

  afterEach(() => {
    resetAudioRuntimeForTests();
    vi.restoreAllMocks();
  });

  it('synthesizes when no asset path is configured', async () => {
    const start = vi.fn();
    const stop = vi.fn();
    const resume = vi.fn(async () => {});
    class FakeAudioContext {
      currentTime = 0;
      state = 'running';
      destination = {};
      resume = resume;
      createOscillator() {
        return {
          type: 'sine',
          frequency: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start,
          stop,
        };
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        };
      }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext);
    await expect(playCoreSound('click')).resolves.toBe('synth');
    expect(start).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('skips when AudioContext is unavailable', async () => {
    vi.stubGlobal('AudioContext', undefined);
    const previous = (window as unknown as { webkitAudioContext?: unknown })
      .webkitAudioContext;
    Object.defineProperty(window, 'webkitAudioContext', {
      configurable: true,
      value: undefined,
    });
    await expect(playCoreSound('alert')).resolves.toBe('skipped');
    Object.defineProperty(window, 'webkitAudioContext', {
      configurable: true,
      value: previous,
    });
  });
});
