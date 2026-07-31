import { lt } from 'drizzle-orm';
import type { Database } from '../db';
import { contactSubmissions, pageViews, windowOpens } from '../db/schema';
import {
  ANALYTICS_RETENTION_DAYS,
  CONTACT_RETENTION_DAYS,
  retentionCutoff,
} from './data-retention-policy';

export {
  ANALYTICS_RETENTION_DAYS,
  CONTACT_RETENTION_DAYS,
  retentionCutoff,
} from './data-retention-policy';

export interface RetentionPurgeResult {
  pageViewsDeleted: number;
  windowOpensDeleted: number;
  contactSubmissionsDeleted: number;
  analyticsCutoff: string;
  contactCutoff: string;
}

export async function purgeExpiredPortfolioData(
  database: Database,
  now: Date = new Date()
): Promise<RetentionPurgeResult> {
  const analyticsCutoff = retentionCutoff(ANALYTICS_RETENTION_DAYS, now);
  const contactCutoff = retentionCutoff(CONTACT_RETENTION_DAYS, now);

  const [deletedPageViews, deletedWindowOpens, deletedContacts] =
    await Promise.all([
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
    ]);

  return {
    pageViewsDeleted: deletedPageViews.length,
    windowOpensDeleted: deletedWindowOpens.length,
    contactSubmissionsDeleted: deletedContacts.length,
    analyticsCutoff: analyticsCutoff.toISOString(),
    contactCutoff: contactCutoff.toISOString(),
  };
}
