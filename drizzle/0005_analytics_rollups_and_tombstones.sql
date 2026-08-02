CREATE TABLE "analytics_daily_page_stats" (
	"day" date PRIMARY KEY NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_daily_window_stats" (
	"day" date NOT NULL,
	"window_type" varchar(80) NOT NULL,
	"opens" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_daily_window_stats_pk" PRIMARY KEY("day","window_type")
);
--> statement-breakpoint
CREATE TABLE "storage_deletion_tombstones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_daily_window_stats_day_idx" ON "analytics_daily_window_stats" USING btree ("day");
--> statement-breakpoint
CREATE UNIQUE INDEX "storage_deletion_tombstones_storage_key_idx" ON "storage_deletion_tombstones" USING btree ("storage_key");
--> statement-breakpoint
CREATE INDEX "storage_deletion_tombstones_updated_at_idx" ON "storage_deletion_tombstones" USING btree ("updated_at");
