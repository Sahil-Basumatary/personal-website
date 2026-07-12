'use client';

import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { SystemAlertDialog } from './SystemAlertDialog';

interface RouteErrorRecoveryProps {
  error: Error & { digest?: string };
  reset: () => void;
  scope?: 'route-error' | 'global-error';
}

export function RouteErrorRecovery({
  error,
  reset,
  scope = 'route-error',
}: RouteErrorRecoveryProps) {
  const reportedDigest = useRef<string | null>(null);

  useEffect(() => {
    const key = error.digest ?? error.message;
    if (reportedDigest.current === key) return;
    reportedDigest.current = key;
    Sentry.captureException(error, {
      tags: { scope },
      extra: { digest: error.digest },
    });
  }, [error, scope]);

  return (
    <SystemAlertDialog
      titleBar="Alert"
      title="An unexpected error occurred."
      description="This page could not be displayed. You can try again, or return to the desktop."
      iconVariant="error"
      titleId="route-error-title"
      descriptionId="route-error-description"
      code={error.digest}
      actions={
        <>
          <button type="button" className="btn primary" onClick={reset}>
            Try Again
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              window.location.assign('/');
            }}
          >
            Go to Desktop
          </button>
        </>
      }
    />
  );
}

export type { RouteErrorRecoveryProps };
