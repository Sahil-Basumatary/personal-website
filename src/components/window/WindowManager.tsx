'use client';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore } from '@/stores/window-store';
import { ManagedWindow } from './ManagedWindow';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function WindowPlaceholder({ windowId }: { windowId: string }) {
  const component = useWindowStore((s) => s.windows[windowId]?.component);
  return (
    <div style={{ padding: 16 }}>
      <p>{component}</p>
    </div>
  );
}

function WindowManager() {
  const windowIds = useWindowStore(useShallow((s) => Object.keys(s.windows)));
  useKeyboardShortcuts();

  const handleDesktopMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      useWindowStore.setState({ activeWindowId: null });
    }
  }, []);

  return (
    <div className="window-manager" onMouseDown={handleDesktopMouseDown}>
      {windowIds.map((id) => (
        <ManagedWindow key={id} windowId={id}>
          <WindowPlaceholder windowId={id} />
        </ManagedWindow>
      ))}
    </div>
  );
}

export { WindowManager };
