'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';

export function ConnectivityBanner() {
  const { online, showReconnected, dismissReconnected } = useOnlineStatus();

  if (online && !showReconnected) {
    return null;
  }

  const message = online
    ? 'Back online.'
    : "You're offline. Showing the last saved portfolio.";

  return (
    <div
      className="connectivity-banner"
      role="status"
      aria-live="polite"
      data-state={online ? 'reconnected' : 'offline'}
    >
      <p className="connectivity-banner__message">{message}</p>
      {online ? (
        <button
          type="button"
          className="connectivity-banner__dismiss"
          onClick={dismissReconnected}
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
