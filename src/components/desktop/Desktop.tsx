'use client';
import { useCallback } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { useWindowStore } from '@/stores/window-store';
import { ContextMenu } from '@/components/ui';
import { DesktopIcon } from './DesktopIcon';
import { DesktopWallpaper } from './DesktopWallpaper';
import type { DesktopIconData } from '@/types/desktop';
import { useBlogPostsFolderBootstrap } from '@/hooks/use-recent-posts';

export function Desktop() {
  useBlogPostsFolderBootstrap();
  const icons = useDesktopStore((s) => s.icons);
  const selectedIconIds = useDesktopStore((s) => s.selectedIconIds);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const clearSelection = useDesktopStore((s) => s.clearSelection);
  const wallpaper = useDesktopStore((s) => s.wallpaper);
  const openWindow = useWindowStore((s) => s.openWindow);

  const handleOpenIcon = useCallback(
    (icon: DesktopIconData) => {
      openWindow({
        title: icon.windowTitle ?? icon.label,
        component: icon.component,
        size: icon.windowSize,
        props: icon.windowProps,
      });
    },
    [openWindow]
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        clearSelection();
        useWindowStore.setState({ activeWindowId: null });
      }
    },
    [clearSelection]
  );

  return (
    <ContextMenu>
      <ContextMenu.Trigger className={`desktop wallpaper-${wallpaper}`}>
        {wallpaper === 'photo' && <DesktopWallpaper />}
        <div className="desktop-icons" onMouseDown={handleBackgroundClick}>
          {icons.map((icon) => (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              selected={selectedIconIds.includes(icon.id)}
              onSelect={selectIcon}
              onOpen={handleOpenIcon}
            />
          ))}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
          onSelect={() =>
            openWindow({ title: 'Untitled', component: 'notepad' })
          }
        >
          New Window
        </ContextMenu.Item>
        <ContextMenu.Divider />
        <ContextMenu.Item disabled>Clean Up</ContextMenu.Item>
        <ContextMenu.Item disabled>Sort by Name</ContextMenu.Item>
        <ContextMenu.Divider />
        <ContextMenu.Item disabled>Change Wallpaper</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}
