'use client';
import { createContext, useContext } from 'react';

interface WindowContextValue {
  isActive: boolean;
  isCollapsed: boolean;
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
  style?: React.CSSProperties;
  className?: string;
}

function WindowRoot({ children, style, className }: WindowProps) {
  const windowClasses = ['window', className].filter(Boolean).join(' ');
  return (
    <WindowContext.Provider value={{ isActive: true, isCollapsed: false }}>
      <div className={windowClasses} style={style}>
        {children}
      </div>
    </WindowContext.Provider>
  );
}

const Window = Object.assign(WindowRoot, {});

export { Window, useWindow };
export type { WindowProps };
