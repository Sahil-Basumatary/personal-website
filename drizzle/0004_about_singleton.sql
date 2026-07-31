-- Keep the newest about row when historical duplicates exist.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY updated_at DESC, id DESC) AS rn
  FROM about_content
)
DELETE FROM about_content
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
--> statement-breakpoint
ALTER TABLE "about_content" ADD COLUMN "singleton_key" varchar(32) DEFAULT 'default' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "about_content_singleton_key_idx" ON "about_content" USING btree ("singleton_key");
