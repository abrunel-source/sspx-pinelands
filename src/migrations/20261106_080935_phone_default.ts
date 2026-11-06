import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "phone" SET DEFAULT '+27 11 763 1050';`)

  // The contact number from the chapel notices (Our Lady of Sorrows Priory,
  // which serves the chapel). Only replaces the old number, never an edit.
  await db.execute(sql`UPDATE "site_settings" SET "phone" = '+27 11 763 1050' WHERE "phone" = '021 531 0694'`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "phone" SET DEFAULT '021 531 0694';`)
}
