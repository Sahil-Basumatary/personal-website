import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'published',
  'archived',
]);

// PG enum type stays skill_level; the column is named proficiency.
export const skillProficiencyEnum = pgEnum('skill_level', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 120 }).notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    summary: text('summary').notNull(),
    readme: text('readme').notNull(),
    techStack: jsonb('tech_stack')
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    liveUrl: text('live_url'),
    githubUrl: text('github_url'),
    status: projectStatusEnum('status').default('draft').notNull(),
    order: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('projects_slug_idx').on(table.slug),
    index('projects_status_order_idx').on(table.status, table.order),
  ]
);

export const projectStoryImages = pgTable(
  'project_story_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    storageKey: varchar('storage_key', { length: 512 }).notNull(),
    url: text('url').notNull(),
    alt: varchar('alt', { length: 240 }).notNull(),
    caption: text('caption'),
    order: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('project_story_images_project_order_idx').on(
      table.projectId,
      table.order
    ),
  ]
);

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    category: varchar('category', { length: 80 }).notNull(),
    proficiency: skillProficiencyEnum('proficiency'),
    order: integer('display_order').default(0).notNull(),
  },
  (table) => [
    index('skills_category_order_idx').on(table.category, table.order),
  ]
);

export const aboutContent = pgTable('about_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').default('').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const pageViews = pgTable(
  'page_views',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    path: text('path').notNull(),
    visitorHash: varchar('visitor_hash', { length: 64 }).notNull(),
    country: varchar('country', { length: 2 }),
    device: varchar('device', { length: 32 }).notNull(),
    referrer: text('referrer'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('page_views_created_at_idx').on(table.createdAt),
    index('page_views_path_idx').on(table.path),
    index('page_views_visitor_hash_idx').on(table.visitorHash),
  ]
);

export const windowOpens = pgTable(
  'window_opens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    windowType: varchar('window_type', { length: 80 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('window_opens_created_at_idx').on(table.createdAt),
    index('window_opens_window_type_idx').on(table.windowType),
  ]
);

export const contactSubmissions = pgTable(
  'contact_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    subject: varchar('subject', { length: 160 }).notNull(),
    message: text('message').notNull(),
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('contact_submissions_created_at_idx').on(table.createdAt),
    index('contact_submissions_read_idx').on(table.read),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectStoryImage = typeof projectStoryImages.$inferSelect;
export type NewProjectStoryImage = typeof projectStoryImages.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type AboutContent = typeof aboutContent.$inferSelect;
export type NewAboutContent = typeof aboutContent.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type WindowOpen = typeof windowOpens.$inferSelect;
export type NewWindowOpen = typeof windowOpens.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
