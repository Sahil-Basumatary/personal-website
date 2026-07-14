// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  AUDIO_STORAGE_KEY,
  CORE_SOUND_NAMES,
  DEFAULT_MUTED,
  FIXED_VOLUME,
  SOUND_ASSET_PATHS,
  isCoreSoundName,
  nextMuted,
  parseAudioPrefs,
  readAudioMuted,
  resolvePlaybackMode,
  serializeAudioPrefs,
  shouldPlaySound,
  writeAudioMuted,
} from './audio-state';

function memoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    store,
  };
}

describe('audio-state policy', () => {
  it('exposes the four core sounds and a muted default', () => {
    expect(CORE_SOUND_NAMES).toEqual([
      'click',
      'windowOpen',
      'windowClose',
      'alert',
    ]);
    expect(DEFAULT_MUTED).toBe(true);
    expect(FIXED_VOLUME).toBeGreaterThan(0);
    expect(FIXED_VOLUME).toBeLessThanOrEqual(1);
  });

  it('validates sound names', () => {
    expect(isCoreSoundName('click')).toBe(true);
    expect(isCoreSoundName('startup')).toBe(false);
  });

  it('gates playback on mute', () => {
    expect(shouldPlaySound(true)).toBe(false);
    expect(shouldPlaySound(false)).toBe(true);
    expect(nextMuted(true)).toBe(false);
    expect(nextMuted(false)).toBe(true);
  });

  it('prefers assets only when a path is configured', () => {
    expect(resolvePlaybackMode(null)).toBe('synth');
    expect(resolvePlaybackMode('/sounds/click.mp3')).toBe('asset');
    expect(SOUND_ASSET_PATHS.click).toBeNull();
    expect(SOUND_ASSET_PATHS.windowOpen).toBeNull();
    expect(SOUND_ASSET_PATHS.windowClose).toBeNull();
    expect(SOUND_ASSET_PATHS.alert).toBeNull();
  });
});

describe('audio prefs persistence', () => {
  it('round-trips mute preference', () => {
    const storage = memoryStorage();
    writeAudioMuted(storage, false);
    expect(storage.store[AUDIO_STORAGE_KEY]).toBe(serializeAudioPrefs(false));
    expect(readAudioMuted(storage)).toBe(false);
    writeAudioMuted(storage, true);
    expect(readAudioMuted(storage)).toBe(true);
  });

  it('defaults to muted when missing or corrupt', () => {
    expect(readAudioMuted(memoryStorage())).toBe(DEFAULT_MUTED);
    expect(parseAudioPrefs(null)).toBeNull();
    expect(parseAudioPrefs('{')).toBeNull();
    expect(parseAudioPrefs('[]')).toBeNull();
    expect(parseAudioPrefs('1')).toBeNull();
    expect(parseAudioPrefs('null')).toBeNull();
    expect(parseAudioPrefs('{"version":2,"isMuted":false}')).toBeNull();
    expect(parseAudioPrefs('{"version":1,"isMuted":"no"}')).toBeNull();
    expect(parseAudioPrefs('{"version":1,"isMuted":false}')).toEqual({
      version: 1,
      isMuted: false,
    });
  });
});
