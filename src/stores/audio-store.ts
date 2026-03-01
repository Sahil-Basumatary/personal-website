import { create } from 'zustand';

export type SoundName =
  | 'startup'
  | 'click'
  | 'alert'
  | 'windowOpen'
  | 'windowClose'
  | 'error'
  | 'trash';

interface AudioState {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playSound: (sound: SoundName) => void;
}

const SOUND_PATHS: Record<SoundName, string> = {
  startup: '/sounds/startup.mp3',
  click: '/sounds/click.mp3',
  alert: '/sounds/alert.mp3',
  windowOpen: '/sounds/window-open.mp3',
  windowClose: '/sounds/window-close.mp3',
  error: '/sounds/error.mp3',
  trash: '/sounds/trash.mp3',
};

const audioCache = new Map<string, HTMLAudioElement>();

function getCachedAudio(src: string): HTMLAudioElement {
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audioCache.set(src, audio);
  }
  return audio;
}

export const useAudioStore = create<AudioState>()((set, get) => ({
  isMuted: false,
  volume: 0.5,
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  playSound: (sound) => {
    const { isMuted, volume } = get();
    if (isMuted || typeof window === 'undefined') return;
    const src = SOUND_PATHS[sound];
    if (!src) return;
    try {
      const audio = getCachedAudio(src);
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      // gracefully handle missing audio files
    }
  },
}));
