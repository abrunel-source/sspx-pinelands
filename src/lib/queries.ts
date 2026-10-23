import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Event, Feast, HomePage, MassSchedule, Post, SiteSetting } from '@/payload-types'

import { getPayloadClient } from './payload'

// All reads go through the server-side Local API. Drafts are only returned
// while an authenticated editor has preview (draft) mode switched on.

const isDraft = async () => (await draftMode()).isEnabled

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 0 })
})

export const getMassSchedule = cache(async (): Promise<MassSchedule> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'mass-schedule', depth: 0, draft: await isDraft() })
})

export const getHomePage = cache(async (): Promise<HomePage> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home-page', depth: 1, draft: await isDraft() })
})

export const getNextEvent = cache(async (): Promise<Event | null> => {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const { docs } = await payload.find({
    collection: 'events',
    draft,
    depth: 0,
    limit: 1,
    sort: 'startsAt',
    where: {
      and: [
        { startsAt: { greater_than_equal: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() } },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
  })
  return docs[0] ?? null
})

export const getPosts = cache(async ({ limit = 12, page = 1 }: { limit?: number; page?: number } = {}) => {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    page,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: true,
      author: true,
      coverImage: true,
    },
  })
})

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const payload = await getPayloadClient()
  const draft = await isDraft()
  const { docs } = await payload.find({
    collection: 'posts',
    draft,
    depth: 2,
    limit: 1,
    where: {
      and: [{ slug: { equals: slug } }, ...(draft ? [] : [{ _status: { equals: 'published' } }])],
    },
  })
  return docs[0] ?? null
})

/** The next feasts from today (Cape Town time) for "Feasts in the coming days". */
export const getUpcomingFeasts = cache(async (limit = 4): Promise<Feast[]> => {
  const payload = await getPayloadClient()
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date())
  const { docs } = await payload.find({
    collection: 'feasts',
    depth: 0,
    limit,
    sort: 'date',
    where: { date: { greater_than_equal: `${today}T00:00:00+02:00` } },
  })
  return docs
})
