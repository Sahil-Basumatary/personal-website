import { create } from 'zustand';
import {
  HELP_CARDS,
  clampHelpStep,
  isLastHelpStep,
  nextHelpStep,
  prevHelpStep,
} from '@/lib/help/topics';

interface HelpState {
  isOpen: boolean;
  stepIndex: number;
  open: () => void;
  close: () => void;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
}

export const useHelpStore = create<HelpState>()((set, get) => ({
  isOpen: false,
  stepIndex: 0,
  open: () => set({ isOpen: true, stepIndex: 0 }),
  close: () => set({ isOpen: false }),
  next: () => {
    const { stepIndex } = get();
    if (isLastHelpStep(stepIndex)) {
      set({ isOpen: false });
      return;
    }
    set({ stepIndex: nextHelpStep(stepIndex) });
  },
  back: () => set({ stepIndex: prevHelpStep(get().stepIndex) }),
  goTo: (index) => set({ stepIndex: clampHelpStep(index, HELP_CARDS.length) }),
}));

export function openHelpCenter(): void {
  useHelpStore.getState().open();
}
