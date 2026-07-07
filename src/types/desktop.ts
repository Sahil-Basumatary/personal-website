export type IconType = 'app' | 'folder' | 'file' | 'disk' | 'alias';

export interface DesktopIconData {
  id: string;
  label: string;
  iconType: IconType;
  component: string;
  windowTitle?: string;
  windowSize?: { width: number; height: number };
  windowProps?: Record<string, unknown>;
}

export type WallpaperType =
  | 'photo'
  | 'default'
  | 'solid-blue'
  | 'solid-grey'
  | 'pattern-stripes';
