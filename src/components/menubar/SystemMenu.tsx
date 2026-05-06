'use client';
import { useCallback } from 'react';
import { useMenuBarContext } from './MenuBar';
import { useWindowStore } from '@/stores/window-store';

const SYSTEM_MENU_ID = 'system';

function SystemMenuIcon() {
  return (
    <div className="system-menu-icon" aria-hidden="true">
      <span style={{ background: '#ff2600' }} />
      <span style={{ background: '#ff9300' }} />
      <span style={{ background: '#fffb00' }} />
      <span style={{ background: '#00f900' }} />
      <span style={{ background: '#0096ff' }} />
      <span style={{ background: '#9437ff' }} />
    </div>
  );
}

export function SystemMenu() {
  const { activeMenuId, openMenu, closeMenu, isAnyOpen } = useMenuBarContext();
  const openWindow = useWindowStore((s) => s.openWindow);
  const isOpen = activeMenuId === SYSTEM_MENU_ID;

  const handleClick = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu(SYSTEM_MENU_ID);
    }
  }, [isOpen, openMenu, closeMenu]);

  const handleMouseEnter = useCallback(() => {
    if (isAnyOpen && !isOpen) {
      openMenu(SYSTEM_MENU_ID);
    }
  }, [isAnyOpen, isOpen, openMenu]);

  const handleItemClick = useCallback(
    (action: () => void) => {
      action();
      closeMenu();
    },
    [closeMenu]
  );

  return (
    <div
      className="menubar-menu system-menu-wrapper"
      onMouseEnter={handleMouseEnter}
    >
      <button
        className={`menubar-menu-trigger system-menu-trigger ${isOpen ? 'active' : ''}`}
        onMouseDown={handleClick}
        aria-label="System Menu"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <SystemMenuIcon />
      </button>
      {isOpen && (
        <div className="menubar-dropdown system-menu-dropdown" role="menu">
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'About This Computer',
                  component: 'about-computer',
                  size: { width: 380, height: 240 },
                })
              )
            }
            role="menuitem"
          >
            <span>About This Computer</span>
          </button>
          <div className="menubar-dropdown-divider" role="separator" />
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'Browser',
                  component: 'browser',
                  size: { width: 640, height: 460 },
                })
              )
            }
            role="menuitem"
          >
            <span>Browser</span>
          </button>
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'Code Playground',
                  component: 'code-playground',
                  size: { width: 760, height: 480 },
                })
              )
            }
            role="menuitem"
          >
            <span>Code Playground</span>
          </button>
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'Macintosh HD',
                  component: 'file-explorer',
                  size: { width: 500, height: 380 },
                })
              )
            }
            role="menuitem"
          >
            <span>Finder</span>
          </button>
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'Terminal',
                  component: 'terminal',
                  size: { width: 580, height: 380 },
                })
              )
            }
            role="menuitem"
          >
            <span>Terminal</span>
          </button>
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'Text Editor',
                  component: 'text-editor',
                  size: { width: 560, height: 420 },
                })
              )
            }
            role="menuitem"
          >
            <span>Text Editor</span>
          </button>
          <div className="menubar-dropdown-divider" role="separator" />
          <button
            className="menubar-dropdown-item"
            onClick={() =>
              handleItemClick(() =>
                openWindow({
                  title: 'Minesweeper',
                  component: 'minesweeper',
                  size: { width: 280, height: 380 },
                })
              )
            }
            role="menuitem"
          >
            <span>Minesweeper</span>
          </button>
          <div className="menubar-dropdown-divider" role="separator" />
          <button
            className="menubar-dropdown-item disabled"
            disabled
            role="menuitem"
          >
            <span>Control Panels</span>
          </button>
          <div className="menubar-dropdown-divider" role="separator" />
          <button
            className="menubar-dropdown-item disabled"
            disabled
            role="menuitem"
          >
            <span>Shut Down</span>
          </button>
        </div>
      )}
    </div>
  );
}
