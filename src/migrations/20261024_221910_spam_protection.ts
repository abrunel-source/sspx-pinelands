import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_form_submissions_status" ADD VALUE 'spam';
  ALTER TABLE "form_submissions" ADD COLUMN "ip_hash" varchar;
  CREATE INDEX "form_submissions_ip_hash_idx" ON "form_submissions" USING btree ("ip_hash");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "form_submissions" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "form_submissions" ALTER COLUMN "status" SET DEFAULT 'new'::text;
  DROP TYPE "public"."enum_form_submissions_status";
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('new', 'in-progress', 'done');
  ALTER TABLE "form_submissions" ALTER COLUMN "status" SET DEFAULT 'new'::"public"."enum_form_submissions_status";
  ALTER TABLE "form_submissions" ALTER COLUMN "status" SET DATA TYPE "public"."enum_form_submissions_status" USING "status"::"public"."enum_form_submissions_status";
  DROP INDEX "form_submissions_ip_hash_idx";
  ALTER TABLE "form_submissions" DROP COLUMN "ip_hash";`)
}
