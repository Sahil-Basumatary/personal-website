'use client';
import { useCallback, useRef } from 'react';
import { useMenuBarContext } from './MenuBar';
import { useAudioStore } from '@/stores/audio-store';

export interface MenuItemData {
  type: 'item' | 'divider';
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  action?: () => void;
}

interface MenuBarMenuProps {
  id: string;
  label: string;
  items: MenuItemData[];
}

export function MenuBarMenu({ id, label, items }: MenuBarMenuProps) {
  const { activeMenuId, openMenu, closeMenu, isAnyOpen } = useMenuBarContext();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isOpen = activeMenuId === id;

  const handleClick = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu(id);
    }
  }, [isOpen, openMenu, closeMenu, id]);

  const handleMouseEnter = useCallback(() => {
    if (isAnyOpen && !isOpen) {
      openMenu(id);
    }
  }, [isAnyOpen, isOpen, openMenu, id]);

  const handleItemClick = useCallback(
    (item: MenuItemData) => {
      if (item.disabled) return;
      useAudioStore.getState().playSound('click');
      item.action?.();
      closeMenu();
    },
    [closeMenu]
  );

  return (
    <div className="menubar-menu" onMouseEnter={handleMouseEnter}>
      <button
        ref={triggerRef}
        className={`menubar-menu-trigger ${isOpen ? 'active' : ''}`}
        onPointerDown={handleClick}
        role="menuitem"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {label}
      </button>
      {isOpen && (
        <div className="menubar-dropdown" role="menu">
          {items.map((item, i) =>
            item.type === 'divider' ? (
              <div
                key={i}
                className="menubar-dropdown-divider"
                role="separator"
              />
            ) : (
              <button
                key={i}
                className={`menubar-dropdown-item ${item.disabled ? 'disabled' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                role="menuitem"
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="menubar-dropdown-shortcut">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
