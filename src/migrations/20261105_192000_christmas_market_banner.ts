import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Content only, no schema change: the Christmas Market banner (poster of
// 5 December 2026), banner permissions for the starter roles, and the
// market's hours on its event. A migration runs exactly once per database.

const context = () => ({ disableRevalidate: true })
const POSTER = 'christmas-market-2026.jpg'

// Times are Cape Town (UTC+2): Saturday 5 December 2026, 09:30–17:00.
const STARTS = '2026-12-05T07:30:00.000Z'
const ENDS = '2026-12-05T15:00:00.000Z'
const HELP =
  'Donations and volunteers for setting up and taking down are still needed: please speak to Chantal or Nirrie after Mass.'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const [existing] = (
    await payload.find({ collection: 'media', where: { filename: { equals: POSTER } }, limit: 1, depth: 0, req })
  ).docs
  const poster =
    existing ??
    (await payload.create({
      collection: 'media',
      data: {
        alt: 'Christmas Market poster: Saturday 5 December 2026, 9:30am to 5pm, 2A St Stephens Road, off Forest Drive, Pinelands, opposite Oumeul Café',
      },
      filePath: path.resolve(process.cwd(), 'src/seed/media', POSTER),
      context: context(),
      req,
    }))

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
  const banner = await payload.findGlobal({ slug: 'announcement-banner', depth: 0, req })
  if (!banner.heading) {
    await payload.updateGlobal({
      slug: 'announcement-banner',
      data: {
        enabled: true,
        theme: 'christmas',
        hideAfter: '2026-12-05T10:00:00.000Z',
        eyebrow: 'All are welcome',
        heading: 'Christmas Market',
        startsAt: STARTS,
        endsAt: ENDS,
        place: '2A St Stephens Road, off Forest Drive, Pinelands · opposite Oumeul Café',
        text: `Join us at the chapel for our annual Christmas Market. ${HELP}`,
        poster: poster.id,
        buttonLabel: settings.directionsUrl ? 'Get directions' : 'Offer to help',
        buttonLink: settings.directionsUrl || '/#contact',
        secondButtonLabel: settings.directionsUrl ? 'Offer to help' : undefined,
        secondButtonLink: settings.directionsUrl ? '/#contact' : undefined,
      },
      context: context(),
      req,
    })
  }

  // The starter roles that manage home page content can manage the banner too.
  for (const name of ['Administrator', 'Editor']) {
    const [role] = (await payload.find({ collection: 'roles', where: { name: { equals: name } }, limit: 1, depth: 0, req })).docs
    if (!role) continue
    await payload.update({
      collection: 'roles',
      id: role.id,
      data: { permissions: { ...role.permissions, announcementBanner: { read: true, update: true } } },
      context: context(),
      req,
    })
  }

  // The market's hours, now on the poster, unless the event was edited.
  const [event] = (
    await payload.find({ collection: 'events', where: { title: { equals: 'Christmas Market' } }, limit: 1, depth: 0, req })
  ).docs
  if (event && event.startsAt === '2026-12-04T22:00:00.000Z' && !event.endsAt) {
    await payload.update({
      collection: 'events',
      id: event.id,
      data: { startsAt: STARTS, endsAt: ENDS, summary: `Our annual Christmas Market. All are welcome! ${HELP}`, _status: 'published' },
      context: context(),
      req,
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content stays: editors can change or switch off the banner in the admin.
}
