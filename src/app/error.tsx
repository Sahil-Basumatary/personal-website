'use client';

import { RouteErrorRecovery } from '@/components/system/RouteErrorRecovery';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <RouteErrorRecovery error={error} reset={reset} scope="route-error" />;
}
