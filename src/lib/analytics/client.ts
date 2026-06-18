type AnalyticsEvent =
  | {
      type: 'page_view';
      path: string;
      referrer?: string | null;
    }
  | {
      type: 'window_open';
      windowType: string;
    };

function sendAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = JSON.stringify(event);

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics', blob);
    return;
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function trackPageView(): void {
  sendAnalyticsEvent({
    type: 'page_view',
    path: window.location.pathname,
    referrer: document.referrer || null,
  });
}

export function trackWindowOpen(windowType: string): void {
  sendAnalyticsEvent({ type: 'window_open', windowType });
}
