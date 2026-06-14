'use client';

import { useWindowStore } from '@/stores/window-store';

export function openUrl(url: string): string {
  return useWindowStore.getState().openWindow({
    title: 'Browser',
    component: 'browser',
    size: { width: 820, height: 600 },
    props: { initialUrl: url },
  });
}
