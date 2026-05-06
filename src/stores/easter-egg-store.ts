import { create } from 'zustand';
import type { EasterEggOverlay } from '@/lib/easter-eggs';

interface EasterEggState {
  activeOverlay: EasterEggOverlay | null;
  triggerOverlay: (overlay: EasterEggOverlay) => void;
  dismissOverlay: () => void;
}

export const useEasterEggStore = create<EasterEggState>()((set) => ({
  activeOverlay: null,
  triggerOverlay: (overlay) => set({ activeOverlay: overlay }),
  dismissOverlay: () => set({ activeOverlay: null }),
}));
