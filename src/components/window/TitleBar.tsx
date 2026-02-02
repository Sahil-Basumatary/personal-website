'use client';
import { useWindow } from './Window';

interface TitleBarProps {
  children: React.ReactNode;
  className?: string;
}

function TitleBarRoot({ children, className }: TitleBarProps) {
  const { isActive } = useWindow();
  const titlebarClasses = [
    'window-titlebar',
    isActive ? 'active' : 'inactive',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <div className={titlebarClasses}>{children}</div>;
}

interface ControlsProps {
  children: React.ReactNode;
}

function Controls({ children }: ControlsProps) {
  return <div className="window-controls">{children}</div>;
}

interface CloseBoxProps {
  onClose?: () => void;
}

function CloseBox({ onClose }: CloseBoxProps) {
  const { isActive } = useWindow();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };
  return (
    <button
      type="button"
      className={`window-control-box window-close-box ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      aria-label="Close window"
    />
  );
}

interface ZoomBoxProps {
  onZoom?: () => void;
}

function ZoomBox({ onZoom }: ZoomBoxProps) {
  const { isActive } = useWindow();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onZoom?.();
  };
  return (
    <button
      type="button"
      className={`window-control-box window-zoom-box ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      aria-label="Zoom window"
    />
  );
}

function CollapseBox() {
  const { isActive, isCollapsed, collapse, expand } = useWindow();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCollapsed) {
      expand();
    } else {
      collapse();
    }
  };
  return (
    <button
      type="button"
      className={`window-control-box window-collapse-box ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      aria-label={isCollapsed ? 'Expand window' : 'Collapse window'}
    />
  );
}

interface TitleProps {
  children: React.ReactNode;
}

function Title({ children }: TitleProps) {
  const { isActive } = useWindow();
  return (
    <span className={`window-title ${isActive ? 'active' : ''}`}>
      {children}
    </span>
  );
}

const TitleBar = Object.assign(TitleBarRoot, {
  Controls,
  CloseBox,
  ZoomBox,
  CollapseBox,
  Title,
});

export { TitleBar };
export type {
  TitleBarProps,
  ControlsProps,
  CloseBoxProps,
  ZoomBoxProps,
  TitleProps,
};
