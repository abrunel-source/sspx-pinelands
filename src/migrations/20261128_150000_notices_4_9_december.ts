import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

// Content only, no schema change: the chapel notices and Mass times of
// 4–9 December 2026, the Gaudete Sunday braai event, the notice bar for the
// First Friday and the Immaculate Conception, and the priest's name in the
// contact section. Nothing an editor has changed is touched. A migration runs
// exactly once per database.

const context = () => ({ disableRevalidate: true })
const read = (file: string) => fs.readFile(path.resolve(process.cwd(), 'src/seed/content', file), 'utf8')

const PREVIOUS = {
  notice: 'This weekend: Sung Mass Sun 22 Nov 9:00, then refreshments · Sat 28 Nov: all-night Adoration from 19:30',
  contactIntro:
    'For baptisms, weddings, confessions by appointment, sick calls or any question about the faith, send us a message and the priest will reply.',
}

const GAUDETE = {
  title: 'Gaudete Sunday braai and family day',
  // 10:30 in Cape Town (UTC+2), after the Sung Mass.
  startsAt: '2026-12-13T08:30:00.000Z',
  summary:
    'A braai and family day after Holy Mass on Gaudete Sunday, with a competition for the best braai side, savoury or sweet. All are welcome.',
}

const SPORTS_DAY_SUMMARY = 'Hosted in Cape Town. Save the date: planning is under way.'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const toLexical = (html: string) => convertHTMLToLexical({ editorConfig, html, JSDOM })

  const post = {
    slug: 'chapel-notices-4-9-december-2026',
    title: 'Chapel notices and Mass times: 4–9 December',
    file: 'chapel-notices-2026-12-04.html',
    category: 'announcement' as const,
    publishedAt: '2026-11-28T13:00:00.000Z',
    excerpt:
      'First Friday and First Saturday Masses with Benediction, the Second Sunday of Advent, no Mass on the Immaculate Conception, and the Gaudete Sunday braai.',
    meta: {
      title: 'Chapel notices, 4–9 December 2026 · SSPX Cape Town',
      description: 'Mass times for 4–9 December 2026 at Our Lady of the Blessed Sacrament, Pinelands, with the chapel notices.',
    },
  }
  const { totalDocs: postExists } = await payload.count({ collection: 'posts', where: { slug: { equals: post.slug } }, req })
  if (!postExists) {
    const { file, ...data } = post
    await payload.create({
      collection: 'posts',
      data: { ...data, generateSlug: false, content: toLexical(await read(file)), _status: 'published' },
      context: context(),
      req,
    })
  }

  const findEvent = async (title: string) =>
    (await payload.find({ collection: 'events', where: { title: { equals: title } }, limit: 1, depth: 0, req })).docs[0]

  if (!(await findEvent(GAUDETE.title))) {
    await payload.create({
      collection: 'events',
      data: { ...GAUDETE, _status: 'published' },
      context: context(),
      req,
    })
  }

  // The Sports Day event already exists: never duplicate it, and only fill in
  // the summary if it has none.
  const sportsDay = await findEvent('SSPX Annual Sports Day')
  if (sportsDay && !sportsDay.summary?.trim()) {
    await payload.update({
      collection: 'events',
      id: sportsDay.id,
      data: { summary: SPORTS_DAY_SUMMARY, _status: 'published' },
      context: context(),
      req,
    })
  }

  const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0, req })
  if (schedule.notice === PREVIOUS.notice) {
    await payload.updateGlobal({
      slug: 'mass-schedule',
      data: {
        notice: 'First Friday 4 Dec: Low Mass and Benediction 18:45 · No Mass on Tue 8 Dec (Immaculate Conception)',
        noticeUntil: '2026-12-08T10:00:00.000Z',
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  const home = await payload.findGlobal({ slug: 'home-page', depth: 0, req })
  const intro = home.contact?.intro
  if (!intro?.trim() || intro === PREVIOUS.contactIntro) {
    await payload.updateGlobal({
      slug: 'home-page',
      data: {
        contact: {
          ...home.contact,
          intro:
            'For baptisms, weddings, confessions by appointment, sick calls or any question about the faith, send us a message and our priest, Fr Otto Keiser, will reply.',
        },
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
