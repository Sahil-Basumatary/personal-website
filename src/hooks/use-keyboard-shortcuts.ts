import { useEffect } from 'react';
import { useWindowStore } from '@/stores/window-store';
import type { WindowState } from '@/types/window';

function getVisibleWindowsSorted(): WindowState[] {
  const { windows } = useWindowStore.getState();
  return Object.values(windows)
    .filter((w) => !w.isMinimized)
    .sort((a, b) => a.zIndex - b.zIndex);
}

function cycleNextWindow() {
  const { activeWindowId, focusWindow } = useWindowStore.getState();
  const visible = getVisibleWindowsSorted();
  if (visible.length <= 1) return;
  const currentIdx = visible.findIndex((w) => w.id === activeWindowId);
  const nextIdx = (currentIdx + 1) % visible.length;
  focusWindow(visible[nextIdx].id);
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const { activeWindowId, requestCloseWindow, minimizeWindow } =
        useWindowStore.getState();
      switch (e.key.toLowerCase()) {
        case 'w': {
          if (!activeWindowId) return;
          e.preventDefault();
          requestCloseWindow(activeWindowId);
          break;
        }
        case 'm': {
          if (!activeWindowId) return;
          e.preventDefault();
          minimizeWindow(activeWindowId);
          break;
        }
        case 'tab': {
          e.preventDefault();
          cycleNextWindow();
          break;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
