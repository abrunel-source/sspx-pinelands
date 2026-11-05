import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { PARISH_FETE_PHOTO } from '../seed/data'

// Content only, no schema change: a new photo for "Parish fête" in the parish
// life gallery. Only replaces the old photo and caption where they are still
// in place, so editors' changes are kept. A migration runs exactly once.

const context = () => ({ disableRevalidate: true })

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const [existing] = (
    await payload.find({ collection: 'media', where: { filename: { equals: PARISH_FETE_PHOTO.file } }, limit: 1, depth: 0, req })
  ).docs
  const photo =
    existing ??
    (await payload.create({
      collection: 'media',
      data: { alt: PARISH_FETE_PHOTO.alt, focalX: PARISH_FETE_PHOTO.focalX, focalY: PARISH_FETE_PHOTO.focalY },
      filePath: path.resolve(process.cwd(), 'src/seed/media', PARISH_FETE_PHOTO.file),
      context: context(),
      req,
    }))

  const [oldPhoto] = (
    await payload.find({ collection: 'media', where: { filename: { equals: 'community-fete.jpg' } }, limit: 1, depth: 0, req })
  ).docs
  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, req })
  const gallery = home.community?.gallery ?? []
  const imageId = (image: unknown) => (typeof image === 'object' && image ? (image as { id: number }).id : image)
  let changed = false
  const updated = gallery.map((item) => {
    if (!oldPhoto || imageId(item.image) !== oldPhoto.id) return item
    changed = true
    return {
      ...item,
      image: photo.id,
      caption: item.caption === 'Stalls on the chapel lawn' ? PARISH_FETE_PHOTO.caption : item.caption,
    }
  })
  if (changed && home.community) {
    await payload.updateGlobal({
      slug: 'home-page',
      data: { community: { ...home.community, gallery: updated }, _status: 'published' },
      context: context(),
      req,
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content stays: editors can change the gallery in the admin.
}
