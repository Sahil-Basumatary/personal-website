'use client';

import { useSyncExternalStore } from 'react';
import { readPortfolioCache } from '@/lib/content/portfolio-cache';

function subscribe() {
  return () => {};
}

function getSavedPortfolioSnapshot() {
  return Boolean(readPortfolioCache(window.localStorage));
}

function getServerSnapshot() {
  return false;
}

export function OfflineRetryControls() {
  const hasSavedPortfolio = useSyncExternalStore(
    subscribe,
    getSavedPortfolioSnapshot,
    getServerSnapshot
  );

  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      {hasSavedPortfolio ? (
        <p style={{ fontSize: 12, lineHeight: 1.4, margin: 0 }}>
          A saved portfolio is on this device. Retry to open it if a cached copy
          is available.
        </p>
      ) : null}
      <button
        type="button"
        className="offline-retry"
        onClick={() => {
          window.location.assign('/');
        }}
      >
        Retry
      </button>
    </div>
  );
}
