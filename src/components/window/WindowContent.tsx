'use client';
import { useWindow } from './WindowContext';
import { ScrollArea } from '../ui/ScrollArea';

interface WindowContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function WindowContent({ children, className, style }: WindowContentProps) {
  const { isCollapsed } = useWindow();
  if (isCollapsed) return null;
  const contentClasses = ['window-content', className]
    .filter(Boolean)
    .join(' ');
  return (
    <ScrollArea className={contentClasses} style={style}>
      {children}
    </ScrollArea>
  );
}

export { WindowContent };
export type { WindowContentProps };
