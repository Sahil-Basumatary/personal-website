import { useEffect, useRef } from 'react';
import { KONAMI_SEQUENCE } from '@/lib/easter-eggs';
import { useEasterEggStore } from '@/stores/easter-egg-store';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKonamiCode() {
  const triggerOverlay = useEasterEggStore((s) => s.triggerOverlay);
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) {
        bufferRef.current = [];
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      bufferRef.current = [...bufferRef.current, key].slice(
        -KONAMI_SEQUENCE.length
      );
      const buffer = bufferRef.current;
      if (buffer.length !== KONAMI_SEQUENCE.length) return;
      const matches = buffer.every((k, i) => k === KONAMI_SEQUENCE[i]);
      if (matches) {
        bufferRef.current = [];
        triggerOverlay('sad-mac');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [triggerOverlay]);
}
