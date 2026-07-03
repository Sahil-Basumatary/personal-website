'use client';

import dynamic from 'next/dynamic';
import type { AnalyticsChartsProps } from './analytics-charts';

// recharts pulls in a heavy d3/victory-vendor tree. Loading it client-side only
// keeps it out of the analytics route's initial JS and off the server render
// (the charts need real DOM dimensions to lay out anyway).
const AnalyticsCharts = dynamic(
  () => import('./analytics-charts').then((mod) => mod.AnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="admin-analytics-grid" aria-busy="true" aria-hidden />
    ),
  }
);

export function AnalyticsChartsLazy(props: AnalyticsChartsProps) {
  return <AnalyticsCharts {...props} />;
}
