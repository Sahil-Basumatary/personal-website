'use client';

import { useEffect, useState } from 'react';
import { useWindowStore } from '@/stores/window-store';
import { WINDOW_ZOOM_DURATION_MS, type ContentRect } from '@/lib/content-rect';
import type { WindowZoomEffect } from '@/types/window';

function ZoomOutline({
  effect,
  onComplete,
}: {
  effect: WindowZoomEffect;
  onComplete: () => void;
}) {
  const [rect, setRect] = useState<ContentRect>(effect.from);

  useEffect(() => {
    let frameTwo = 0;
    const frameOne = requestAnimationFrame(() => {
      frameTwo = requestAnimationFrame(() => {
        setRect(effect.to);
      });
    });
    const timer = window.setTimeout(onComplete, WINDOW_ZOOM_DURATION_MS);
    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      window.clearTimeout(timer);
    };
  }, [effect, onComplete]);

  return (
    <div
      className={
        effect.phase === 'close'
          ? 'window-zoom-outline window-zoom-outline--close'
          : 'window-zoom-outline'
      }
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
      aria-hidden="true"
    />
  );
}

export function WindowZoomOverlay() {
  const zoomEffect = useWindowStore((s) => s.zoomEffect);
  const completeZoomEffect = useWindowStore((s) => s.completeZoomEffect);

  if (!zoomEffect) return null;

  return (
    <ZoomOutline
      key={`${zoomEffect.windowId}-${zoomEffect.phase}`}
      effect={zoomEffect}
      onComplete={completeZoomEffect}
    />
  );
}
