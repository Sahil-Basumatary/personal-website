'use client';
import { useEffect } from 'react';
import { useEasterEggStore } from '@/stores/easter-egg-store';
import { MatrixRain } from './MatrixRain';
import { SadMac } from './SadMac';

export function EasterEggLayer() {
  const activeOverlay = useEasterEggStore((s) => s.activeOverlay);
  const dismissOverlay = useEasterEggStore((s) => s.dismissOverlay);

  useEffect(() => {
    if (!activeOverlay) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissOverlay();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [activeOverlay, dismissOverlay]);

  if (!activeOverlay) return null;
  if (activeOverlay === 'matrix')
    return <MatrixRain onDismiss={dismissOverlay} />;
  if (activeOverlay === 'sad-mac') return <SadMac onDismiss={dismissOverlay} />;
  return null;
}
