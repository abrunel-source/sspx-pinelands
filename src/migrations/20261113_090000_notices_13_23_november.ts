import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

// Content only, no schema change: the chapel notices of 13–23 November 2026
// as a new post, this weekend's notice bar, and the coming events. Nothing an
// editor has changed is touched. A migration runs exactly once per database.

const context = () => ({ disableRevalidate: true })
const SLUG = 'chapel-notices-13-23-november-2026'

const PREVIOUS_NOTICE =
  'This weekend: First Friday Mass and Benediction, Fri 6 Nov 18:45 · Sung Mass, Sun 8 Nov 9:00, then refreshments in the hall'
const PREVIOUS_RETREAT_SUMMARY =
  'Preached by Frs Esposito and Ginoux. Registration forms are at the back of the chapel; register and book flights early for cheaper fares.'

// Times are Cape Town (UTC+2).
const EVENTS = [
  {
    title: 'Rosary Rally in the park',
    startsAt: '2026-11-14T06:00:00.000Z',
    location: 'The park in front of the chapel',
    summary: 'The Rosary in the park in front of the chapel, followed by Holy Mass at 08:30. Confessions from 07:30.',
  },
  {
    title: 'Pop-up market',
    startsAt: '2026-11-14T08:00:00.000Z',
    endsAt: '2026-11-14T12:00:00.000Z',
    summary: 'Good quality second-hand goods on sale.',
  },
  {
    title: 'Recital: Astrid Bohm and Jan Hugo',
    startsAt: '2026-11-21T16:00:00.000Z',
    location: 'Old Chapel Music Room',
    summary:
      'Mezzo-soprano Astrid Bohm, accompanied by Jan Hugo on piano, in music by Schubert, Strauss and Mahler. Tickets R180 on Quicket. Bring family and friends.',
  },
  {
    title: '12-hour Advent Adoration',
    startsAt: '2026-11-28T17:30:00.000Z',
    endsAt: '2026-11-29T06:45:00.000Z',
    summary:
      'From 19:30 on Saturday to 08:45 on Sunday: let us prepare for Advent by spending time with Our Lord in Adoration. The sign-up schedule is at the back of the chapel.',
  },
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { totalDocs: hasPost } = await payload.count({ collection: 'posts', where: { slug: { equals: SLUG } }, req })
  if (!hasPost) {
    const html = await fs.readFile(path.resolve(process.cwd(), 'src/seed/content/chapel-notices-2026-11-13.html'), 'utf8')
    const editorConfig = await editorConfigFactory.default({ config: payload.config })
    await payload.create({
      collection: 'posts',
      data: {
        title: 'Chapel notices and Mass times: 13–23 November',
        slug: SLUG,
        generateSlug: false,
        excerpt:
          'The Rosary in the park and a pop-up market on Saturday, refreshments and the repository on Sunday, a recital on 21 November and Advent Adoration on 28 November.',
        category: 'announcement',
        publishedAt: '2026-11-13T06:00:00.000Z',
        content: convertHTMLToLexical({ editorConfig, html, JSDOM }),
        meta: {
          title: 'Chapel notices, 13–23 November 2026 · SSPX Cape Town',
          description: 'Mass times for 13–23 November 2026 at Our Lady of the Blessed Sacrament, Pinelands, with the chapel notices.',
        },
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  for (const event of EVENTS) {
    const { totalDocs } = await payload.count({ collection: 'events', where: { title: { equals: event.title } }, req })
    if (!totalDocs) {
      await payload.create({ collection: 'events', data: { ...event, _status: 'published' }, context: context(), req })
    }
  }

  const [retreat] = (
    await payload.find({ collection: 'events', where: { title: { equals: 'Ignatian retreats' } }, limit: 1, depth: 0, req })
  ).docs
  if (retreat?.summary === PREVIOUS_RETREAT_SUMMARY) {
    await payload.update({
      collection: 'events',
      id: retreat.id,
      data: {
        summary: 'Facilitated by Frs Esposito and Ginoux. You can still register: forms are at the back of the chapel.',
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0, req })
  if (schedule.notice === PREVIOUS_NOTICE) {
    await payload.updateGlobal({
      slug: 'mass-schedule',
      data: {
        notice: 'This weekend: Rosary in the park Sat 8:00, Mass 8:30, pop-up market 10:00–14:00 · Sung Mass Sun 9:00, then refreshments',
        noticeUntil: '2026-11-15T10:00:00.000Z',
        _status: 'published',
      },
      context: context(),
      req,
    })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content stays: editors can change it in the admin.
}
