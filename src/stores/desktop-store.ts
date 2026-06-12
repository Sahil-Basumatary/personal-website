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
    component: 'text-editor',
    windowTitle: 'About Me',
    windowSize: { width: 500, height: 380 },
    windowProps: { filePath: '/Desktop/About Me' },
  },
  {
    id: 'projects',
    label: 'Projects',
    iconType: 'folder',
    component: 'file-explorer',
    windowTitle: 'Projects',
    windowSize: { width: 500, height: 380 },
    windowProps: { initialPath: '/Desktop/Projects' },
  },
  {
    id: 'skills',
    label: 'Skills.json',
    iconType: 'file',
    component: 'text-editor',
    windowTitle: 'Skills.json',
    windowSize: { width: 500, height: 400 },
    windowProps: { filePath: '/Desktop/Skills.json' },
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
    iconType: 'file',
    component: 'contact-form',
    windowTitle: 'Contact',
    windowSize: { width: 480, height: 480 },
  },
  {
    id: 'text-editor',
    label: 'Text Editor',
    iconType: 'app',
    component: 'text-editor',
    windowTitle: 'Text Editor',
    windowSize: { width: 560, height: 420 },
  },
  {
    id: 'code-playground',
    label: 'Code Playground',
    iconType: 'app',
    component: 'code-playground',
    windowTitle: 'Code Playground',
    windowSize: { width: 760, height: 480 },
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
