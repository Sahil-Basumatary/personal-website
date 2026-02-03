'use client';
import { useWindow } from './WindowContext';

interface ResizeHandleProps {
  onResizeStart?: (e: React.MouseEvent) => void;
  className?: string;
}

function ResizeHandle({ onResizeStart, className }: ResizeHandleProps) {
  const { isActive, isCollapsed } = useWindow();
  if (isCollapsed) return null;
  const handleClasses = [
    'window-resize-handle',
    isActive ? 'active' : 'inactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart?.(e);
  };
  return (
    <div
      className={handleClasses}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize window"
    />
  );
}

export { ResizeHandle };
export type { ResizeHandleProps };
