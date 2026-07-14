'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { SystemMenu } from './SystemMenu';
import { MenuBarMenu, type MenuItemData } from './MenuBarMenu';
import { MenuBarClock } from './MenuBarClock';
import { useWindowStore } from '@/stores/window-store';
import { useAudioStore } from '@/stores/audio-store';
import { openUntitledDocument } from '@/lib/window-titles';

interface MenuBarContextValue {
  activeMenuId: string | null;
  openMenu: (id: string) => void;
  closeMenu: () => void;
  isAnyOpen: boolean;
}

const MenuBarContext = createContext<MenuBarContextValue | null>(null);

export function useMenuBarContext() {
  const ctx = useContext(MenuBarContext);
  if (!ctx) throw new Error('useMenuBarContext must be used within MenuBar');
  return ctx;
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor">
      <path d="M0 3h3l4-3v11l-4-3H0V3z" />
      {!muted && (
        <>
          <path
            d="M9 2.5c.8.6 1.3 1.5 1.3 2.5s-.5 1.9-1.3 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M10.5 1c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </>
      )}
      {muted && (
        <path
          d="M9 3l4 5M13 3l-4 5"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      )}
    </svg>
  );
}

export function MenuBar() {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.requestCloseWindow);
  const cascadeWindows = useWindowStore((s) => s.cascadeWindows);
  const tileWindows = useWindowStore((s) => s.tileWindows);
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const windows = useWindowStore((s) => s.windows);
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const openMenu = useCallback((id: string) => setActiveMenuId(id), []);
  const closeMenu = useCallback(() => setActiveMenuId(null), []);

  useEffect(() => {
    if (!activeMenuId) return;
    const handleOutside = (e: PointerEvent) => {
      if (
        menuBarRef.current &&
        !menuBarRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [activeMenuId, closeMenu]);

  const fileItems: MenuItemData[] = [
    {
      type: 'item',
      label: 'New Window',
      shortcut: '⌘N',
      action: () =>
        openUntitledDocument(
          openWindow,
          Object.values(windows).map((win) => win.title)
        ),
    },
    { type: 'divider' },
    {
      type: 'item',
      label: 'Close Window',
      shortcut: '⌘W',
      disabled: !activeWindowId,
      action: () => {
        if (activeWindowId) closeWindow(activeWindowId);
      },
    },
  ];

  const editItems: MenuItemData[] = [
    { type: 'item', label: 'Undo', shortcut: '⌘Z', disabled: true },
    { type: 'divider' },
    { type: 'item', label: 'Cut', shortcut: '⌘X', disabled: true },
    { type: 'item', label: 'Copy', shortcut: '⌘C', disabled: true },
    { type: 'item', label: 'Paste', shortcut: '⌘V', disabled: true },
    { type: 'item', label: 'Clear', disabled: true },
    { type: 'divider' },
    { type: 'item', label: 'Select All', shortcut: '⌘A', disabled: true },
  ];

  const viewItems: MenuItemData[] = [
    { type: 'item', label: 'as Icons', disabled: true },
    { type: 'item', label: 'as List', disabled: true },
    { type: 'divider' },
    { type: 'item', label: 'Clean Up', disabled: true },
    { type: 'item', label: 'Sort by Name', disabled: true },
  ];

  const specialItems: MenuItemData[] = [
    { type: 'item', label: 'Cascade Windows', action: cascadeWindows },
    { type: 'item', label: 'Tile Windows', action: tileWindows },
  ];

  const contextValue: MenuBarContextValue = {
    activeMenuId,
    openMenu,
    closeMenu,
    isAnyOpen: activeMenuId !== null,
  };

  return (
    <MenuBarContext.Provider value={contextValue}>
      <div className="menubar" ref={menuBarRef} role="menubar">
        <div className="menubar-left">
          <SystemMenu />
          <MenuBarMenu id="file" label="File" items={fileItems} />
          <MenuBarMenu id="edit" label="Edit" items={editItems} />
          <MenuBarMenu id="view" label="View" items={viewItems} />
          <MenuBarMenu id="special" label="Special" items={specialItems} />
        </div>
        <div className="menubar-right">
          <button
            className="menubar-icon-btn"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <VolumeIcon muted={isMuted} />
          </button>
          <MenuBarClock />
        </div>
      </div>
    </MenuBarContext.Provider>
  );
}
