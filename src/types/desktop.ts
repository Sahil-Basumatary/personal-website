export type IconType = 'app' | 'folder' | 'file' | 'disk' | 'alias';

export interface DesktopIconData {
  id: string;
  label: string;
  iconType: IconType;
  component: string;
  windowTitle?: string;
  windowSize?: { width: number; height: number };
}

export type WallpaperType =
  | 'default'
  | 'solid-blue'
  | 'solid-grey'
  | 'pattern-stripes';
