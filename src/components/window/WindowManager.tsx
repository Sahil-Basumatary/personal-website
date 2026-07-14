'use client';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore } from '@/stores/window-store';
import { ManagedWindow } from './ManagedWindow';
import { WindowZoomOverlay } from './WindowZoomOverlay';

interface WindowManagerProps {
  renderContent?: (
    windowId: string,
    component: string,
    props?: Record<string, unknown>
  ) => React.ReactNode;
}

function DefaultContent({ windowId }: { windowId: string }) {
  const component = useWindowStore((s) => s.windows[windowId]?.component);
  return (
    <div style={{ padding: 16 }}>
      <p>{component}</p>
    </div>
  );
}

function ResolvedContent({
  windowId,
  renderContent,
}: {
  windowId: string;
  renderContent: (
    windowId: string,
    component: string,
    props?: Record<string, unknown>
  ) => React.ReactNode;
}) {
  const component = useWindowStore((s) => s.windows[windowId]?.component);
  const props = useWindowStore((s) => s.windows[windowId]?.props);
  return <>{renderContent(windowId, component ?? '', props)}</>;
}

function WindowManager({ renderContent }: WindowManagerProps) {
  const windowIds = useWindowStore(useShallow((s) => Object.keys(s.windows)));
  const reflowWindows = useWindowStore((s) => s.reflowWindows);
  useEffect(() => {
    let frame = 0;
    const handleViewportChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(reflowWindows);
    };
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, [reflowWindows]);
  return (
    <div className="window-manager">
      {windowIds.map((id) => (
        <ManagedWindow key={id} windowId={id}>
          {renderContent ? (
            <ResolvedContent windowId={id} renderContent={renderContent} />
          ) : (
            <DefaultContent windowId={id} />
          )}
        </ManagedWindow>
      ))}
      <WindowZoomOverlay />
    </div>
  );
}

export { WindowManager };
export type { WindowManagerProps };
