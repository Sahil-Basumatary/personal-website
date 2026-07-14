import { create } from 'zustand';
import {
  DEFAULT_MUTED,
  FIXED_VOLUME,
  isCoreSoundName,
  nextMuted,
  readAudioMuted,
  shouldPlaySound,
  writeAudioMuted,
  type CoreSoundName,
} from '@/lib/audio/audio-state';
import { playCoreSound } from '@/lib/audio/play-core-sound';

export type SoundName = CoreSoundName;

interface AudioState {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (sound: SoundName) => void;
}

function readInitialMuted(): boolean {
  if (typeof window === 'undefined') return DEFAULT_MUTED;
  try {
    return readAudioMuted(window.localStorage);
  } catch {
    return DEFAULT_MUTED;
  }
}

function persistMuted(isMuted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    writeAudioMuted(window.localStorage, isMuted);
  } catch {
    // private mode / quota — preference stays in-memory only
  }
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  isMuted: readInitialMuted(),
  toggleMute: () => {
    const isMuted = nextMuted(get().isMuted);
    persistMuted(isMuted);
    set({ isMuted });
    if (shouldPlaySound(isMuted)) {
      void playCoreSound('click', FIXED_VOLUME);
    }
  },
  playSound: (sound) => {
    if (!isCoreSoundName(sound)) return;
    if (!shouldPlaySound(get().isMuted)) return;
    void playCoreSound(sound, FIXED_VOLUME);
  },
}));
