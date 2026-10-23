import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_category" AS ENUM('announcement', 'reading', 'sermon', 'parish-life');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('announcement', 'reading', 'sermon', 'parish-life');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_form_submissions_form_type" AS ENUM('contact', 'newsletter', 'school');
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('new', 'in-progress', 'done');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_home_page_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_page_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_mass_schedule_masses_day" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  CREATE TYPE "public"."enum_mass_schedule_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__mass_schedule_v_version_masses_day" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  CREATE TYPE "public"."enum__mass_schedule_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"category" "enum_posts_category" DEFAULT 'announcement',
  	"author" varchar,
  	"cover_image_id" integer,
  	"created_by_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_category" "enum__posts_v_version_category" DEFAULT 'announcement',
  	"version_author" varchar,
  	"version_cover_image_id" integer,
  	"version_created_by_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"location" varchar,
  	"summary" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_location" varchar,
  	"version_summary" varchar,
  	"version_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_type" "enum_form_submissions_form_type" NOT NULL,
  	"status" "enum_form_submissions_status" DEFAULT 'new',
  	"name" varchar,
  	"email" varchar NOT NULL,
  	"topic" varchar,
  	"message" varchar,
  	"notes" varchar,
  	"email_delivered" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"super_admin" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"permissions_posts_read" boolean DEFAULT false,
  	"permissions_posts_create" boolean DEFAULT false,
  	"permissions_posts_update" boolean DEFAULT false,
  	"permissions_posts_delete" boolean DEFAULT false,
  	"permissions_posts_publish" boolean DEFAULT false,
  	"permissions_posts_own_only" boolean DEFAULT false,
  	"permissions_events_read" boolean DEFAULT false,
  	"permissions_events_create" boolean DEFAULT false,
  	"permissions_events_update" boolean DEFAULT false,
  	"permissions_events_delete" boolean DEFAULT false,
  	"permissions_events_publish" boolean DEFAULT false,
  	"permissions_events_own_only" boolean DEFAULT false,
  	"permissions_media_read" boolean DEFAULT false,
  	"permissions_media_create" boolean DEFAULT false,
  	"permissions_media_update" boolean DEFAULT false,
  	"permissions_media_delete" boolean DEFAULT false,
  	"permissions_media_own_only" boolean DEFAULT false,
  	"permissions_form_submissions_read" boolean DEFAULT false,
  	"permissions_form_submissions_update" boolean DEFAULT false,
  	"permissions_form_submissions_delete" boolean DEFAULT false,
  	"permissions_home_page_read" boolean DEFAULT false,
  	"permissions_home_page_update" boolean DEFAULT false,
  	"permissions_home_page_publish" boolean DEFAULT false,
  	"permissions_mass_schedule_read" boolean DEFAULT false,
  	"permissions_mass_schedule_update" boolean DEFAULT false,
  	"permissions_mass_schedule_publish" boolean DEFAULT false,
  	"permissions_site_settings_read" boolean DEFAULT false,
  	"permissions_site_settings_update" boolean DEFAULT false,
  	"permissions_users_read" boolean DEFAULT false,
  	"permissions_users_create" boolean DEFAULT false,
  	"permissions_users_update" boolean DEFAULT false,
  	"permissions_users_delete" boolean DEFAULT false,
  	"permissions_roles_read" boolean DEFAULT false,
  	"permissions_roles_create" boolean DEFAULT false,
  	"permissions_roles_update" boolean DEFAULT false,
  	"permissions_roles_delete" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"events_id" integer,
  	"media_id" integer,
  	"form_submissions_id" integer,
  	"users_id" integer,
  	"roles_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_visit_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "home_page_community_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "home_page_contact_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_kicker" varchar DEFAULT 'Priestly Society of Saint Pius X · Cape Town',
  	"hero_heading" varchar DEFAULT 'The Traditional Latin Mass, offered every week in Cape Town.',
  	"hero_intro" varchar DEFAULT 'Our Lady of the Blessed Sacrament upholds Catholic tradition and prevails in her call of souls to their everlasting home. All are welcome.',
  	"hero_image_id" integer,
  	"visit_eyebrow" varchar DEFAULT 'Plan your visit',
  	"visit_heading" varchar DEFAULT 'New to the Traditional Mass?',
  	"visit_intro" varchar DEFAULT 'Once housed in the old local post office, our chapel now stands on the centre square overlooking the park. Whether you are returning to the faith or discovering the ancient liturgy for the first time, you will be warmly received.',
  	"visit_image_id" integer,
  	"visit_image_caption" varchar DEFAULT 'Morning in the park across from the chapel, Pinelands',
  	"quote_latin" varchar DEFAULT 'Irrequietum est cor nostrum donec requiescat in Te, Domine.',
  	"quote_translation" varchar DEFAULT 'Our heart, O Lord, is restless, until it finds rest in Thee.',
  	"quote_attribution" varchar DEFAULT 'St Augustine, Confessions',
  	"listen_eyebrow" varchar DEFAULT 'Listen & Watch',
  	"listen_heading" varchar DEFAULT 'Sermons, Masses and the SSPX Podcast',
  	"listen_intro" varchar DEFAULT 'Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society''s official podcast are always available.',
  	"listen_youtube_title" varchar DEFAULT 'Recorded Masses from our chapel',
  	"listen_youtube_text" varchar DEFAULT 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.',
  	"listen_podcast_title" varchar DEFAULT 'Interviews, sermons and Q&A with SSPX priests',
  	"listen_podcast_text" varchar DEFAULT 'The official English-language podcast of the Society, updated weekly.',
  	"community_eyebrow" varchar DEFAULT 'Parish life',
  	"community_heading" varchar DEFAULT 'A faith lived together',
  	"community_intro" varchar DEFAULT 'Feast days, fêtes, shared meals and Christmas preparations. Life at Our Lady of the Blessed Sacrament extends well beyond Sunday morning.',
  	"community_no_events_text" varchar DEFAULT 'Coming soon',
  	"school_eyebrow" varchar DEFAULT 'Catholic education',
  	"school_heading" varchar DEFAULT 'Homeschooling with faith at the heart of every subject',
  	"school_body" varchar DEFAULT 'Our Catholic homeschooling curriculum weaves the faith into every subject. Small class sizes give each child individual attention, and a close-knit community binds students, teachers and families together.',
  	"school_emphasis" varchar DEFAULT 'Registrations for the new year open soon.',
  	"school_image_id" integer,
  	"school_show_form" boolean DEFAULT true,
  	"news_eyebrow" varchar DEFAULT 'News & Reading',
  	"news_heading" varchar DEFAULT 'From the chapel',
  	"give_heading" varchar DEFAULT 'Support the chapel',
  	"give_text" varchar DEFAULT 'Our chapel, its priests and its school are sustained entirely by the generosity of the faithful. Every gift helps keep the Traditional Mass alive in Cape Town.',
  	"give_button_url" varchar,
  	"give_button_label" varchar DEFAULT 'Give online',
  	"give_bank_details" varchar,
  	"give_coming_soon_text" varchar DEFAULT 'Online giving coming soon',
  	"contact_eyebrow" varchar DEFAULT 'Get in touch',
  	"contact_heading" varchar DEFAULT 'Contact the chapel',
  	"contact_intro" varchar DEFAULT 'For baptisms, weddings, confessions by appointment, sick calls or any question about the faith, send us a message and the priest will reply.',
  	"contact_newsletter_heading" varchar DEFAULT 'Stay up to date',
  	"contact_newsletter_text" varchar DEFAULT 'Join the mailing list for Mass changes, feast days and announcements.',
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"_status" "enum_home_page_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_page_v_version_visit_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_community_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v_version_contact_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_kicker" varchar DEFAULT 'Priestly Society of Saint Pius X · Cape Town',
  	"version_hero_heading" varchar DEFAULT 'The Traditional Latin Mass, offered every week in Cape Town.',
  	"version_hero_intro" varchar DEFAULT 'Our Lady of the Blessed Sacrament upholds Catholic tradition and prevails in her call of souls to their everlasting home. All are welcome.',
  	"version_hero_image_id" integer,
  	"version_visit_eyebrow" varchar DEFAULT 'Plan your visit',
  	"version_visit_heading" varchar DEFAULT 'New to the Traditional Mass?',
  	"version_visit_intro" varchar DEFAULT 'Once housed in the old local post office, our chapel now stands on the centre square overlooking the park. Whether you are returning to the faith or discovering the ancient liturgy for the first time, you will be warmly received.',
  	"version_visit_image_id" integer,
  	"version_visit_image_caption" varchar DEFAULT 'Morning in the park across from the chapel, Pinelands',
  	"version_quote_latin" varchar DEFAULT 'Irrequietum est cor nostrum donec requiescat in Te, Domine.',
  	"version_quote_translation" varchar DEFAULT 'Our heart, O Lord, is restless, until it finds rest in Thee.',
  	"version_quote_attribution" varchar DEFAULT 'St Augustine, Confessions',
  	"version_listen_eyebrow" varchar DEFAULT 'Listen & Watch',
  	"version_listen_heading" varchar DEFAULT 'Sermons, Masses and the SSPX Podcast',
  	"version_listen_intro" varchar DEFAULT 'Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society''s official podcast are always available.',
  	"version_listen_youtube_title" varchar DEFAULT 'Recorded Masses from our chapel',
  	"version_listen_youtube_text" varchar DEFAULT 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.',
  	"version_listen_podcast_title" varchar DEFAULT 'Interviews, sermons and Q&A with SSPX priests',
  	"version_listen_podcast_text" varchar DEFAULT 'The official English-language podcast of the Society, updated weekly.',
  	"version_community_eyebrow" varchar DEFAULT 'Parish life',
  	"version_community_heading" varchar DEFAULT 'A faith lived together',
  	"version_community_intro" varchar DEFAULT 'Feast days, fêtes, shared meals and Christmas preparations. Life at Our Lady of the Blessed Sacrament extends well beyond Sunday morning.',
  	"version_community_no_events_text" varchar DEFAULT 'Coming soon',
  	"version_school_eyebrow" varchar DEFAULT 'Catholic education',
  	"version_school_heading" varchar DEFAULT 'Homeschooling with faith at the heart of every subject',
  	"version_school_body" varchar DEFAULT 'Our Catholic homeschooling curriculum weaves the faith into every subject. Small class sizes give each child individual attention, and a close-knit community binds students, teachers and families together.',
  	"version_school_emphasis" varchar DEFAULT 'Registrations for the new year open soon.',
  	"version_school_image_id" integer,
  	"version_school_show_form" boolean DEFAULT true,
  	"version_news_eyebrow" varchar DEFAULT 'News & Reading',
  	"version_news_heading" varchar DEFAULT 'From the chapel',
  	"version_give_heading" varchar DEFAULT 'Support the chapel',
  	"version_give_text" varchar DEFAULT 'Our chapel, its priests and its school are sustained entirely by the generosity of the faithful. Every gift helps keep the Traditional Mass alive in Cape Town.',
  	"version_give_button_url" varchar,
  	"version_give_button_label" varchar DEFAULT 'Give online',
  	"version_give_bank_details" varchar,
  	"version_give_coming_soon_text" varchar DEFAULT 'Online giving coming soon',
  	"version_contact_eyebrow" varchar DEFAULT 'Get in touch',
  	"version_contact_heading" varchar DEFAULT 'Contact the chapel',
  	"version_contact_intro" varchar DEFAULT 'For baptisms, weddings, confessions by appointment, sick calls or any question about the faith, send us a message and the priest will reply.',
  	"version_contact_newsletter_heading" varchar DEFAULT 'Stay up to date',
  	"version_contact_newsletter_text" varchar DEFAULT 'Join the mailing list for Mass changes, feast days and announcements.',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version__status" "enum__home_page_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "mass_schedule_masses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_mass_schedule_masses_day",
  	"time" varchar,
  	"description" varchar DEFAULT 'Holy Mass',
  	"note" varchar,
  	"highlight" boolean
  );
  
  CREATE TABLE "mass_schedule" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"notice" varchar,
  	"intro" varchar DEFAULT 'All Masses are offered according to the 1962 Roman Missal. Confessions are heard before Sunday Mass, and by appointment with the priest.',
  	"special_note_title" varchar DEFAULT 'First Fridays & First Saturdays:',
  	"special_note_text" varchar DEFAULT 'Rosary and Benediction 30 minutes before the usual Mass time.',
  	"_status" "enum_mass_schedule_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_mass_schedule_v_version_masses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__mass_schedule_v_version_masses_day",
  	"time" varchar,
  	"description" varchar DEFAULT 'Holy Mass',
  	"note" varchar,
  	"highlight" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_mass_schedule_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_notice" varchar,
  	"version_intro" varchar DEFAULT 'All Masses are offered according to the 1962 Roman Missal. Confessions are heard before Sunday Mass, and by appointment with the priest.',
  	"version_special_note_title" varchar DEFAULT 'First Fridays & First Saturdays:',
  	"version_special_note_text" varchar DEFAULT 'Rosary and Benediction 30 minutes before the usual Mass time.',
  	"version__status" "enum__mass_schedule_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar DEFAULT '021 531 0694' NOT NULL,
  	"email" varchar DEFAULT 'sspxcapetown@gmail.com' NOT NULL,
  	"forms_recipient" varchar DEFAULT 'o.keiser@fsspx.email' NOT NULL,
  	"chapel_name" varchar DEFAULT 'Chapel of Our Lady of the Blessed Sacrament' NOT NULL,
  	"street" varchar DEFAULT '2a St Stephens Road' NOT NULL,
  	"suburb" varchar DEFAULT 'Pinelands' NOT NULL,
  	"city" varchar DEFAULT 'Cape Town' NOT NULL,
  	"parking" varchar DEFAULT 'In the parking area next to the church',
  	"directions_url" varchar DEFAULT 'https://maps.google.com/?cid=3354026342701529790',
  	"map_embed_url" varchar DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.0751826742885!2d18.49626381803948!3d-33.93919436739519!2m3!1f0!2f0!3fx0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5ceced3243a1%3A0x2e8be5303406fabe!2sSSPX%20-%20Chapel%20Of%20Our%20Lady%20Of%20The%20Blessed%20Sacrament!5e0!3m2!1sen!2sza!4v1720443775175!5m2!1sen!2sza',
  	"youtube_url" varchar DEFAULT 'https://www.youtube.com/@mgpwild',
  	"youtube_playlist_id" varchar DEFAULT 'UUALIHWtnVE-4Tqe-mW8Xuyw',
  	"podcast_url" varchar DEFAULT 'https://podcasts.apple.com/us/podcast/sspx-podcast/id1237387297',
  	"podcast_embed_url" varchar DEFAULT 'https://embed.podcasts.apple.com/us/podcast/sspx-podcast/id1237387297',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_visit_steps" ADD CONSTRAINT "home_page_visit_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_community_gallery" ADD CONSTRAINT "home_page_community_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_community_gallery" ADD CONSTRAINT "home_page_community_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_contact_topics" ADD CONSTRAINT "home_page_contact_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_visit_image_id_media_id_fk" FOREIGN KEY ("visit_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_school_image_id_media_id_fk" FOREIGN KEY ("school_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page" ADD CONSTRAINT "home_page_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_visit_steps" ADD CONSTRAINT "_home_page_v_version_visit_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_community_gallery" ADD CONSTRAINT "_home_page_v_version_community_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_community_gallery" ADD CONSTRAINT "_home_page_v_version_community_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v_version_contact_topics" ADD CONSTRAINT "_home_page_v_version_contact_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_visit_image_id_media_id_fk" FOREIGN KEY ("version_visit_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_school_image_id_media_id_fk" FOREIGN KEY ("version_school_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_page_v" ADD CONSTRAINT "_home_page_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mass_schedule_masses" ADD CONSTRAINT "mass_schedule_masses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mass_schedule"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_mass_schedule_v_version_masses" ADD CONSTRAINT "_mass_schedule_v_version_masses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_mass_schedule_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_created_by_idx" ON "posts" USING btree ("created_by_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_cover_image_idx" ON "_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_posts_v_version_version_created_by_idx" ON "_posts_v" USING btree ("version_created_by_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_created_by_idx" ON "_events_v" USING btree ("version_created_by_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "media_created_by_idx" ON "media" USING btree ("created_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_roles_id_idx" ON "users_rels" USING btree ("roles_id");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_visit_steps_order_idx" ON "home_page_visit_steps" USING btree ("_order");
  CREATE INDEX "home_page_visit_steps_parent_id_idx" ON "home_page_visit_steps" USING btree ("_parent_id");
  CREATE INDEX "home_page_community_gallery_order_idx" ON "home_page_community_gallery" USING btree ("_order");
  CREATE INDEX "home_page_community_gallery_parent_id_idx" ON "home_page_community_gallery" USING btree ("_parent_id");
  CREATE INDEX "home_page_community_gallery_image_idx" ON "home_page_community_gallery" USING btree ("image_id");
  CREATE INDEX "home_page_contact_topics_order_idx" ON "home_page_contact_topics" USING btree ("_order");
  CREATE INDEX "home_page_contact_topics_parent_id_idx" ON "home_page_contact_topics" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_hero_image_idx" ON "home_page" USING btree ("hero_image_id");
  CREATE INDEX "home_page_visit_visit_image_idx" ON "home_page" USING btree ("visit_image_id");
  CREATE INDEX "home_page_school_school_image_idx" ON "home_page" USING btree ("school_image_id");
  CREATE INDEX "home_page_meta_meta_image_idx" ON "home_page" USING btree ("meta_image_id");
  CREATE INDEX "home_page__status_idx" ON "home_page" USING btree ("_status");
  CREATE INDEX "_home_page_v_version_visit_steps_order_idx" ON "_home_page_v_version_visit_steps" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_visit_steps_parent_id_idx" ON "_home_page_v_version_visit_steps" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_community_gallery_order_idx" ON "_home_page_v_version_community_gallery" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_community_gallery_parent_id_idx" ON "_home_page_v_version_community_gallery" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_community_gallery_image_idx" ON "_home_page_v_version_community_gallery" USING btree ("image_id");
  CREATE INDEX "_home_page_v_version_contact_topics_order_idx" ON "_home_page_v_version_contact_topics" USING btree ("_order");
  CREATE INDEX "_home_page_v_version_contact_topics_parent_id_idx" ON "_home_page_v_version_contact_topics" USING btree ("_parent_id");
  CREATE INDEX "_home_page_v_version_hero_version_hero_image_idx" ON "_home_page_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_home_page_v_version_visit_version_visit_image_idx" ON "_home_page_v" USING btree ("version_visit_image_id");
  CREATE INDEX "_home_page_v_version_school_version_school_image_idx" ON "_home_page_v" USING btree ("version_school_image_id");
  CREATE INDEX "_home_page_v_version_meta_version_meta_image_idx" ON "_home_page_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_home_page_v_version_version__status_idx" ON "_home_page_v" USING btree ("version__status");
  CREATE INDEX "_home_page_v_created_at_idx" ON "_home_page_v" USING btree ("created_at");
  CREATE INDEX "_home_page_v_updated_at_idx" ON "_home_page_v" USING btree ("updated_at");
  CREATE INDEX "_home_page_v_latest_idx" ON "_home_page_v" USING btree ("latest");
  CREATE INDEX "_home_page_v_autosave_idx" ON "_home_page_v" USING btree ("autosave");
  CREATE INDEX "mass_schedule_masses_order_idx" ON "mass_schedule_masses" USING btree ("_order");
  CREATE INDEX "mass_schedule_masses_parent_id_idx" ON "mass_schedule_masses" USING btree ("_parent_id");
  CREATE INDEX "mass_schedule__status_idx" ON "mass_schedule" USING btree ("_status");
  CREATE INDEX "_mass_schedule_v_version_masses_order_idx" ON "_mass_schedule_v_version_masses" USING btree ("_order");
  CREATE INDEX "_mass_schedule_v_version_masses_parent_id_idx" ON "_mass_schedule_v_version_masses" USING btree ("_parent_id");
  CREATE INDEX "_mass_schedule_v_version_version__status_idx" ON "_mass_schedule_v" USING btree ("version__status");
  CREATE INDEX "_mass_schedule_v_created_at_idx" ON "_mass_schedule_v" USING btree ("created_at");
  CREATE INDEX "_mass_schedule_v_updated_at_idx" ON "_mass_schedule_v" USING btree ("updated_at");
  CREATE INDEX "_mass_schedule_v_latest_idx" ON "_mass_schedule_v" USING btree ("latest");
  CREATE INDEX "_mass_schedule_v_autosave_idx" ON "_mass_schedule_v" USING btree ("autosave");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_visit_steps" CASCADE;
  DROP TABLE "home_page_community_gallery" CASCADE;
  DROP TABLE "home_page_contact_topics" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "_home_page_v_version_visit_steps" CASCADE;
  DROP TABLE "_home_page_v_version_community_gallery" CASCADE;
  DROP TABLE "_home_page_v_version_contact_topics" CASCADE;
  DROP TABLE "_home_page_v" CASCADE;
  DROP TABLE "mass_schedule_masses" CASCADE;
  DROP TABLE "mass_schedule" CASCADE;
  DROP TABLE "_mass_schedule_v_version_masses" CASCADE;
  DROP TABLE "_mass_schedule_v" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_form_submissions_form_type";
  DROP TYPE "public"."enum_form_submissions_status";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_home_page_status";
  DROP TYPE "public"."enum__home_page_v_version_status";
  DROP TYPE "public"."enum_mass_schedule_masses_day";
  DROP TYPE "public"."enum_mass_schedule_status";
  DROP TYPE "public"."enum__mass_schedule_v_version_masses_day";
  DROP TYPE "public"."enum__mass_schedule_v_version_status";`)
}
