'use client';

import { useEffect } from 'react';

// The service worker only ships in production. Dev browsers that previously
// registered it would otherwise keep serving a stale precache, masking edits.
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        })
        .catch(() => {});
    }

    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {});
    }
  }, []);

  return null;
}
