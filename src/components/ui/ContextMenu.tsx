'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

interface MenuPosition {
  x: number;
  y: number;
}

interface ContextMenuContextValue {
  isOpen: boolean;
  position: MenuPosition;
  open: (x: number, y: number) => void;
  close: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('ContextMenu components must be used within ContextMenu');
  }
  return context;
}

interface ContextMenuProps {
  children: React.ReactNode;
}

function ContextMenuRoot({ children }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const open = useCallback((x: number, y: number) => {
    setPosition({ x, y });
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  return (
    <ContextMenuContext.Provider value={{ isOpen, position, open, close }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

interface ContextMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

function ContextMenuTrigger({
  children,
  className = '',
}: ContextMenuTriggerProps) {
  const { open } = useContextMenu();
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      open(e.clientX, e.clientY);
    },
    [open]
  );
  return (
    <div onContextMenu={handleContextMenu} className={className}>
      {children}
    </div>
  );
}

interface ContextMenuContentProps {
  children: React.ReactNode;
}

function ContextMenuContent({ children }: ContextMenuContentProps) {
  const { isOpen, position, close } = useContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, close]);
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let x = position.x;
    let y = position.y;
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 8;
    }
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 8;
    }
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    const firstItem = menu.querySelector<HTMLElement>(
      '.context-menu-item:not(.disabled)'
    );
    firstItem?.focus();
  }, [isOpen, position]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const menu = menuRef.current;
    if (!menu) return;
    const items = Array.from(
      menu.querySelectorAll<HTMLElement>('.context-menu-item:not(.disabled)')
    );
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement
    );
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const focused = document.activeElement as HTMLElement;
      focused?.click();
    }
  }, []);
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: position.x, top: position.y }}
      role="menu"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>,
    document.body
  );
}

interface ContextMenuItemProps {
  children: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

function ContextMenuItem({
  children,
  disabled = false,
  onSelect,
}: ContextMenuItemProps) {
  const { close } = useContextMenu();
  const handleClick = useCallback(() => {
    if (disabled) return;
    onSelect?.();
    close();
  }, [disabled, onSelect, close]);
  const classes = ['context-menu-item', disabled && 'disabled']
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={classes}
      onClick={handleClick}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

function ContextMenuDivider() {
  return <div className="context-menu-divider" role="separator" />;
}

interface ContextMenuShortcutProps {
  children: React.ReactNode;
}

function ContextMenuShortcut({ children }: ContextMenuShortcutProps) {
  return <span className="context-menu-shortcut">{children}</span>;
}

const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Divider: ContextMenuDivider,
  Shortcut: ContextMenuShortcut,
});

export { ContextMenu };
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuShortcutProps,
};
