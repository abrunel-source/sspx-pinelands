import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feasts_colour" AS ENUM('white', 'red', 'green', 'violet', 'rose', 'black');
  CREATE TABLE "feasts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"colour" "enum_feasts_colour" DEFAULT 'white' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "home_page" ALTER COLUMN "hero_kicker" SET DEFAULT 'Introibo ad altare Dei';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_hero_kicker" SET DEFAULT 'Introibo ad altare Dei';
  ALTER TABLE "roles" ADD COLUMN "permissions_feasts_read" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "permissions_feasts_create" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "permissions_feasts_update" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "permissions_feasts_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feasts_id" integer;
  CREATE INDEX "feasts_date_idx" ON "feasts" USING btree ("date");
  CREATE INDEX "feasts_updated_at_idx" ON "feasts" USING btree ("updated_at");
  CREATE INDEX "feasts_created_at_idx" ON "feasts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feasts_fk" FOREIGN KEY ("feasts_id") REFERENCES "public"."feasts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_feasts_id_idx" ON "payload_locked_documents_rels" USING btree ("feasts_id");`)

  // --- One-time content changes (a migration runs exactly once per database) ---

  // The starter roles that manage content may also keep the calendar.
  await db.execute(sql`
   UPDATE "roles" SET
     "permissions_feasts_read" = true, "permissions_feasts_create" = true,
     "permissions_feasts_update" = true, "permissions_feasts_delete" = true
   WHERE "name" IN ('Administrator', 'Editor', 'Chapel office');`)

  // New design: Latin line above the hero heading, only where nobody changed the old text.
  await db.execute(sql`
   UPDATE "home_page" SET "hero_kicker" = 'Introibo ad altare Dei'
   WHERE "hero_kicker" = 'Priestly Society of Saint Pius X · Cape Town';
   UPDATE "_home_page_v" SET "version_hero_kicker" = 'Introibo ad altare Dei'
   WHERE "version_hero_kicker" = 'Priestly Society of Saint Pius X · Cape Town';`)

  // Starting calendar (1962 Roman calendar), through Christmas 2026. Midday
  // UTC keeps each date on the right day in Cape Town.
  await db.execute(sql`
   INSERT INTO "feasts" ("title", "date", "colour") VALUES
     ('Our Lord Jesus Christ the King', '2026-10-25T12:00:00Z', 'white'),
     ('All Saints', '2026-11-01T12:00:00Z', 'white'),
     ('All Souls', '2026-11-02T12:00:00Z', 'black'),
     ('Dedication of the Lateran Basilica', '2026-11-09T12:00:00Z', 'white'),
     ('Presentation of the Blessed Virgin Mary', '2026-11-21T12:00:00Z', 'white'),
     ('First Sunday of Advent', '2026-11-29T12:00:00Z', 'violet'),
     ('St Andrew, Apostle', '2026-11-30T12:00:00Z', 'red'),
     ('Immaculate Conception of the Blessed Virgin Mary', '2026-12-08T12:00:00Z', 'white'),
     ('Third Sunday of Advent (Gaudete)', '2026-12-13T12:00:00Z', 'rose'),
     ('Nativity of Our Lord', '2026-12-25T12:00:00Z', 'white');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "feasts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "feasts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feasts_fk";
  
  DROP INDEX "payload_locked_documents_rels_feasts_id_idx";
  ALTER TABLE "home_page" ALTER COLUMN "hero_kicker" SET DEFAULT 'Priestly Society of Saint Pius X · Cape Town';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_hero_kicker" SET DEFAULT 'Priestly Society of Saint Pius X · Cape Town';
  ALTER TABLE "roles" DROP COLUMN "permissions_feasts_read";
  ALTER TABLE "roles" DROP COLUMN "permissions_feasts_create";
  ALTER TABLE "roles" DROP COLUMN "permissions_feasts_update";
  ALTER TABLE "roles" DROP COLUMN "permissions_feasts_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feasts_id";
  DROP TYPE "public"."enum_feasts_colour";`)
}
