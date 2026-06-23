import { create } from 'zustand';
import type {
  WindowConfig,
  WindowManagerState,
  WindowState,
  Position,
  Size,
} from '@/types/window';
import { trackWindowOpen } from '@/lib/analytics/client';

const DEFAULT_SIZE: Size = { width: 400, height: 300 };
const DEFAULT_MIN_SIZE: Size = { width: 200, height: 100 };
const CASCADE_OFFSET = 30;
const MIN_VISIBLE_PX = 20;
const MENU_BAR_HEIGHT = 22;
const DOCK_HEIGHT = 28;
const MOBILE_BREAKPOINT = 768;
const MOBILE_GUTTER = 8;

function generateId(): string {
  return crypto.randomUUID();
}

function getViewport(): Size {
  if (typeof window === 'undefined') return { width: 1024, height: 768 };
  return {
    width: window.innerWidth,
    height: Math.max(240, window.innerHeight - MENU_BAR_HEIGHT - DOCK_HEIGHT),
  };
}

function getViewportGutter(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_GUTTER : 0;
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

function getAvailableSize(): Size {
  const vp = getViewport();
  const gutter = getViewportGutter();
  return {
    width: Math.max(240, vp.width - gutter * 2),
    height: Math.max(220, vp.height - gutter * 2),
  };
}

function fitMinSize(minSize: Size): Size {
  const available = getAvailableSize();
  return {
    width: Math.min(minSize.width, available.width),
    height: Math.min(minSize.height, available.height),
  };
}

function fitSize(size: Size, minSize: Size): Size {
  const available = getAvailableSize();
  const fittedMin = fitMinSize(minSize);
  return {
    width: Math.min(Math.max(size.width, fittedMin.width), available.width),
    height: Math.min(Math.max(size.height, fittedMin.height), available.height),
  };
}

function clampPosition(pos: Position, windowSize: Size): Position {
  const vp = getViewport();
  const gutter = getViewportGutter();
  return {
    x: Math.max(
      -(windowSize.width - MIN_VISIBLE_PX),
      Math.min(pos.x, vp.width - gutter - MIN_VISIBLE_PX)
    ),
    y: Math.max(gutter, Math.min(pos.y, vp.height - gutter - MIN_VISIBLE_PX)),
  };
}

function clampSize(size: Size, minSize: Size): Size {
  return fitSize(size, minSize);
}

function getInitialPosition(windowCount: number, size: Size): Position {
  if (!isMobileViewport()) {
    return clampPosition(
      {
        x: CASCADE_OFFSET * windowCount,
        y: CASCADE_OFFSET * windowCount,
      },
      size
    );
  }
  const vp = getViewport();
  const gutter = getViewportGutter();
  return clampPosition(
    {
      x: Math.max(gutter, Math.floor((vp.width - size.width) / 2)),
      y: gutter + (windowCount % 3) * 12,
    },
    size
  );
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
    const minSize = config.minSize ?? DEFAULT_MIN_SIZE;
    const size = fitSize(config.size ?? DEFAULT_SIZE, minSize);
    const windowCount = Object.keys(windows).length;
    const position =
      config.position !== undefined
        ? clampPosition(config.position, size)
        : getInitialPosition(windowCount, size);
    const newWindow: WindowState = {
      id,
      title: config.title,
      icon: config.icon,
      component: config.component,
      props: config.props,
      position,
      size,
      minSize,
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
    trackWindowOpen(config.component);
    return id;
  },

  closeWindow: (id: string) => {
    const { windows, activeWindowId } = get();
    if (!windows[id]) return;
    const remaining = { ...windows };
    delete remaining[id];
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

  moveWindow: (id: string, position: Position) => {
    const { windows } = get();
    const win = windows[id];
    if (!win) return;
    set({
      windows: {
        ...windows,
        [id]: { ...win, position: clampPosition(position, win.size) },
      },
    });
  },

  resizeWindow: (id: string, size: Size) => {
    const { windows } = get();
    const win = windows[id];
    if (!win) return;
    set({
      windows: {
        ...windows,
        [id]: { ...win, size: clampSize(size, win.minSize) },
      },
    });
  },

  minimizeWindow: (id: string) => {
    const { windows, activeWindowId } = get();
    const win = windows[id];
    if (!win || win.isMinimized) return;
    const updated: WindowState = {
      ...win,
      isMinimized: true,
      previousBounds: win.previousBounds ?? {
        position: win.position,
        size: win.size,
      },
    };
    const newWindows = { ...windows, [id]: updated };
    const newActiveId =
      activeWindowId === id ? findTopWindow(newWindows, id) : activeWindowId;
    set({ windows: newWindows, activeWindowId: newActiveId });
  },

  maximizeWindow: (id: string) => {
    const { windows, nextZIndex } = get();
    const win = windows[id];
    if (!win || win.isMaximized) return;
    const vp = getViewport();
    const gutter = getViewportGutter();
    const size = {
      width: Math.max(240, vp.width - gutter * 2),
      height: Math.max(220, vp.height - gutter * 2),
    };
    set({
      windows: {
        ...windows,
        [id]: {
          ...win,
          isMaximized: true,
          previousBounds: { position: win.position, size: win.size },
          position: { x: gutter, y: gutter },
          size,
          zIndex: nextZIndex,
        },
      },
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  restoreWindow: (id: string) => {
    const { windows, nextZIndex } = get();
    const win = windows[id];
    if (!win || (!win.isMinimized && !win.isMaximized)) return;
    const bounds = win.previousBounds ?? {
      position: win.position,
      size: win.size,
    };
    const restoredSize = clampSize(bounds.size, win.minSize);
    set({
      windows: {
        ...windows,
        [id]: {
          ...win,
          isMinimized: false,
          isMaximized: false,
          size: restoredSize,
          position: clampPosition(bounds.position, restoredSize),
          previousBounds: undefined,
          zIndex: nextZIndex,
        },
      },
      activeWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  collapseWindow: (id: string) => {
    const { windows } = get();
    const win = windows[id];
    if (!win || win.isCollapsed) return;
    set({
      windows: {
        ...windows,
        [id]: { ...win, isCollapsed: true },
      },
    });
  },

  expandWindow: (id: string) => {
    const { windows } = get();
    const win = windows[id];
    if (!win || !win.isCollapsed) return;
    set({
      windows: {
        ...windows,
        [id]: { ...win, isCollapsed: false },
      },
    });
  },

  cascadeWindows: () => {
    const { windows, nextZIndex } = get();
    const visible = Object.values(windows)
      .filter((w) => !w.isMinimized)
      .sort((a, b) => a.zIndex - b.zIndex);
    if (visible.length === 0) return;
    const updated = { ...windows };
    let z = nextZIndex;
    visible.forEach((win, i) => {
      updated[win.id] = {
        ...win,
        position: clampPosition(
          { x: CASCADE_OFFSET * i, y: CASCADE_OFFSET * i },
          win.size
        ),
        isMaximized: false,
        previousBounds: undefined,
        zIndex: z++,
      };
    });
    set({
      windows: updated,
      activeWindowId: visible[visible.length - 1].id,
      nextZIndex: z,
    });
  },

  tileWindows: () => {
    const { windows, nextZIndex } = get();
    const visible = Object.values(windows)
      .filter((w) => !w.isMinimized)
      .sort((a, b) => a.zIndex - b.zIndex);
    if (visible.length === 0) return;
    const vp = getViewport();
    const gutter = getViewportGutter();
    const availableWidth = vp.width - gutter * 2;
    const availableHeight = vp.height - gutter * 2;
    const cols = Math.ceil(Math.sqrt(visible.length));
    const rows = Math.ceil(visible.length / cols);
    const tileW = Math.floor(availableWidth / cols);
    const tileH = Math.floor(availableHeight / rows);
    const updated = { ...windows };
    let z = nextZIndex;
    visible.forEach((win, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      updated[win.id] = {
        ...win,
        position: { x: gutter + col * tileW, y: gutter + row * tileH },
        size: clampSize({ width: tileW, height: tileH }, win.minSize),
        isMaximized: false,
        previousBounds: undefined,
        zIndex: z++,
      };
    });
    set({
      windows: updated,
      activeWindowId: visible[visible.length - 1].id,
      nextZIndex: z,
    });
  },

  reflowWindows: () => {
    const { windows } = get();
    const updated = { ...windows };
    let changed = false;
    for (const win of Object.values(windows)) {
      if (win.isMinimized) continue;
      const size = win.isMaximized
        ? fitSize(getAvailableSize(), win.minSize)
        : clampSize(win.size, win.minSize);
      const position = win.isMaximized
        ? { x: getViewportGutter(), y: getViewportGutter() }
        : clampPosition(win.position, size);
      if (
        size.width !== win.size.width ||
        size.height !== win.size.height ||
        position.x !== win.position.x ||
        position.y !== win.position.y
      ) {
        updated[win.id] = { ...win, size, position };
        changed = true;
      }
    }
    if (changed) set({ windows: updated });
  },
}));
