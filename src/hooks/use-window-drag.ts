import { useCallback, useRef, useEffect } from 'react';
import { useWindowStore } from '@/stores/window-store';

interface DragState {
  offsetX: number;
  offsetY: number;
}

export function useWindowDrag(windowId: string) {
  const dragRef = useRef<DragState | null>(null);
  const handlersRef = useRef<{
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: () => void;
  } | null>(null);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);

  const cleanup = useCallback(() => {
    if (!handlersRef.current) return;
    document.removeEventListener('mousemove', handlersRef.current.onMouseMove);
    document.removeEventListener('mouseup', handlersRef.current.onMouseUp);
    handlersRef.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (e.detail >= 2) return;
      e.preventDefault();
      focusWindow(windowId);
      const win = useWindowStore.getState().windows[windowId];
      if (!win) return;
      dragRef.current = {
        offsetX: e.clientX - win.position.x,
        offsetY: e.clientY - win.position.y,
      };
      const onMouseMove = (ev: MouseEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        moveWindow(windowId, {
          x: ev.clientX - drag.offsetX,
          y: ev.clientY - drag.offsetY,
        });
      };
      const onMouseUp = () => {
        dragRef.current = null;
        cleanup();
      };
      handlersRef.current = { onMouseMove, onMouseUp };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [windowId, focusWindow, moveWindow, cleanup]
  );

  return { onTitleBarMouseDown };
}
