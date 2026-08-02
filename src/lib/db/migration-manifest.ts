import journal from '../../../drizzle/meta/_journal.json';

export interface MigrationManifest {
  expectedCount: number;
  latestTag: string;
  tags: string[];
}

type JournalEntry = {
  idx: number;
  tag: string;
};

export function getMigrationManifest(
  source: { entries: JournalEntry[] } = journal
): MigrationManifest {
  const entries = source.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Migration journal has no entries.');
  }

  const tags = entries.map((entry) => entry.tag);
  const latestTag = tags.at(-1);
  if (!latestTag) {
    throw new Error('Migration journal is missing a latest tag.');
  }

  return {
    expectedCount: tags.length,
    latestTag,
    tags,
  };
}
