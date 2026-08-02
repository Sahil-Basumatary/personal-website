// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  STORAGE_TOMBSTONE_BATCH_SIZE,
  STORAGE_TOMBSTONE_MAX_ATTEMPTS,
} from './storage-tombstone-policy';

describe('storage tombstone policy', () => {
  it('bounds retry pressure on the cron path', () => {
    expect(STORAGE_TOMBSTONE_MAX_ATTEMPTS).toBe(8);
    expect(STORAGE_TOMBSTONE_BATCH_SIZE).toBe(25);
  });
});
