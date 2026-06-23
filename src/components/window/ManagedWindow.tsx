'use client';
import { useCallback } from 'react';
import { Window } from './Window';
import { useWindowStore } from '@/stores/window-store';
import { useWindowDrag } from '@/hooks/use-window-drag';
import { useWindowResize } from '@/hooks/use-window-resize';

interface ManagedWindowProps {
  windowId: string;
  children: React.ReactNode;
}

function ManagedWindow({ windowId, children }: ManagedWindowProps) {
  const win = useWindowStore((s) => s.windows[windowId]);
  const isActive = useWindowStore((s) => s.activeWindowId === windowId);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const maximizeWindow = useWindowStore((s) => s.maximizeWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const collapseWindow = useWindowStore((s) => s.collapseWindow);
  const expandWindow = useWindowStore((s) => s.expandWindow);
  const { onTitleBarPointerDown } = useWindowDrag(windowId);
  const { onResizeStart } = useWindowResize(windowId);

  const handleFocus = useCallback(() => {
    focusWindow(windowId);
  }, [windowId, focusWindow]);

  const handleClose = useCallback(() => {
    closeWindow(windowId);
  }, [windowId, closeWindow]);

  const handleZoom = useCallback(() => {
    if (win?.isMaximized) {
      restoreWindow(windowId);
    } else {
      maximizeWindow(windowId);
    }
  }, [windowId, win?.isMaximized, maximizeWindow, restoreWindow]);

  const handleCollapsedChange = useCallback(
    (collapsed: boolean) => {
      if (collapsed) {
        collapseWindow(windowId);
      } else {
        expandWindow(windowId);
      }
    },
    [windowId, collapseWindow, expandWindow]
  );

  if (!win) return null;

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: win.position.x,
    top: win.position.y,
    width: win.size.width,
    zIndex: win.zIndex,
    display: win.isMinimized ? 'none' : undefined,
  };
  if (!win.isCollapsed) {
    windowStyle.height = win.size.height;
  }

  return (
    <Window
      active={isActive}
      collapsed={win.isCollapsed}
      onActiveChange={handleFocus}
      onCollapsedChange={handleCollapsedChange}
      style={windowStyle}
      className={win.isMaximized ? 'maximized' : undefined}
    >
      <div onPointerDown={onTitleBarPointerDown}>
        <Window.TitleBar>
          <Window.TitleBar.Controls>
            <Window.TitleBar.CloseBox onClose={handleClose} />
            <Window.TitleBar.ZoomBox onZoom={handleZoom} />
            <Window.TitleBar.CollapseBox />
          </Window.TitleBar.Controls>
          <Window.TitleBar.Title>{win.title}</Window.TitleBar.Title>
        </Window.TitleBar>
      </div>
      <Window.Content>{children}</Window.Content>
      <Window.ResizeHandle onResizeStart={onResizeStart} />
    </Window>
  );
}

export { ManagedWindow };
export type { ManagedWindowProps };
