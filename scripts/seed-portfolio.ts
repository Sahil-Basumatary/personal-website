import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { and, count, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { aboutContent, projects, skills } from '../src/db/schema';
import { ABOUT_SINGLETON_KEY } from '../src/lib/content/about-singleton';
import { BUNDLED_PORTFOLIO } from '../src/lib/content/bundled-portfolio';
import {
  planPortfolioSeed,
  skillSeedKey,
  toProjectSeedRows,
} from '../src/lib/content/seed-plan';

function loadEnvFile(fileName: string): void {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '');
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed portfolio content.');
  }

  const db = drizzle(neon(databaseUrl));

  const [aboutRow] = await db.select({ value: count() }).from(aboutContent);
  const existingProjects = await db
    .select({ slug: projects.slug })
    .from(projects);
  const existingSkills = await db
    .select({ name: skills.name, category: skills.category })
    .from(skills);

  const plan = planPortfolioSeed({
    content: BUNDLED_PORTFOLIO,
    existingAboutCount: Number(aboutRow?.value ?? 0),
    existingProjectSlugs: existingProjects.map((row) => row.slug),
    existingSkillKeys: existingSkills.map((row) =>
      skillSeedKey(row.category, row.name)
    ),
  });

  if (plan.about.action === 'insert' && plan.about.content !== null) {
    await db
      .insert(aboutContent)
      .values({
        singletonKey: ABOUT_SINGLETON_KEY,
        content: plan.about.content,
      })
      .onConflictDoUpdate({
        target: aboutContent.singletonKey,
        set: {
          content: plan.about.content,
          updatedAt: new Date(),
        },
      });
  }

  for (const row of plan.projects.insert) {
    const collision = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.slug, row.slug))
      .limit(1);

    if (collision.length > 0) {
      continue;
    }

    await db.insert(projects).values(row);
  }

  // Keep published project metadata aligned with the bundled source of truth
  // without touching status/order that admins may have changed.
  const syncedSlugs: string[] = [];
  for (const row of toProjectSeedRows(BUNDLED_PORTFOLIO.projects)) {
    const updated = await db
      .update(projects)
      .set({
        title: row.title,
        summary: row.summary,
        readme: row.readme,
        techStack: row.techStack,
        liveUrl: row.liveUrl,
        githubUrl: row.githubUrl,
        updatedAt: new Date(),
      })
      .where(eq(projects.slug, row.slug))
      .returning({ slug: projects.slug });
    if (updated[0]?.slug) {
      syncedSlugs.push(updated[0].slug);
    }
  }

  for (const row of plan.skills.insert) {
    const collision = await db
      .select({ id: skills.id })
      .from(skills)
      .where(and(eq(skills.category, row.category), eq(skills.name, row.name)))
      .limit(1);

    if (collision.length > 0) {
      continue;
    }

    await db.insert(skills).values(row);
  }

  console.log(
    JSON.stringify(
      {
        about: plan.about.action,
        projectsInserted: plan.projects.insert.map((row) => row.slug),
        projectsSkipped: plan.projects.skippedSlugs,
        projectsSynced: syncedSlugs,
        skillsInserted: plan.skills.insert.map(
          (row) => `${row.category}/${row.name}`
        ),
        skillsSkipped: plan.skills.skippedKeys,
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
