'use client';

import { RouteErrorRecovery } from '@/components/system/RouteErrorRecovery';
import '@/app/globals.css';

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body>
        <RouteErrorRecovery error={error} reset={reset} scope="global-error" />
      </body>
    </html>
  );
}
