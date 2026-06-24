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
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: () => void;
  } | null>(null);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);

  const cleanup = useCallback(() => {
    if (!handlersRef.current) return;
    document.removeEventListener(
      'pointermove',
      handlersRef.current.onPointerMove
    );
    document.removeEventListener('pointerup', handlersRef.current.onPointerUp);
    document.removeEventListener(
      'pointercancel',
      handlersRef.current.onPointerUp
    );
    handlersRef.current = null;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    document.body.style.touchAction = '';
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
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
      const onPointerMove = (ev: PointerEvent) => {
        const state = resizeRef.current;
        if (!state) return;
        const deltaX = ev.clientX - state.startX;
        const deltaY = ev.clientY - state.startY;
        resizeWindow(windowId, {
          width: state.initialWidth + deltaX,
          height: state.initialHeight + deltaY,
        });
      };
      const onPointerUp = () => {
        resizeRef.current = null;
        cleanup();
      };
      handlersRef.current = { onPointerMove, onPointerUp };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'nwse-resize';
      document.body.style.touchAction = 'none';
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    },
    [windowId, focusWindow, resizeWindow, cleanup]
  );

  return { onResizeStart };
}
