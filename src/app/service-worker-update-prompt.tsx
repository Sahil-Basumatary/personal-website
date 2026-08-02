'use client';

import { useEffect, useState } from 'react';
import { useSerwist } from '@serwist/turbopack/react';

export function ServiceWorkerUpdatePrompt() {
  const { serwist } = useSerwist();
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!serwist) {
      return;
    }

    const onWaiting = () => {
      setUpdateReady(true);
    };

    serwist.addEventListener('waiting', onWaiting);
    return () => {
      serwist.removeEventListener('waiting', onWaiting);
    };
  }, [serwist]);

  if (!updateReady) {
    return null;
  }

  return (
    <div
      className="connectivity-banner"
      role="status"
      aria-live="polite"
      data-state="update"
    >
      <p className="connectivity-banner__message">
        A newer version is ready. Reload to update this tab.
      </p>
      <button
        type="button"
        className="connectivity-banner__dismiss"
        onClick={() => {
          if (!serwist) {
            return;
          }
          serwist.addEventListener('controlling', () => {
            window.location.reload();
          });
          serwist.messageSkipWaiting();
        }}
      >
        Reload
      </button>
    </div>
  );
}
