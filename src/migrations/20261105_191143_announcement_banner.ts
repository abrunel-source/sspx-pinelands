import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_announcement_banner_theme" AS ENUM('christmas', 'plain');
  CREATE TABLE "announcement_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean,
  	"hide_after" timestamp(3) with time zone,
  	"theme" "enum_announcement_banner_theme" DEFAULT 'christmas',
  	"eyebrow" varchar,
  	"heading" varchar NOT NULL,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"place" varchar,
  	"text" varchar,
  	"poster_id" integer,
  	"button_label" varchar,
  	"button_link" varchar,
  	"second_button_label" varchar,
  	"second_button_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "roles" ADD COLUMN "permissions_announcement_banner_read" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "permissions_announcement_banner_update" boolean DEFAULT false;
  ALTER TABLE "announcement_banner" ADD CONSTRAINT "announcement_banner_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "announcement_banner_poster_idx" ON "announcement_banner" USING btree ("poster_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "announcement_banner" CASCADE;
  ALTER TABLE "roles" DROP COLUMN "permissions_announcement_banner_read";
  ALTER TABLE "roles" DROP COLUMN "permissions_announcement_banner_update";
  DROP TYPE "public"."enum_announcement_banner_theme";`)
}
