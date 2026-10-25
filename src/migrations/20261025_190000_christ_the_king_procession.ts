import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

import { PROCESSION_FOCAL_POINT, PROCESSION_GALLERY_ITEM, PROCESSION_PHOTO_ALT, posts } from '../seed/data'
import { withPhotos } from '../seed/procession'

// Content only, no schema change: the Christ the King procession of 25 October
// 2026, as a news post and the first photo of the parish life gallery.
// A migration runs exactly once per database.

const FILE = 'christ-the-king-procession.jpg'
const SLUG = 'christ-the-king-procession-2026'
const context = () => ({ disableRevalidate: true })

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const post = posts.find((p) => p.slug === SLUG)!

  const [existingPhoto] = (
    await payload.find({ collection: 'media', where: { filename: { equals: FILE } }, limit: 1, depth: 0, req })
  ).docs
  const photo =
    existingPhoto ??
    (await payload.create({
      collection: 'media',
      data: { alt: PROCESSION_PHOTO_ALT, ...PROCESSION_FOCAL_POINT },
      filePath: path.resolve(process.cwd(), 'src/seed/media', FILE),
      context: context(),
      req,
    }))

  const { totalDocs: hasPost } = await payload.count({ collection: 'posts', where: { slug: { equals: SLUG } }, req })
  if (!hasPost) {
    const html = await fs.readFile(path.resolve(process.cwd(), 'src/seed/content', post.htmlFile), 'utf8')
    const editorConfig = await editorConfigFactory.default({ config: payload.config })
    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: SLUG,
        generateSlug: false,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        coverImage: photo.id,
        // The photos inside the article are added by the next migration.
        content: withPhotos(convertHTMLToLexical({ editorConfig, html, JSDOM }), {}),
        meta: { title: post.metaTitle, description: post.metaDescription },
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  // Add the photo to the front of the gallery, keeping every existing photo.
  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, req })
  const gallery = home.community?.gallery ?? []
  const imageId = (image: unknown) => (typeof image === 'object' && image ? (image as { id: number }).id : image)
  if (home.community && !gallery.some((item) => imageId(item.image) === photo.id)) {
    await payload.updateGlobal({
      slug: 'home-page',
      data: {
        community: { ...home.community, gallery: [{ image: photo.id, ...PROCESSION_GALLERY_ITEM }, ...gallery] },
        _status: 'published',
      },
      context: context(),
      req,
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content stays: editors can remove the post or photo in the admin.
}
