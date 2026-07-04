/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Authenticated/dynamic surfaces must never be cached or served from the SW.
// Registering this before Serwist's own fetch handler lets us hard-opt those
// paths out: stopImmediatePropagation prevents Serwist from responding, and
// since we never call respondWith, the browser handles them as if no SW exists.
const isExcluded = (url: URL) =>
  url.pathname.startsWith('/admin') || url.pathname.startsWith('/api');

self.addEventListener('fetch', (event) => {
  if (isExcluded(new URL(event.request.url))) {
    event.stopImmediatePropagation();
  }
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
