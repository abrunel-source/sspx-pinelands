import path from 'path'

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_feasts_source" AS ENUM('manual', 'auto');
  ALTER TABLE "home_page" ALTER COLUMN "listen_heading" SET DEFAULT 'Homilies and the SSPX Podcast';
  ALTER TABLE "home_page" ALTER COLUMN "listen_intro" SET DEFAULT 'Missed Sunday, or want to hear a sermon again? Homilies from our chapel and the Society''s official podcast are always available.';
  ALTER TABLE "home_page" ALTER COLUMN "listen_youtube_title" SET DEFAULT 'Sunday homilies from our chapel';
  ALTER TABLE "home_page" ALTER COLUMN "listen_youtube_text" SET DEFAULT 'The latest homily appears here automatically each week. Open the channel to hear earlier homilies.';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_heading" SET DEFAULT 'Homilies and the SSPX Podcast';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_intro" SET DEFAULT 'Missed Sunday, or want to hear a sermon again? Homilies from our chapel and the Society''s official podcast are always available.';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_youtube_title" SET DEFAULT 'Sunday homilies from our chapel';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_youtube_text" SET DEFAULT 'The latest homily appears here automatically each week. Open the channel to hear earlier homilies.';
  ALTER TABLE "feasts" ADD COLUMN "source" "enum_feasts_source" DEFAULT 'manual';
  ALTER TABLE "site_settings" ADD COLUMN "youtube_channel_id" varchar DEFAULT 'UCALIHWtnVE-4Tqe-mW8Xuyw';
  ALTER TABLE "site_settings" ADD COLUMN "latest_homily_video_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "latest_homily_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "latest_homily_published_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "latest_homily_checked_at" timestamp(3) with time zone;`)

  // --- One-time content changes (a migration runs exactly once per database) ---

  // The YouTube channel holds the Sunday homilies, not recorded Masses.
  // Only replace text nobody has edited.
  await db.execute(sql`
   UPDATE "home_page" SET "listen_heading" = 'Homilies and the SSPX Podcast'
     WHERE "listen_heading" = 'Sermons, Masses and the SSPX Podcast';
   UPDATE "_home_page_v" SET "version_listen_heading" = 'Homilies and the SSPX Podcast'
     WHERE "version_listen_heading" = 'Sermons, Masses and the SSPX Podcast';
   UPDATE "home_page" SET "listen_intro" = 'Missed Sunday, or want to hear a sermon again? Homilies from our chapel and the Society''s official podcast are always available.'
     WHERE "listen_intro" = 'Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society''s official podcast are always available.';
   UPDATE "_home_page_v" SET "version_listen_intro" = 'Missed Sunday, or want to hear a sermon again? Homilies from our chapel and the Society''s official podcast are always available.'
     WHERE "version_listen_intro" = 'Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society''s official podcast are always available.';
   UPDATE "home_page" SET "listen_youtube_title" = 'Sunday homilies from our chapel'
     WHERE "listen_youtube_title" = 'Recorded Masses from our chapel';
   UPDATE "_home_page_v" SET "version_listen_youtube_title" = 'Sunday homilies from our chapel'
     WHERE "version_listen_youtube_title" = 'Recorded Masses from our chapel';
   UPDATE "home_page" SET "listen_youtube_text" = 'The latest homily appears here automatically each week. Open the channel to hear earlier homilies.'
     WHERE "listen_youtube_text" = 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.';
   UPDATE "_home_page_v" SET "version_listen_youtube_text" = 'The latest homily appears here automatically each week. Open the channel to hear earlier homilies.'
     WHERE "version_listen_youtube_text" = 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.';`)

  // The calendar seeded by the previous migration becomes "automatic", so the
  // weekly update can keep it in line with the 1962 calendar.
  await db.execute(sql`
   UPDATE "feasts" SET "source" = 'auto' WHERE "title" IN (
     'Our Lord Jesus Christ the King', 'All Saints', 'All Souls', 'Dedication of the Lateran Basilica',
     'Presentation of the Blessed Virgin Mary', 'First Sunday of Advent', 'St Andrew, Apostle',
     'Immaculate Conception of the Blessed Virgin Mary', 'Third Sunday of Advent (Gaudete)', 'Nativity of Our Lord'
   );`)

  // New homeschooling photo: upload it, then use it wherever the original
  // school photo is still in place (an editor's own choice is kept).
  const [newPhoto] = (
    await payload.find({ collection: 'media', where: { filename: { equals: 'school-distinctions.jpg' } }, limit: 1, depth: 0, req })
  ).docs
  const photo =
    newPhoto ??
    (await payload.create({
      collection: 'media',
      data: {
        alt: 'Homeschool pupils in red blazers with their priest, holding their 2024 virtue distinction certificates',
      },
      filePath: path.resolve(process.cwd(), 'src/seed/media/school-distinctions.jpg'),
      context: { disableRevalidate: true },
      req,
    }))
  const [oldPhoto] = (
    await payload.find({ collection: 'media', where: { filename: { equals: 'school.jpg' } }, limit: 1, depth: 0, req })
  ).docs
  if (oldPhoto) {
    // One statement per query: Postgres rejects several statements once parameters are used.
    await db.execute(sql`UPDATE "home_page" SET "school_image_id" = ${photo.id} WHERE "school_image_id" = ${oldPhoto.id}`)
    await db.execute(
      sql`UPDATE "_home_page_v" SET "version_school_image_id" = ${photo.id} WHERE "version_school_image_id" = ${oldPhoto.id}`,
    )
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" ALTER COLUMN "listen_heading" SET DEFAULT 'Sermons, Masses and the SSPX Podcast';
  ALTER TABLE "home_page" ALTER COLUMN "listen_intro" SET DEFAULT 'Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society''s official podcast are always available.';
  ALTER TABLE "home_page" ALTER COLUMN "listen_youtube_title" SET DEFAULT 'Recorded Masses from our chapel';
  ALTER TABLE "home_page" ALTER COLUMN "listen_youtube_text" SET DEFAULT 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_heading" SET DEFAULT 'Sermons, Masses and the SSPX Podcast';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_intro" SET DEFAULT 'Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society''s official podcast are always available.';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_youtube_title" SET DEFAULT 'Recorded Masses from our chapel';
  ALTER TABLE "_home_page_v" ALTER COLUMN "version_listen_youtube_text" SET DEFAULT 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.';
  ALTER TABLE "feasts" DROP COLUMN "source";
  ALTER TABLE "site_settings" DROP COLUMN "youtube_channel_id";
  ALTER TABLE "site_settings" DROP COLUMN "latest_homily_video_id";
  ALTER TABLE "site_settings" DROP COLUMN "latest_homily_title";
  ALTER TABLE "site_settings" DROP COLUMN "latest_homily_published_at";
  ALTER TABLE "site_settings" DROP COLUMN "latest_homily_checked_at";
  DROP TYPE "public"."enum_feasts_source";`)
}
