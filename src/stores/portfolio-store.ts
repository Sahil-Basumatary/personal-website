import { create } from 'zustand';
import type { PortfolioContent } from '@/types/portfolio';

interface PortfolioState {
  content: PortfolioContent | null;
  setContent: (content: PortfolioContent) => void;
}

export const usePortfolioStore = create<PortfolioState>()((set) => ({
  content: null,
  setContent: (content) => set({ content }),
}));
