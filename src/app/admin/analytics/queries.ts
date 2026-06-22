import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/db';

export interface AnalyticsSummary {
  visits7d: number;
  dailyVisitors7d: number;
  appLaunches7d: number;
  visits30d: number;
  dailyVisitors30d: number;
  appLaunches30d: number;
}

export interface TrafficPoint {
  date: string;
  visits: number;
  visitors: number;
}

export interface CountBreakdown {
  label: string;
  count: number;
}

export interface AnalyticsOverview {
  summary: AnalyticsSummary;
  traffic: TrafficPoint[];
  popularApps: CountBreakdown[];
  devices: CountBreakdown[];
  countries: CountBreakdown[];
  referrers: CountBreakdown[];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return 0;
}

function toLabel(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [
    summaryRows,
    trafficRows,
    popularAppRows,
    deviceRows,
    countryRows,
    referrerRows,
  ] = await Promise.all([
    db.execute(sql`
      with daily_uniques as (
        select
          created_at::date as date,
          count(distinct visitor_hash)::int as visitors
        from page_views
        where created_at >= current_date - interval '29 days'
        group by created_at::date
      )
      select
        count(*) filter (where created_at >= current_date - interval '6 days')::int as visits_7d,
        coalesce((select sum(visitors)::int from daily_uniques where date >= current_date - interval '6 days'), 0) as daily_visitors_7d,
        (select count(*)::int from window_opens where created_at >= now() - interval '7 days') as app_launches_7d,
        count(*) filter (where created_at >= current_date - interval '29 days')::int as visits_30d,
        coalesce((select sum(visitors)::int from daily_uniques), 0) as daily_visitors_30d,
        (select count(*)::int from window_opens where created_at >= now() - interval '30 days') as app_launches_30d
      from page_views
    `),
    db.execute(sql`
      with days as (
        select generate_series(
          current_date - interval '29 days',
          current_date,
          interval '1 day'
        )::date as date
      )
      select
        to_char(days.date, 'Mon DD') as date,
        count(page_views.id)::int as visits,
        count(distinct page_views.visitor_hash)::int as visitors
      from days
      left join page_views
        on page_views.created_at::date = days.date
      group by days.date
      order by days.date asc
    `),
    db.execute(sql`
      select window_type as label, count(*)::int as count
      from window_opens
      where created_at >= now() - interval '30 days'
      group by window_type
      order by count desc, window_type asc
      limit 8
    `),
    db.execute(sql`
      select device as label, count(*)::int as count
      from page_views
      where created_at >= now() - interval '30 days'
      group by device
      order by count desc, device asc
    `),
    db.execute(sql`
      select coalesce(country, 'Unknown') as label, count(*)::int as count
      from page_views
      where created_at >= now() - interval '30 days'
      group by coalesce(country, 'Unknown')
      order by count desc, label asc
      limit 8
    `),
    db.execute(sql`
      select
        case
          when referrer is null or referrer = '' then 'Direct'
          else referrer
        end as label,
        count(*)::int as count
      from page_views
      where created_at >= now() - interval '30 days'
      group by
        case
          when referrer is null or referrer = '' then 'Direct'
          else referrer
        end
      order by count desc, label asc
      limit 8
    `),
  ]);

  const summary = summaryRows.rows.at(0) ?? {};

  return {
    summary: {
      visits7d: toNumber(summary.visits_7d),
      dailyVisitors7d: toNumber(summary.daily_visitors_7d),
      appLaunches7d: toNumber(summary.app_launches_7d),
      visits30d: toNumber(summary.visits_30d),
      dailyVisitors30d: toNumber(summary.daily_visitors_30d),
      appLaunches30d: toNumber(summary.app_launches_30d),
    },
    traffic: trafficRows.rows.map((row) => ({
      date: toLabel(row.date, ''),
      visits: toNumber(row.visits),
      visitors: toNumber(row.visitors),
    })),
    popularApps: popularAppRows.rows.map((row) => ({
      label: toLabel(row.label, 'Unknown app'),
      count: toNumber(row.count),
    })),
    devices: deviceRows.rows.map((row) => ({
      label: toLabel(row.label, 'Unknown'),
      count: toNumber(row.count),
    })),
    countries: countryRows.rows.map((row) => ({
      label: toLabel(row.label, 'Unknown'),
      count: toNumber(row.count),
    })),
    referrers: referrerRows.rows.map((row) => ({
      label: toLabel(row.label, 'Direct'),
      count: toNumber(row.count),
    })),
  };
}
