'use client';
import { createContext, useContext } from 'react';

interface WindowContextValue {
  isActive: boolean;
  isCollapsed: boolean;
  activate: () => void;
  collapse: () => void;
  expand: () => void;
}

const WindowContext = createContext<WindowContextValue | null>(null);

function useWindow() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('Window components must be used within Window');
  }
  return context;
}

export { WindowContext, useWindow };
export type { WindowContextValue };
