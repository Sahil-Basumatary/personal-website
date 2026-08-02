/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';

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
  // Wait for an explicit SKIP_WAITING message so an open tab is not forced onto
  // a new deployment mid-session (chunk URL skew).
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        request.mode === 'navigate' && url.pathname === '/',
      handler: new NetworkFirst({
        cacheName: 'portfolio-shell',
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
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
