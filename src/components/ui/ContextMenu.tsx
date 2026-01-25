'use client';
import { createContext, useContext, useState, useCallback } from 'react';

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

const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
});

export { ContextMenu };
export type { ContextMenuProps, ContextMenuTriggerProps };
