'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { buildSystemDrive } from '@/lib/content/build-system-drive';
import { readPortfolioCache } from '@/lib/content/portfolio-cache';
import type { PortfolioContent } from '@/types/portfolio';
import { HomeClient } from '@/app/home-client';

function subscribe() {
  return () => {};
}

function readCachedContent(): PortfolioContent | null {
  try {
    return readPortfolioCache(window.localStorage)?.content ?? null;
  } catch {
    return null;
  }
}

function getServerSnapshot(): PortfolioContent | null {
  return null;
}

export function OfflineExperience() {
  const cachedContent = useSyncExternalStore(
    subscribe,
    readCachedContent,
    getServerSnapshot
  );
  const [openedSaved, setOpenedSaved] = useState(false);

  const root = useMemo(
    () => (cachedContent ? buildSystemDrive(cachedContent) : null),
    [cachedContent]
  );

  if (openedSaved && cachedContent && root) {
    return <HomeClient root={root} content={cachedContent} />;
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: '#4a6889',
        padding: 24,
      }}
    >
      <section
        role="alertdialog"
        aria-labelledby="offline-title"
        aria-describedby="offline-copy"
        style={{
          width: 'min(420px, 100%)',
          background: '#cccccc',
          border: '2px solid #000000',
          boxShadow: '1px 1px 0 #000, 2px 2px 4px rgba(0, 0, 0, 0.3)',
          fontFamily: "'Charcoal', 'Geneva', sans-serif",
          color: '#000000',
        }}
      >
        <div
          style={{
            background:
              'repeating-linear-gradient(0deg, #000 0 1px, #cccccc 1px 3px)',
            borderBottom: '2px solid #000',
            padding: '4px 8px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              background: '#cccccc',
              padding: '0 8px',
              fontFamily: "'ChicagoFLF', 'Chicago', sans-serif",
            }}
          >
            Connection
          </span>
        </div>
        <div
          style={{ padding: 20, display: 'grid', gap: 12, textAlign: 'center' }}
        >
          <p style={{ fontSize: 40, margin: 0 }} aria-hidden>
            !
          </p>
          <h1
            id="offline-title"
            style={{
              fontFamily: "'ChicagoFLF', 'Chicago', sans-serif",
              fontSize: 16,
              margin: 0,
            }}
          >
            You are offline
          </h1>
          <p
            id="offline-copy"
            style={{ fontSize: 13, lineHeight: 1.4, margin: 0 }}
          >
            This page could not be loaded because there is no network
            connection.
          </p>
          {cachedContent ? (
            <p style={{ fontSize: 12, lineHeight: 1.4, margin: 0 }}>
              A saved portfolio is on this device and can be opened offline.
            </p>
          ) : null}
          <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
            {cachedContent ? (
              <button
                type="button"
                className="offline-retry"
                onClick={() => setOpenedSaved(true)}
              >
                Open saved portfolio
              </button>
            ) : null}
            <button
              type="button"
              className="offline-retry"
              onClick={() => {
                window.location.assign('/');
              }}
            >
              Retry connection
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
