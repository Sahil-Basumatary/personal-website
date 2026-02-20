import { useCallback, useRef, useEffect } from 'react';
import { useWindowStore } from '@/stores/window-store';

interface ResizeState {
  startX: number;
  startY: number;
  initialWidth: number;
  initialHeight: number;
}

export function useWindowResize(windowId: string) {
  const resizeRef = useRef<ResizeState | null>(null);
  const handlersRef = useRef<{
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: () => void;
  } | null>(null);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);
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

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      focusWindow(windowId);
      const win = useWindowStore.getState().windows[windowId];
      if (!win || win.isMaximized || win.isCollapsed) return;
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initialWidth: win.size.width,
        initialHeight: win.size.height,
      };
      const onMouseMove = (ev: MouseEvent) => {
        const state = resizeRef.current;
        if (!state) return;
        const deltaX = ev.clientX - state.startX;
        const deltaY = ev.clientY - state.startY;
        resizeWindow(windowId, {
          width: state.initialWidth + deltaX,
          height: state.initialHeight + deltaY,
        });
      };
      const onMouseUp = () => {
        resizeRef.current = null;
        cleanup();
      };
      handlersRef.current = { onMouseMove, onMouseUp };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [windowId, focusWindow, resizeWindow, cleanup]
  );

  return { onResizeStart };
}
