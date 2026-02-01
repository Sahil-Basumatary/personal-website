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
  Title,
});

export { TitleBar };
export type { TitleBarProps, TitleProps };
