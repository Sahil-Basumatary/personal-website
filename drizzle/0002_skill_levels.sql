CREATE TYPE "public"."skill_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "level" "skill_level";--> statement-breakpoint
UPDATE "skills" SET "category" = lower(btrim("category"));--> statement-breakpoint
UPDATE "skills"
SET "level" = CASE
  WHEN "category" = 'languages' AND "proficiency" <= 39 THEN 'beginner'::"skill_level"
  WHEN "category" = 'languages' AND "proficiency" <= 69 THEN 'intermediate'::"skill_level"
  WHEN "category" = 'languages' THEN 'advanced'::"skill_level"
  ELSE NULL
END;--> statement-breakpoint
ALTER TABLE "skills" DROP COLUMN "proficiency";
