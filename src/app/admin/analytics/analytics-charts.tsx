'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CountBreakdown, TrafficPoint } from './queries';

export interface AnalyticsChartsProps {
  traffic: TrafficPoint[];
  popularApps: CountBreakdown[];
  devices: CountBreakdown[];
}

export function AnalyticsCharts({
  traffic,
  popularApps,
  devices,
}: AnalyticsChartsProps) {
  return (
    <div className="admin-analytics-grid">
      <section className="admin-chart-card admin-chart-card--wide">
        <div className="admin-chart-card__header">
          <p className="admin-kicker">Traffic</p>
          <h2>Visits and daily visitors</h2>
        </div>
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={traffic} margin={{ left: 0, right: 12 }}>
              <CartesianGrid stroke="#e4ddcf" vertical={false} />
              <XAxis
                dataKey="date"
                minTickGap={28}
                stroke="#938876"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#938876"
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={36}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="#8a6a2f"
                fill="#f0e7d4"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Daily visitors"
                stroke="#16130d"
                fill="#e4ddcf"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-chart-card">
        <div className="admin-chart-card__header">
          <p className="admin-kicker">Desktop</p>
          <h2>Popular apps</h2>
        </div>
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={popularApps}
              layout="vertical"
              margin={{ left: 24 }}
            >
              <CartesianGrid stroke="#e4ddcf" horizontal={false} />
              <XAxis
                allowDecimals={false}
                stroke="#938876"
                tick={{ fontSize: 12 }}
                tickLine={false}
                type="number"
              />
              <YAxis
                dataKey="label"
                stroke="#938876"
                tick={{ fontSize: 12 }}
                tickLine={false}
                type="category"
                width={92}
              />
              <Tooltip />
              <Bar dataKey="count" name="Launches" fill="#8a6a2f" radius={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="admin-chart-card">
        <div className="admin-chart-card__header">
          <p className="admin-kicker">Devices</p>
          <h2>Device mix</h2>
        </div>
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={devices} margin={{ left: 0, right: 12 }}>
              <CartesianGrid stroke="#e4ddcf" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#938876"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#938876"
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={36}
              />
              <Tooltip />
              <Bar dataKey="count" name="Views" fill="#16130d" radius={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
