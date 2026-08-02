import { existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { getMigrationManifest } from '../src/lib/db/migration-manifest';

const ROOT = process.cwd();
const DRIZZLE_DIR = resolve(ROOT, 'drizzle');
const PROBE_NAME = 'ci_schema_drift_probe';

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function assertJournalSqlPairing(): void {
  const manifest = getMigrationManifest();
  for (const tag of manifest.tags) {
    const sqlPath = resolve(DRIZZLE_DIR, `${tag}.sql`);
    if (!existsSync(sqlPath)) {
      fail(`Missing SQL migration for journal tag: ${tag}`);
    }
  }

  const sqlFiles = readdirSync(DRIZZLE_DIR).filter((name) =>
    name.endsWith('.sql')
  );
  for (const file of sqlFiles) {
    const tag = file.replace(/\.sql$/, '');
    if (!manifest.tags.includes(tag)) {
      fail(`Orphan SQL migration not listed in journal: ${file}`);
    }
  }
}

function runDrizzleKit(args: string[]): void {
  const result = spawnSync('pnpm', ['exec', 'drizzle-kit', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (result.status !== 0) {
    fail(
      `drizzle-kit ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`
    );
  }
  if (result.stdout.trim()) {
    console.log(result.stdout.trim());
  }
}

function assertNoSchemaDrift(): void {
  runDrizzleKit(['generate', `--name=${PROBE_NAME}`]);
  const leftovers = readdirSync(DRIZZLE_DIR).filter((name) =>
    name.includes(PROBE_NAME)
  );
  const metaLeftovers = readdirSync(resolve(DRIZZLE_DIR, 'meta')).filter(
    (name) => name.includes(PROBE_NAME)
  );
  const all = [...leftovers, ...metaLeftovers.map((name) => `meta/${name}`)];
  for (const file of all) {
    rmSync(resolve(DRIZZLE_DIR, file), { force: true, recursive: true });
  }
  if (all.length > 0) {
    fail(
      `Schema drift detected. drizzle-kit generate created: ${all.join(', ')}. Commit a real migration.`
    );
  }
}

function main(): void {
  assertJournalSqlPairing();
  runDrizzleKit(['check']);
  assertNoSchemaDrift();
  const manifest = getMigrationManifest();
  console.log(
    `Migration gate ok: ${manifest.expectedCount} migrations, latest=${manifest.latestTag}`
  );
}

main();
