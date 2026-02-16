import { create } from 'zustand';
import type {
  WindowConfig,
  WindowManagerState,
  WindowState,
  Position,
  Size,
} from '@/types/window';

const DEFAULT_SIZE: Size = { width: 400, height: 300 };
const DEFAULT_MIN_SIZE: Size = { width: 200, height: 100 };
const CASCADE_OFFSET = 30;
const MIN_VISIBLE_PX = 20;

function generateId(): string {
  return crypto.randomUUID();
}

function getViewport(): Size {
  if (typeof window === 'undefined') return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
}

function clampPosition(pos: Position, windowSize: Size): Position {
  const vp = getViewport();
  return {
    x: Math.max(
      -(windowSize.width - MIN_VISIBLE_PX),
      Math.min(pos.x, vp.width - MIN_VISIBLE_PX)
    ),
    y: Math.max(0, Math.min(pos.y, vp.height - MIN_VISIBLE_PX)),
  };
}

function findTopWindow(
  windows: Record<string, WindowState>,
  excludeId?: string
): string | null {
  let topId: string | null = null;
  let maxZ = -1;
  for (const win of Object.values(windows)) {
    if (win.id === excludeId || win.isMinimized) continue;
    if (win.zIndex > maxZ) {
      maxZ = win.zIndex;
      topId = win.id;
    }
  }
  return topId;
}

export const useWindowStore = create<WindowManagerState>()((set, get) => ({
  windows: {},
  activeWindowId: null,
  nextZIndex: 1,

  openWindow: (config: WindowConfig) => {
    const id = generateId();
    const { nextZIndex, windows } = get();
    const size = config.size ?? DEFAULT_SIZE;
    const windowCount = Object.keys(windows).length;
    const position =
      config.position ??
      clampPosition(
        {
          x: CASCADE_OFFSET * windowCount,
          y: CASCADE_OFFSET * windowCount,
        },
        size
      );
    const newWindow: WindowState = {
      id,
      title: config.title,
      icon: config.icon,
      component: config.component,
      position,
      size,
      minSize: config.minSize ?? DEFAULT_MIN_SIZE,
      isMinimized: false,
      isMaximized: false,
      isCollapsed: false,
      zIndex: nextZIndex,
    };
    set({
      windows: { ...windows, [id]: newWindow },
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
    return id;
  },

  closeWindow: (id: string) => {
    const { windows, activeWindowId } = get();
    if (!windows[id]) return;
    const { [id]: _closed, ...remaining } = windows;
    const newActiveId =
      activeWindowId === id ? findTopWindow(remaining) : activeWindowId;
    set({ windows: remaining, activeWindowId: newActiveId });
  },

  focusWindow: (id: string) => {
    const { windows, activeWindowId, nextZIndex } = get();
    const win = windows[id];
    if (!win || activeWindowId === id) return;
    set({
      windows: {
        ...windows,
        [id]: { ...win, zIndex: nextZIndex },
      },
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  // stubs — will implement in follow-up commits
  moveWindow: () => {},
  resizeWindow: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  restoreWindow: () => {},
  collapseWindow: () => {},
  expandWindow: () => {},
  cascadeWindows: () => {},
  tileWindows: () => {},
}));
