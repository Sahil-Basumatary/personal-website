import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { requireAdmin } from '@/lib/auth/require-admin';

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
  await requireAdmin();
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
        select day as date, unique_visitors as visitors
        from analytics_daily_page_stats
        where day >= current_date - interval '29 days'
          and day < current_date
        union all
        select
          created_at::date as date,
          count(distinct visitor_hash)::int as visitors
        from page_views
        where created_at::date = current_date
        group by created_at::date
      ),
      visits as (
        select day as date, visits
        from analytics_daily_page_stats
        where day >= current_date - interval '29 days'
          and day < current_date
        union all
        select
          created_at::date as date,
          count(*)::int as visits
        from page_views
        where created_at::date = current_date
        group by created_at::date
      ),
      launches as (
        select day as date, sum(opens)::int as opens
        from analytics_daily_window_stats
        where day >= current_date - interval '29 days'
          and day < current_date
        group by day
        union all
        select
          created_at::date as date,
          count(*)::int as opens
        from window_opens
        where created_at::date = current_date
        group by created_at::date
      )
      select
        coalesce((select sum(visits)::int from visits where date >= current_date - interval '6 days'), 0) as visits_7d,
        coalesce((select sum(visitors)::int from daily_uniques where date >= current_date - interval '6 days'), 0) as daily_visitors_7d,
        coalesce((select sum(opens)::int from launches where date >= current_date - interval '6 days'), 0) as app_launches_7d,
        coalesce((select sum(visits)::int from visits), 0) as visits_30d,
        coalesce((select sum(visitors)::int from daily_uniques), 0) as daily_visitors_30d,
        coalesce((select sum(opens)::int from launches), 0) as app_launches_30d
    `),
    db.execute(sql`
      with days as (
        select generate_series(
          current_date - interval '29 days',
          current_date,
          interval '1 day'
        )::date as date
      ),
      rolled as (
        select day as date, visits, unique_visitors as visitors
        from analytics_daily_page_stats
        where day >= current_date - interval '29 days'
          and day < current_date
      ),
      today as (
        select
          created_at::date as date,
          count(*)::int as visits,
          count(distinct visitor_hash)::int as visitors
        from page_views
        where created_at::date = current_date
        group by created_at::date
      )
      select
        to_char(days.date, 'Mon DD') as date,
        coalesce(rolled.visits, today.visits, 0)::int as visits,
        coalesce(rolled.visitors, today.visitors, 0)::int as visitors
      from days
      left join rolled on rolled.date = days.date
      left join today on today.date = days.date
      order by days.date asc
    `),
    db.execute(sql`
      with rolled as (
        select window_type as label, sum(opens)::int as count
        from analytics_daily_window_stats
        where day >= current_date - interval '29 days'
          and day < current_date
        group by window_type
      ),
      today as (
        select window_type as label, count(*)::int as count
        from window_opens
        where created_at::date = current_date
        group by window_type
      )
      select
        coalesce(rolled.label, today.label) as label,
        (coalesce(rolled.count, 0) + coalesce(today.count, 0))::int as count
      from rolled
      full outer join today on today.label = rolled.label
      order by count desc, label asc
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
