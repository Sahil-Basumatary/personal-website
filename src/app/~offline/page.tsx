import type { Metadata } from 'next';
import { OfflineRetryControls } from '@/components/desktop/OfflineRetryControls';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
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
            connection. Reconnect and try again.
          </p>
          <OfflineRetryControls />
        </div>
      </section>
    </main>
  );
}
