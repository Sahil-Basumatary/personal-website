'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';

export type ConnectivityBannerPreview = 'offline' | 'reconnected';

interface ConnectivityBannerProps {
  /** Storybook / visual baselines — forces a banner state without toggling the network. */
  previewState?: ConnectivityBannerPreview;
}

export function ConnectivityBanner({ previewState }: ConnectivityBannerProps) {
  const live = useOnlineStatus();
  const online =
    previewState === 'offline'
      ? false
      : previewState === 'reconnected'
        ? true
        : live.online;
  const showReconnected =
    previewState === 'reconnected'
      ? true
      : previewState === 'offline'
        ? false
        : live.showReconnected;

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
          onClick={previewState ? undefined : live.dismissReconnected}
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
