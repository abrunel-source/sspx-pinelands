import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

import {
  ALL_SAINTS_COVER,
  ALL_SAINTS_GROUPS,
  ALL_SAINTS_PHOTOS,
  FIRST_FRIDAYS_TEXT,
  MASS_INTRO,
  MASS_TIMES,
  NOVEMBER_EVENTS,
  NOVEMBER_POSTS,
  WEEK_NOTICE,
} from '../seed/november-2026'
import { withPhotos } from '../seed/procession'

// Content only, no schema change: the chapel notices of 30 October 2026 (Mass
// times, this week's notice, coming events) and the All Saints post with its
// photos. A migration runs exactly once per database.

const context = () => ({ disableRevalidate: true })

/** The Mass times loaded from the old website, which these notices replace. */
const STARTING_TIMES = 'Sunday 9:00|Monday 8:00|Friday 18:30|Saturday 9:00'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // Photos
  const mediaIds: Record<string, number> = {}
  for (const photo of [ALL_SAINTS_COVER, ...ALL_SAINTS_PHOTOS]) {
    const [existing] = (
      await payload.find({ collection: 'media', where: { filename: { equals: photo.file } }, limit: 1, depth: 0, req })
    ).docs
    const doc =
      existing ??
      (await payload.create({
        collection: 'media',
        data: { alt: photo.alt, caption: photo.caption },
        filePath: path.resolve(process.cwd(), 'src/seed/media', photo.file),
        context: context(),
        req,
      }))
    mediaIds[photo.file] = doc.id
  }

  // Posts
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  for (const post of NOVEMBER_POSTS) {
    const { totalDocs } = await payload.count({ collection: 'posts', where: { slug: { equals: post.slug } }, req })
    if (totalDocs) continue
    const html = await fs.readFile(path.resolve(process.cwd(), 'src/seed/content', post.htmlFile), 'utf8')
    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: post.slug,
        generateSlug: false,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        coverImage: post.coverImage ? mediaIds[post.coverImage] : undefined,
        content: withPhotos(convertHTMLToLexical({ editorConfig, html, JSDOM }), mediaIds, ALL_SAINTS_GROUPS),
        meta: { title: post.metaTitle, description: post.metaDescription },
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  // Coming events
  for (const event of NOVEMBER_EVENTS) {
    const { totalDocs } = await payload.count({ collection: 'events', where: { title: { equals: event.title } }, req })
    if (totalDocs) continue
    await payload.create({ collection: 'events', data: { ...event, _status: 'published' }, context: context(), req })
  }

  // Mass times: only while they are still the starting ones, so edits are never undone.
  const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0, req })
  const current = (schedule.masses ?? []).map((m) => `${m.day} ${m.time}`).join('|')
  const data: Record<string, unknown> = {}
  if (current === STARTING_TIMES) {
    data.masses = MASS_TIMES
    data.intro = MASS_INTRO
    data.specialNote = { ...schedule.specialNote, text: FIRST_FRIDAYS_TEXT }
  }
  if (!schedule.notice) Object.assign(data, WEEK_NOTICE)
  if (Object.keys(data).length) {
    await payload.updateGlobal({
      slug: 'mass-schedule',
      data: { ...data, _status: 'published' },
      context: context(),
      req,
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content stays: editors can change or remove it in the admin.
}
