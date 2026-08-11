import { lt, sql } from 'drizzle-orm';
import type { Database } from '../db';
import {
  analyticsDailyPageStats,
  analyticsDailyWindowStats,
  contactSubmissions,
  pageViews,
  windowOpens,
} from '../db/schema';
import {
  ANALYTICS_RETENTION_DAYS,
  ANALYTICS_ROLLUP_RETENTION_DAYS,
  CONTACT_RETENTION_DAYS,
  retentionCutoff,
  retentionDayCutoff,
  toUtcDateOnly,
} from './data-retention-policy';

export {
  ANALYTICS_RETENTION_DAYS,
  ANALYTICS_ROLLUP_RETENTION_DAYS,
  CONTACT_RETENTION_DAYS,
  retentionCutoff,
  retentionDayCutoff,
  toUtcDateOnly,
} from './data-retention-policy';

export interface RetentionPurgeResult {
  pageViewsDeleted: number;
  windowOpensDeleted: number;
  contactSubmissionsDeleted: number;
  pageStatDaysRolledUp: number;
  windowStatRowsRolledUp: number;
  pageStatDaysPurged: number;
  windowStatRowsPurged: number;
  analyticsCutoff: string;
  contactCutoff: string;
  rollupCutoff: string;
}

export async function rollupAnalyticsStats(
  database: Database,
  now: Date = new Date()
): Promise<{ pageStatDays: number; windowStatRows: number }> {
  const pageResult = await database.execute<{ day: string }>(sql`
    insert into analytics_daily_page_stats (day, visits, unique_visitors, updated_at)
    select
      created_at::date as day,
      count(*)::int as visits,
      count(distinct visitor_hash)::int as unique_visitors,
      ${now}::timestamptz as updated_at
    from page_views
    where created_at < date_trunc('day', ${now}::timestamptz)
    group by created_at::date
    on conflict (day) do update set
      visits = excluded.visits,
      unique_visitors = excluded.unique_visitors,
      updated_at = excluded.updated_at
    returning day
  `);
  const windowResult = await database.execute<{ day: string }>(sql`
    insert into analytics_daily_window_stats (day, window_type, opens, updated_at)
    select
      created_at::date as day,
      window_type,
      count(*)::int as opens,
      ${now}::timestamptz as updated_at
    from window_opens
    where created_at < date_trunc('day', ${now}::timestamptz)
    group by created_at::date, window_type
    on conflict (day, window_type) do update set
      opens = excluded.opens,
      updated_at = excluded.updated_at
    returning day
  `);

  const pageRows = 'rows' in pageResult ? pageResult.rows : pageResult;
  const windowRows = 'rows' in windowResult ? windowResult.rows : windowResult;

  return {
    pageStatDays: Array.isArray(pageRows) ? pageRows.length : 0,
    windowStatRows: Array.isArray(windowRows) ? windowRows.length : 0,
  };
}

export async function purgeExpiredPortfolioData(
  database: Database,
  now: Date = new Date()
): Promise<RetentionPurgeResult> {
  const analyticsCutoff = retentionDayCutoff(ANALYTICS_RETENTION_DAYS, now);
  const contactCutoff = retentionCutoff(CONTACT_RETENTION_DAYS, now);
  const rollupCutoff = retentionCutoff(ANALYTICS_ROLLUP_RETENTION_DAYS, now);

  const rolledUp = await rollupAnalyticsStats(database, now);

  const [
    deletedPageViews,
    deletedWindowOpens,
    deletedContacts,
    deletedPageStats,
    deletedWindowStats,
  ] = await Promise.all([
    database
      .delete(pageViews)
      .where(lt(pageViews.createdAt, analyticsCutoff))
      .returning({ id: pageViews.id }),
    database
      .delete(windowOpens)
      .where(lt(windowOpens.createdAt, analyticsCutoff))
      .returning({ id: windowOpens.id }),
    database
      .delete(contactSubmissions)
      .where(lt(contactSubmissions.createdAt, contactCutoff))
      .returning({ id: contactSubmissions.id }),
    database
      .delete(analyticsDailyPageStats)
      .where(lt(analyticsDailyPageStats.day, toUtcDateOnly(rollupCutoff)))
      .returning({ day: analyticsDailyPageStats.day }),
    database
      .delete(analyticsDailyWindowStats)
      .where(lt(analyticsDailyWindowStats.day, toUtcDateOnly(rollupCutoff)))
      .returning({ day: analyticsDailyWindowStats.day }),
  ]);

  return {
    pageViewsDeleted: deletedPageViews.length,
    windowOpensDeleted: deletedWindowOpens.length,
    contactSubmissionsDeleted: deletedContacts.length,
    pageStatDaysRolledUp: rolledUp.pageStatDays,
    windowStatRowsRolledUp: rolledUp.windowStatRows,
    pageStatDaysPurged: deletedPageStats.length,
    windowStatRowsPurged: deletedWindowStats.length,
    analyticsCutoff: analyticsCutoff.toISOString(),
    contactCutoff: contactCutoff.toISOString(),
    rollupCutoff: rollupCutoff.toISOString(),
  };
}
