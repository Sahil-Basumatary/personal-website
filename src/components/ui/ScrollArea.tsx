'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

function ScrollArea({ children, className = '', style }: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });
  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setScrollState({
      scrollTop: viewport.scrollTop,
      scrollHeight: viewport.scrollHeight,
      clientHeight: viewport.clientHeight,
    });
  }, []);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [updateScrollState]);
  const trackHeight = scrollState.clientHeight - 32;
  const thumbHeight = Math.max(
    20,
    (scrollState.clientHeight / scrollState.scrollHeight) * trackHeight
  );
  const maxScroll = scrollState.scrollHeight - scrollState.clientHeight;
  const scrollRatio = maxScroll > 0 ? scrollState.scrollTop / maxScroll : 0;
  const thumbTop = scrollRatio * (trackHeight - thumbHeight);
  const scrollBy = (amount: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop += amount;
  };
  const hasOverflow = scrollState.scrollHeight > scrollState.clientHeight;
  const classes = ['scroll-area', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      <div
        ref={viewportRef}
        className="scroll-area-viewport"
        onScroll={updateScrollState}
        tabIndex={0}
        style={{ paddingRight: hasOverflow ? 16 : 0 }}
      >
        {children}
      </div>
      {hasOverflow && (
        <div className="scroll-area-scrollbar" data-orientation="vertical">
          <div
            className="scroll-area-arrow"
            data-direction="up"
            onClick={() => scrollBy(-40)}
          />
          <div className="scroll-area-track">
            <div
              className="scroll-area-thumb"
              style={{ top: thumbTop, height: thumbHeight }}
            />
          </div>
          <div
            className="scroll-area-arrow"
            data-direction="down"
            onClick={() => scrollBy(40)}
          />
        </div>
      )}
    </div>
  );
}

export { ScrollArea };
export type { ScrollAreaProps };
