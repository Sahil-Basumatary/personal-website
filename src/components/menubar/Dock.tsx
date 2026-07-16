'use client';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore } from '@/stores/window-store';

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function Dock() {
  const minimizedWindows = useWindowStore(
    useShallow((s) => Object.values(s.windows).filter((w) => w.isMinimized))
  );
  const restoreWindow = useWindowStore((s) => s.restoreWindow);

  const handleRestore = useCallback(
    (id: string) => {
      restoreWindow(id);
    },
    [restoreWindow]
  );

  return (
    <div
      className="dock"
      role="toolbar"
      aria-label="Dock"
      data-help-anchor="dock"
    >
      <div className="dock-left">
        {minimizedWindows.map((win) => (
          <button
            key={win.id}
            className="dock-item"
            onClick={() => handleRestore(win.id)}
            title={win.title}
          >
            <span className="dock-item-label">{win.title}</span>
          </button>
        ))}
      </div>
      <div className="dock-right">
        <button className="dock-item dock-trash" title="Trash" disabled>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
