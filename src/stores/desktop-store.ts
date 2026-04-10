import { create } from 'zustand';
import type { DesktopIconData, WallpaperType } from '@/types/desktop';

interface DesktopState {
  icons: DesktopIconData[];
  selectedIconIds: string[];
  wallpaper: WallpaperType;
  selectIcon: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  setWallpaper: (wallpaper: WallpaperType) => void;
}

const DEFAULT_ICONS: DesktopIconData[] = [
  {
    id: 'system-drive',
    label: 'Macintosh HD',
    iconType: 'disk',
    component: 'file-explorer',
    windowTitle: 'Macintosh HD',
    windowSize: { width: 500, height: 380 },
  },
  {
    id: 'about-me',
    label: 'About Me',
    iconType: 'file',
    component: 'about',
    windowTitle: 'About Me',
    windowSize: { width: 420, height: 340 },
  },
  {
    id: 'projects',
    label: 'Projects',
    iconType: 'folder',
    component: 'projects',
    windowTitle: 'Projects',
    windowSize: { width: 480, height: 360 },
  },
  {
    id: 'skills',
    label: 'Skills.json',
    iconType: 'file',
    component: 'skills',
    windowTitle: 'Skills.json',
    windowSize: { width: 440, height: 380 },
  },
  {
    id: 'terminal',
    label: 'Terminal',
    iconType: 'app',
    component: 'terminal',
    windowTitle: 'Terminal',
    windowSize: { width: 580, height: 380 },
  },
  {
    id: 'contact',
    label: 'Contact',
    iconType: 'app',
    component: 'contact',
    windowTitle: 'Contact',
    windowSize: { width: 400, height: 340 },
  },
  {
    id: 'browser',
    label: 'Browser',
    iconType: 'app',
    component: 'browser',
    windowTitle: 'Browser',
    windowSize: { width: 640, height: 460 },
  },
];

export const useDesktopStore = create<DesktopState>()((set) => ({
  icons: DEFAULT_ICONS,
  selectedIconIds: [],
  wallpaper: 'default',
  selectIcon: (id, additive = false) =>
    set((state) => ({
      selectedIconIds: additive
        ? state.selectedIconIds.includes(id)
          ? state.selectedIconIds.filter((i) => i !== id)
          : [...state.selectedIconIds, id]
        : [id],
    })),
  clearSelection: () => set({ selectedIconIds: [] }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
}));
