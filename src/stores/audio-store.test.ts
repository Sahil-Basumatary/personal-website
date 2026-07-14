/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAudioStore } from './audio-store';
import {
  AUDIO_STORAGE_KEY,
  serializeAudioPrefs,
} from '@/lib/audio/audio-state';

const playCoreSound = vi.hoisted(() => vi.fn(async () => 'synth' as const));

vi.mock('@/lib/audio/play-core-sound', () => ({
  playCoreSound,
}));

beforeEach(() => {
  playCoreSound.mockClear();
  useAudioStore.setState({ isMuted: true });
  window.localStorage.clear();
});

describe('audio-store', () => {
  it('starts muted and skips playback while muted', () => {
    expect(useAudioStore.getState().isMuted).toBe(true);
    useAudioStore.getState().playSound('click');
    expect(playCoreSound).not.toHaveBeenCalled();
  });

  it('persists unmute and plays the confirmation click', () => {
    useAudioStore.getState().toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(false);
    expect(window.localStorage.getItem(AUDIO_STORAGE_KEY)).toBe(
      serializeAudioPrefs(false)
    );
    expect(playCoreSound).toHaveBeenCalledWith('click', expect.any(Number));
  });

  it('plays core sounds when unmuted', () => {
    useAudioStore.setState({ isMuted: false });
    useAudioStore.getState().playSound('windowOpen');
    expect(playCoreSound).toHaveBeenCalledWith(
      'windowOpen',
      expect.any(Number)
    );
  });
});
