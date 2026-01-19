'use client';
import { useRef } from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function ScrollArea({ children, className = '', style }: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const classes = ['scroll-area', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      <div
        ref={viewportRef}
        className="scroll-area-viewport"
        tabIndex={0}
        style={{ paddingRight: 16 }}
      >
        {children}
      </div>
      <div className="scroll-area-scrollbar" data-orientation="vertical">
        <div className="scroll-area-arrow" data-direction="up" />
        <div className="scroll-area-track">
          <div className="scroll-area-thumb" style={{ top: 0, height: 40 }} />
        </div>
        <div className="scroll-area-arrow" data-direction="down" />
      </div>
    </div>
  );
}

export { ScrollArea };
export type { ScrollAreaProps };
