'use client';
import { useWindow } from './WindowContext';

interface ResizeHandleProps {
  onResizeStart?: (e: React.PointerEvent) => void;
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
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onResizeStart?.(e);
  };
  return (
    <div
      className={handleClasses}
      onPointerDown={handlePointerDown}
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize window"
    />
  );
}

export { ResizeHandle };
export type { ResizeHandleProps };
