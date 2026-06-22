import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { pageViews, windowOpens } from '@/db/schema';

export interface AdminDashboardMetrics {
  pageViews: number;
  dailyVisitors: number;
  windowOpens: number;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [pageViewRows, dailyVisitorRows, windowOpenRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(pageViews),
    db.execute(sql`
      select coalesce(sum(visitors), 0)::int as count
      from (
        select created_at::date, count(distinct visitor_hash)::int as visitors
        from page_views
        group by created_at::date
      ) daily_uniques
    `),
    db.select({ count: sql<number>`count(*)::int` }).from(windowOpens),
  ]);

  return {
    pageViews: pageViewRows.at(0)?.count ?? 0,
    dailyVisitors: Number(dailyVisitorRows.rows.at(0)?.count ?? 0),
    windowOpens: windowOpenRows.at(0)?.count ?? 0,
  };
}
