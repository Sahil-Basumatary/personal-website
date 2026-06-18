import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { pageViews, windowOpens } from '@/db/schema';

export interface AdminDashboardMetrics {
  pageViews: number;
  uniqueVisitors: number;
  windowOpens: number;
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [pageViewRows, uniqueVisitorRows, windowOpenRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(pageViews),
    db
      .select({
        count: sql<number>`count(distinct ${pageViews.visitorHash})::int`,
      })
      .from(pageViews),
    db.select({ count: sql<number>`count(*)::int` }).from(windowOpens),
  ]);

  return {
    pageViews: pageViewRows.at(0)?.count ?? 0,
    uniqueVisitors: uniqueVisitorRows.at(0)?.count ?? 0,
    windowOpens: windowOpenRows.at(0)?.count ?? 0,
  };
}
