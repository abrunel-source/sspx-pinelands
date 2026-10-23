/**
 * Fills an empty database with the current website content: photos, home
 * page text, Mass times, contact details, the posts migrated from WordPress
 * and a set of starter roles. Safe to run more than once: anything that
 * already exists is left alone.
 *
 *   npm run seed
 *
 * Optionally create the first super admin at the same time:
 *   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='…' npm run seed
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import { home, massSchedule, posts, roles } from './data'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const context = { disableRevalidate: true }

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

// --- Media -----------------------------------------------------------------

const mediaIds: Record<string, number> = {}

const MEDIA: { file: string; alt: string; caption?: string }[] = [
  { file: 'hero-altar.jpg', alt: 'The high altar of the chapel of Our Lady of the Blessed Sacrament' },
  { file: 'park-morning.jpg', alt: 'Morning light through the trees in the park across from the chapel' },
  { file: 'community-all-saints.jpg', alt: 'Children dressed as their patron saints with the priest' },
  { file: 'community-fete.jpg', alt: 'Parish fête stalls on the chapel lawn' },
  { file: 'community-cook-off.jpg', alt: 'Parishioners cooking together in the hall under flags of many nations' },
  { file: 'community-advent.jpg', alt: 'Decorating the Christmas tree in the hall' },
  { file: 'school.jpg', alt: 'Pupils in red blazers with their priest and teachers on the chapel steps' },
  { file: 'open-letter-cover.jpg', alt: 'Cover of Open Letter to Confused Catholics by Archbishop Marcel Lefebvre' },
]

for (const item of MEDIA) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: item.file } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) {
    mediaIds[item.file] = existing.docs[0].id
    continue
  }
  const doc = await payload.create({
    collection: 'media',
    data: { alt: item.alt, caption: item.caption },
    filePath: path.resolve(dirname, 'media', item.file),
    context,
  })
  mediaIds[item.file] = doc.id
  log(`uploaded ${item.file}`)
}

// --- Roles -----------------------------------------------------------------

for (const role of roles) {
  const existing = await payload.find({ collection: 'roles', where: { name: { equals: role.name } }, limit: 1 })
  if (existing.docs[0]) continue
  await payload.create({ collection: 'roles', data: role, context })
  log(`created role "${role.name}"`)
}

// --- Globals ---------------------------------------------------------------

// Site settings only need saving once so the defaults are stored.
const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
if (!settings.updatedAt) {
  await payload.updateGlobal({ slug: 'site-settings', data: {}, context })
  log('saved site settings')
}

const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0 })
if (!schedule.masses?.length) {
  await payload.updateGlobal({ slug: 'mass-schedule', data: { ...massSchedule, _status: 'published' }, context })
  log('published Mass schedule')
}

const homePage = await payload.findGlobal({ slug: 'home-page', depth: 0 })
if (!homePage.updatedAt) {
  await payload.updateGlobal({ slug: 'home-page', data: { ...home(mediaIds), _status: 'published' }, context })
  log('published home page')
}

// --- Posts -----------------------------------------------------------------

const editorConfig = await editorConfigFactory.default({ config: payload.config })

for (const post of posts) {
  const existing = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1 })
  if (existing.docs[0]) continue

  const html = await fs.readFile(path.resolve(dirname, 'content', post.htmlFile), 'utf8')
  const content = convertHTMLToLexical({ editorConfig, html, JSDOM })

  await payload.create({
    collection: 'posts',
    data: {
      title: post.title,
      slug: post.slug,
      generateSlug: false,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category,
      publishedAt: post.publishedAt,
      coverImage: post.coverImage ? mediaIds[post.coverImage] : undefined,
      content,
      meta: { title: post.metaTitle, description: post.metaDescription },
      _status: 'published',
    },
    context,
  })
  log(`published post "${post.title}"`)
}

// --- First admin (optional) ----------------------------------------------

const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env
if (SEED_ADMIN_EMAIL && SEED_ADMIN_PASSWORD) {
  const existing = await payload.find({ collection: 'users', where: { email: { equals: SEED_ADMIN_EMAIL } }, limit: 1 })
  if (!existing.docs[0]) {
    await payload.create({
      collection: 'users',
      data: { name: 'Administrator', email: SEED_ADMIN_EMAIL, password: SEED_ADMIN_PASSWORD, superAdmin: true },
      context,
    })
    log(`created super admin ${SEED_ADMIN_EMAIL}`)
  }
}

log('done')
process.exit(0)
