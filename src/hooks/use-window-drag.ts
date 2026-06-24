import { useCallback, useRef, useEffect } from 'react';
import { useWindowStore } from '@/stores/window-store';

interface DragState {
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  pointerType: string;
  moved: boolean;
}

export function useWindowDrag(windowId: string) {
  const dragRef = useRef<DragState | null>(null);
  const handlersRef = useRef<{
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
  } | null>(null);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const collapseWindow = useWindowStore((s) => s.collapseWindow);

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

  const focusAdjacentWindow = useCallback(
    (direction: 1 | -1) => {
      const state = useWindowStore.getState();
      const visible = Object.values(state.windows)
        .filter((win) => !win.isMinimized)
        .sort((a, b) => a.zIndex - b.zIndex);
      if (visible.length < 2) return;
      const activeIndex = visible.findIndex((win) => win.id === windowId);
      const index = activeIndex === -1 ? visible.length - 1 : activeIndex;
      const nextIndex = (index + direction + visible.length) % visible.length;
      state.focusWindow(visible[nextIndex].id);
    },
    [windowId]
  );

  const onTitleBarPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (e.detail >= 2) return;
      e.preventDefault();
      focusWindow(windowId);
      const win = useWindowStore.getState().windows[windowId];
      if (!win) return;
      dragRef.current = {
        offsetX: e.clientX - win.position.x,
        offsetY: e.clientY - win.position.y,
        startX: e.clientX,
        startY: e.clientY,
        pointerType: e.pointerType,
        moved: false,
      };
      const onPointerMove = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const deltaX = ev.clientX - drag.startX;
        const deltaY = ev.clientY - drag.startY;
        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
          drag.moved = true;
        }
        moveWindow(windowId, {
          x: ev.clientX - drag.offsetX,
          y: ev.clientY - drag.offsetY,
        });
      };
      const onPointerUp = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (drag && drag.pointerType !== 'mouse' && drag.moved) {
          const deltaX = ev.clientX - drag.startX;
          const deltaY = ev.clientY - drag.startY;
          if (deltaY > 72 && Math.abs(deltaY) > Math.abs(deltaX) * 1.4) {
            collapseWindow(windowId);
          } else if (Math.abs(deltaX) > 96 && Math.abs(deltaY) < 56) {
            focusAdjacentWindow(deltaX > 0 ? -1 : 1);
          }
        }
        cleanup();
        dragRef.current = null;
      };
      handlersRef.current = { onPointerMove, onPointerUp };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      document.body.style.touchAction = 'none';
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    },
    [
      windowId,
      focusWindow,
      moveWindow,
      collapseWindow,
      focusAdjacentWindow,
      cleanup,
    ]
  );

  return { onTitleBarPointerDown };
}
