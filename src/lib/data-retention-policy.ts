export const ANALYTICS_RETENTION_DAYS = 90;
export const ANALYTICS_ROLLUP_RETENTION_DAYS = 730;
export const CONTACT_RETENTION_DAYS = 365;

export function retentionCutoff(days: number, now: Date = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function toUtcDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}
