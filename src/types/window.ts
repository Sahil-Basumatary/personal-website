import type { ContentRect } from '@/lib/content-rect';

export type { ContentRect };

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowZoomEffect {
  windowId: string;
  phase: 'open' | 'close';
  from: ContentRect;
  to: ContentRect;
}

export interface WindowState {
  id: string;
  title: string;
  icon?: string;
  component: string;
  props?: Record<string, unknown>;
  position: Position;
  size: Size;
  minSize: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  isCollapsed: boolean;
  isZoomingOpen?: boolean;
  isZoomingClose?: boolean;
  openOriginRect?: ContentRect;
  zIndex: number;
  previousBounds?: {
    position: Position;
    size: Size;
  };
}

export interface WindowConfig {
  title: string;
  icon?: string;
  component: string;
  props?: Record<string, unknown>;
  position?: Position;
  size?: Size;
  minSize?: Size;
  originRect?: ContentRect;
}

interface WindowManagerActions {
  openWindow: (config: WindowConfig) => string;
  closeWindow: (id: string) => void;
  requestCloseWindow: (id: string) => void;
  completeZoomEffect: () => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: Position) => void;
  resizeWindow: (id: string, size: Size) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  collapseWindow: (id: string) => void;
  expandWindow: (id: string) => void;
  cascadeWindows: () => void;
  tileWindows: () => void;
  reflowWindows: () => void;
}

export interface WindowManagerState extends WindowManagerActions {
  windows: Record<string, WindowState>;
  activeWindowId: string | null;
  nextZIndex: number;
  zoomEffect: WindowZoomEffect | null;
}
