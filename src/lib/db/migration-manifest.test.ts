// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getMigrationManifest } from './migration-manifest';

describe('getMigrationManifest', () => {
  it('reads expected count and latest tag from the journal', () => {
    const manifest = getMigrationManifest({
      entries: [
        { idx: 0, tag: '0000_a' },
        { idx: 1, tag: '0001_b' },
      ],
    });
    expect(manifest).toEqual({
      expectedCount: 2,
      latestTag: '0001_b',
      tags: ['0000_a', '0001_b'],
    });
  });

  it('rejects an empty journal', () => {
    expect(() => getMigrationManifest({ entries: [] })).toThrow(/no entries/i);
  });
});
