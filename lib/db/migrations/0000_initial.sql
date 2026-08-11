CREATE TABLE IF NOT EXISTS "orders" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"items" jsonb NOT NULL,
	"total_cents" integer NOT NULL,
	"status" text DEFAULT 'nieuw' NOT NULL,
	"created_at" text NOT NULL,
	"created_at_ts" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"wait_time" integer DEFAULT 20 NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"opening_hours" jsonb
);
--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "opening_hours" jsonb;
