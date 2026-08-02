// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { checkMigrationReadiness } from './migration-readiness';

describe('checkMigrationReadiness', () => {
  it('passes when applied migrations meet the expected count', async () => {
    const database = {
      execute: vi.fn(async () => ({ rows: [{ count: 5 }] })),
    };
    await expect(
      checkMigrationReadiness(database as never, {
        expectedCount: 5,
        latestTag: '0004_about_singleton',
        tags: [],
      })
    ).resolves.toEqual({
      ok: true,
      expected: 5,
      applied: 5,
      latestTag: '0004_about_singleton',
    });
  });

  it('fails closed when the database is behind', async () => {
    const database = {
      execute: vi.fn(async () => ({ rows: [{ count: 4 }] })),
    };
    await expect(
      checkMigrationReadiness(database as never, {
        expectedCount: 5,
        latestTag: '0004_about_singleton',
        tags: [],
      })
    ).resolves.toEqual({
      ok: false,
      expected: 5,
      applied: 4,
      latestTag: '0004_about_singleton',
      reason: 'behind',
    });
  });

  it('fails closed when the migrations table is unavailable', async () => {
    const database = {
      execute: vi.fn(async () => {
        throw new Error('relation missing');
      }),
    };
    await expect(
      checkMigrationReadiness(database as never, {
        expectedCount: 5,
        latestTag: '0004_about_singleton',
        tags: [],
      })
    ).resolves.toMatchObject({ ok: false, reason: 'unavailable' });
  });
});
