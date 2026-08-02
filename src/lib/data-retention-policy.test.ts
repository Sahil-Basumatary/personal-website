// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  ANALYTICS_RETENTION_DAYS,
  ANALYTICS_ROLLUP_RETENTION_DAYS,
  CONTACT_RETENTION_DAYS,
  retentionCutoff,
  toUtcDateOnly,
} from './data-retention-policy';

describe('retentionCutoff', () => {
  it('uses professional portfolio retention windows', () => {
    expect(ANALYTICS_RETENTION_DAYS).toBe(90);
    expect(ANALYTICS_ROLLUP_RETENTION_DAYS).toBe(730);
    expect(CONTACT_RETENTION_DAYS).toBe(365);
  });

  it('subtracts whole days from the provided now', () => {
    const now = new Date('2026-07-31T04:00:00.000Z');
    expect(retentionCutoff(90, now).toISOString()).toBe(
      '2026-05-02T04:00:00.000Z'
    );
    expect(retentionCutoff(365, now).toISOString()).toBe(
      '2025-07-31T04:00:00.000Z'
    );
  });

  it('formats utc calendar dates for rollup day columns', () => {
    expect(toUtcDateOnly(new Date('2026-07-31T04:00:00.000Z'))).toBe(
      '2026-07-31'
    );
    expect(
      toUtcDateOnly(retentionCutoff(730, new Date('2026-07-31T04:00:00.000Z')))
    ).toBe('2024-07-31');
  });
});
