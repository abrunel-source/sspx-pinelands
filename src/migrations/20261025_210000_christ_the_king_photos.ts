import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

import { posts } from '../seed/data'
import { PROCESSION_PHOTOS, withPhotos, wordsOf } from '../seed/procession'

// Content only, no schema change: five more photos of the Christ the King
// procession, placed inside its article. A migration runs exactly once.

const SLUG = 'christ-the-king-procession-2026'
const context = () => ({ disableRevalidate: true })

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const mediaIds: Record<string, number> = {}
  for (const photo of PROCESSION_PHOTOS) {
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

  const [post] = (
    await payload.find({ collection: 'posts', where: { slug: { equals: SLUG } }, limit: 1, depth: 0, req })
  ).docs
  if (!post) return

  const html = await fs.readFile(
    path.resolve(process.cwd(), 'src/seed/content', posts.find((p) => p.slug === SLUG)!.htmlFile),
    'utf8',
  )
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const original = convertHTMLToLexical({ editorConfig, html, JSDOM })

  // Only when the words are still as published, so an editor's changes are never undone.
  if (wordsOf(post.content) !== wordsOf(original)) {
    payload.logger.info('[migrate] Christ the King article was edited; photos added to the media library only')
    return
  }
  await payload.update({
    collection: 'posts',
    id: post.id,
    data: { content: withPhotos(original, mediaIds), _status: 'published' },
    context: context(),
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content stays: editors can remove the photos in the admin.
}
