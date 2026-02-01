'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { TitleBar } from './TitleBar';

interface WindowContextValue {
  isActive: boolean;
  isCollapsed: boolean;
  activate: () => void;
  collapse: () => void;
  expand: () => void;
}

const WindowContext = createContext<WindowContextValue | null>(null);

function useWindow() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('Window components must be used within Window');
  }
  return context;
}

interface WindowProps {
  children: React.ReactNode;
  active?: boolean;
  defaultActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
}

function WindowRoot({
  children,
  active: controlledActive,
  defaultActive = true,
  onActiveChange,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  style,
  className,
}: WindowProps) {
  const [uncontrolledActive, setUncontrolledActive] = useState(defaultActive);
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);
  const isActiveControlled = controlledActive !== undefined;
  const isCollapsedControlled = controlledCollapsed !== undefined;
  const isActive = isActiveControlled ? controlledActive : uncontrolledActive;
  const isCollapsed = isCollapsedControlled
    ? controlledCollapsed
    : uncontrolledCollapsed;
  const activate = useCallback(() => {
    if (isActiveControlled) {
      onActiveChange?.(true);
    } else {
      setUncontrolledActive(true);
    }
  }, [isActiveControlled, onActiveChange]);
  const collapse = useCallback(() => {
    if (isCollapsedControlled) {
      onCollapsedChange?.(true);
    } else {
      setUncontrolledCollapsed(true);
    }
  }, [isCollapsedControlled, onCollapsedChange]);
  const expand = useCallback(() => {
    if (isCollapsedControlled) {
      onCollapsedChange?.(false);
    } else {
      setUncontrolledCollapsed(false);
    }
  }, [isCollapsedControlled, onCollapsedChange]);
  const windowClasses = ['window', isActive && 'active', className]
    .filter(Boolean)
    .join(' ');
  return (
    <WindowContext.Provider
      value={{ isActive, isCollapsed, activate, collapse, expand }}
    >
      <div className={windowClasses} style={style} onMouseDown={activate}>
        {children}
      </div>
    </WindowContext.Provider>
  );
}

const Window = Object.assign(WindowRoot, {
  TitleBar,
});

export { Window, useWindow };
export type { WindowProps, WindowContextValue };
