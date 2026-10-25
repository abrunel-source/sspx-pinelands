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
 *
 * Deployments run it with SEED_IF_EMPTY=1 (see `npm run ci`): it then only
 * runs on a brand-new database, so content editors later delete is never
 * brought back by the next deploy.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { getPayload } from 'payload'

import {
  PROCESSION_FOCAL_POINT,
  PROCESSION_PHOTO_ALT,
  SCHOOL_PHOTO_ALT,
  home,
  massSchedule,
  posts,
  roles,
} from './data'
import { PROCESSION_PHOTOS, withPhotos } from './procession'

const dirname = path.dirname(fileURLToPath(import.meta.url))
// A fresh context for every call: Payload's storage plugin keeps a "skip
// upload" flag on the request context, and a shared object would leak it
// from one upload into the next, silently skipping every photo after the first.
const context = () => ({ disableRevalidate: true })

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

const MEDIA: { file: string; alt: string; caption?: string; focalX?: number; focalY?: number }[] = [
  { file: 'hero-altar.jpg', alt: 'The high altar of the chapel of Our Lady of the Blessed Sacrament' },
  { file: 'park-morning.jpg', alt: 'Morning light through the trees in the park across from the chapel' },
  { file: 'community-all-saints.jpg', alt: 'Children dressed as their patron saints with the priest' },
  { file: 'community-fete.jpg', alt: 'Parish fête stalls on the chapel lawn' },
  { file: 'community-cook-off.jpg', alt: 'Parishioners cooking together in the hall under flags of many nations' },
  { file: 'community-advent.jpg', alt: 'Decorating the Christmas tree in the hall' },
  { file: 'school.jpg', alt: 'Pupils in red blazers with their priest and teachers on the chapel steps' },
  { file: 'school-distinctions.jpg', alt: SCHOOL_PHOTO_ALT },
  { file: 'christ-the-king-procession.jpg', alt: PROCESSION_PHOTO_ALT, ...PROCESSION_FOCAL_POINT },
  ...PROCESSION_PHOTOS,
  { file: 'open-letter-cover.jpg', alt: 'Cover of Open Letter to Confused Catholics by Archbishop Marcel Lefebvre' },
]

// --- Where photos are stored ----------------------------------------------
// On Vercel the file system is temporary, so uploads only survive in Blob storage.

const onVercel =
  Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) ||
  process.cwd().startsWith('/vercel/')
const blobToken = process.env.BLOB_READ_WRITE_TOKEN || ''
const blobStoreId = blobToken.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase()
const blobBase = blobStoreId
  ? process.env.STORAGE_VERCEL_BLOB_BASE_URL || `https://${blobStoreId}.public.blob.vercel-storage.com`
  : null
const canUpload = !onVercel || Boolean(blobBase)

if (blobBase) log(`photos are stored in Vercel Blob (store ${blobStoreId})`)
else if (onVercel) {
  payload.logger.warn(
    `[seed] BLOB_READ_WRITE_TOKEN is not available to this ${process.env.VERCEL_ENV || ''} build: skipping photos. ` +
      'In Vercel, connect the Blob store to this environment (Storage tab), then redeploy.',
  )
} else log('photos are stored on the local disk (./media)')

/** True if a media record's file is actually present in Blob storage. */
const inBlob = async (doc: { filename?: string | null; prefix?: string | null }) => {
  if (!blobBase || !doc.filename) return true
  const key = [doc.prefix, doc.filename].filter(Boolean).join('/')
  try {
    const res = await fetch(`${blobBase}/${encodeURIComponent(key).replace(/%2F/g, '/')}`, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

const findSeedPhoto = async (file: string) =>
  (await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1, depth: 0 })).docs[0]

if (process.env.SEED_IF_EMPTY) {
  // Run when the photos were never loaded (a new database, or one set up
  // before Blob storage was connected), or when Blob storage is missing files.
  const media = await payload.count({ collection: 'media' })
  let missing = 0
  if (media.totalDocs > 0 && blobBase) {
    for (const item of MEDIA) {
      const doc = await findSeedPhoto(item.file)
      if (doc && !(await inBlob(doc))) missing++
    }
  }
  if (media.totalDocs > 0 && missing === 0) {
    log('media library already has photos, skipping')
    process.exit(0)
  }
  log(missing ? `${missing} photo(s) missing from storage, repairing` : 'no photos yet, loading the starting content')
}

// --- Media -----------------------------------------------------------------

const mediaIds: Record<string, number> = {}

for (const item of canUpload ? MEDIA : []) {
  const filePath = path.resolve(dirname, 'media', item.file)
  const existing = await findSeedPhoto(item.file)
  if (existing) {
    mediaIds[item.file] = existing.id
    // The record exists but its file never reached storage: upload it again,
    // keeping the same record so pages that use the photo stay linked.
    if (!(await inBlob(existing))) {
      try {
        await payload.update({ collection: 'media', id: existing.id, data: {}, filePath, overwriteExistingFiles: true, context: context() })
        log(`re-uploaded ${item.file}`)
      } catch (err) {
        payload.logger.warn({ err }, `[seed] could not re-upload ${item.file}`)
      }
    }
    continue
  }
  // A failed upload is reported but does not stop the deploy.
  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: item.alt, caption: item.caption, focalX: item.focalX, focalY: item.focalY },
      filePath,
      context: context(),
    })
    mediaIds[item.file] = doc.id
    log(`uploaded ${item.file}`)
  } catch (err) {
    payload.logger.warn({ err }, `[seed] could not upload ${item.file}`)
  }
}

// --- Roles -----------------------------------------------------------------

for (const role of roles) {
  const existing = await payload.find({ collection: 'roles', where: { name: { equals: role.name } }, limit: 1 })
  if (existing.docs[0]) continue
  await payload.create({ collection: 'roles', data: role, context: context() })
  log(`created role "${role.name}"`)
}

// --- Globals ---------------------------------------------------------------

// Site settings only need saving once so the defaults are stored.
const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
if (!settings.updatedAt) {
  await payload.updateGlobal({ slug: 'site-settings', data: {}, context: context() })
  log('saved site settings')
}

const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0 })
if (!schedule.masses?.length) {
  await payload.updateGlobal({ slug: 'mass-schedule', data: { ...massSchedule, _status: 'published' }, context: context() })
  log('published Mass schedule')
}

const homePage = await payload.findGlobal({ slug: 'home-page', depth: 0 })
if (!homePage.updatedAt) {
  await payload.updateGlobal({ slug: 'home-page', data: { ...home(mediaIds), _status: 'published' }, context: context() })
  log('published home page')
} else if (Object.keys(mediaIds).length) {
  // The home page was already saved (e.g. edited before the photos existed):
  // only fill in photos that are still empty, keeping every edit.
  const seeded = home(mediaIds)
  const next = structuredClone(homePage)
  let changed = false
  for (const section of ['hero', 'visit', 'school'] as const) {
    const target = next[section] as { image?: unknown } | undefined
    if (target && !target.image && seeded[section]?.image) {
      target.image = seeded[section]!.image
      changed = true
    }
  }
  if (next.community && !next.community.gallery?.length && seeded.community?.gallery) {
    next.community.gallery = seeded.community.gallery
    changed = true
  }
  if (changed) {
    const { id: _id, updatedAt: _u, createdAt: _c, globalType: _g, ...data } = next as typeof next & {
      globalType?: string
    }
    await payload.updateGlobal({ slug: 'home-page', data: { ...data, _status: 'published' }, context: context() })
    log('added missing photos to the home page')
  }
}

// --- Posts -----------------------------------------------------------------

const editorConfig = await editorConfigFactory.default({ config: payload.config })

for (const post of posts) {
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: post.slug } },
    limit: 1,
    depth: 0,
  })
  const found = existing.docs[0]
  if (found) {
    // Created before the photos existed: add the cover now, keeping any edits.
    const cover = post.coverImage ? mediaIds[post.coverImage] : undefined
    if (cover && !found.coverImage) {
      await payload.update({ collection: 'posts', id: found.id, data: { coverImage: cover }, context: context() })
      log(`added cover photo to "${post.title}"`)
    }
    continue
  }

  const html = await fs.readFile(path.resolve(dirname, 'content', post.htmlFile), 'utf8')
  const content = withPhotos(convertHTMLToLexical({ editorConfig, html, JSDOM }), mediaIds)

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
    context: context(),
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
      context: context(),
    })
    log(`created super admin ${SEED_ADMIN_EMAIL}`)
  }
}

log('done')
process.exit(0)
