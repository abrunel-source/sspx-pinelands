import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { getServerSideURL } from '@/lib/url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerSideURL()
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/news`, changeFrequency: 'weekly', priority: 0.7 },
  ]
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
      limit: 1000,
      pagination: false,
    })
    for (const post of docs) {
      entries.push({ url: `${base}/news/${post.slug}`, lastModified: post.updatedAt, priority: 0.6 })
    }
  } catch {
    // Database unavailable: return the static pages only.
  }
  return entries
}
