import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mass_schedule" ADD COLUMN "notice_until" timestamp(3) with time zone;
  ALTER TABLE "_mass_schedule_v" ADD COLUMN "version_notice_until" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "mass_schedule" DROP COLUMN "notice_until";
  ALTER TABLE "_mass_schedule_v" DROP COLUMN "version_notice_until";`)
}
