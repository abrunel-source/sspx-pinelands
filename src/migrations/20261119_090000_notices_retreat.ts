import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

// Content only, no schema change: the chapel notices of 20 November –
// 2 December 2026, a post for the Ignatian retreat (14–19 December) with its
// flyer, and the matching events and notice bar. Nothing an editor has changed
// is touched. A migration runs exactly once per database.

const context = () => ({ disableRevalidate: true })
const read = (file: string) => fs.readFile(path.resolve(process.cwd(), 'src/seed/content', file), 'utf8')
const FLYER = 'ignatian-retreat-2026-flyer.jpg'

const PREVIOUS = {
  notice: 'This weekend: Rosary in the park Sat 8:00, Mass 8:30, pop-up market 10:00–14:00 · Sung Mass Sun 9:00, then refreshments',
  adoration:
    'From 19:30 on Saturday to 08:45 on Sunday: let us prepare for Advent by spending time with Our Lord in Adoration. The sign-up schedule is at the back of the chapel.',
  retreat: 'Facilitated by Frs Esposito and Ginoux. You can still register: forms are at the back of the chapel.',
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const toLexical = (html: string) => convertHTMLToLexical({ editorConfig, html, JSDOM })

  const [existingFlyer] = (
    await payload.find({ collection: 'media', where: { filename: { equals: FLYER } }, limit: 1, depth: 0, req })
  ).docs
  const flyer =
    existingFlyer ??
    (await payload.create({
      collection: 'media',
      data: {
        alt: 'Flyer: The Spiritual Exercises according to St Ignatius of Loyola, 14 to 19 December 2026, Saint Padre Pio Retreat Centre, Pretoria, open to all adults, preached by Fr Esposito and Fr Ginoux, R2700 per person',
      },
      filePath: path.resolve(process.cwd(), 'src/seed/media', FLYER),
      context: context(),
      req,
    }))

  const posts = [
    {
      slug: 'chapel-notices-20-november-2-december-2026',
      title: 'Chapel notices and Mass times: 20 November – 2 December',
      file: 'chapel-notices-2026-11-20.html',
      category: 'announcement' as const,
      publishedAt: '2026-11-19T06:00:00.000Z',
      excerpt:
        'Refreshments, the repository and catechism after Sunday Mass, all-night Adoration before the First Sunday of Advent, and Mass times until 2 December.',
      meta: {
        title: 'Chapel notices, 20 November – 2 December 2026 · SSPX Cape Town',
        description: 'Mass times for 20 November – 2 December 2026 at Our Lady of the Blessed Sacrament, Pinelands, with the chapel notices.',
      },
    },
    {
      slug: 'ignatian-retreat-2026',
      title: 'The Spiritual Exercises of St Ignatius: 14–19 December',
      file: 'ignatian-retreat-2026.html',
      category: 'announcement' as const,
      // After the notices, so the post with the flyer leads the home page news.
      publishedAt: '2026-11-19T06:30:00.000Z',
      coverImage: flyer.id,
      excerpt:
        'A five-day Ignatian retreat in Pretoria, open to all adults, preached by Frs Esposito and Ginoux. Registration and payment close on 30 November.',
      meta: {
        title: 'Ignatian retreat, 14–19 December 2026 · SSPX Cape Town',
        description:
          'The Spiritual Exercises of St Ignatius, 14–19 December 2026 at the Padre Pio Retreat Centre, Pretoria. Open to all adults; R2,700 per person; register by 30 November.',
      },
    },
  ]
  for (const post of posts) {
    const { totalDocs } = await payload.count({ collection: 'posts', where: { slug: { equals: post.slug } }, req })
    if (totalDocs) continue
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

  const adoration = await findEvent('12-hour Advent Adoration')
  if (adoration?.summary === PREVIOUS.adoration) {
    await payload.update({
      collection: 'events',
      id: adoration.id,
      data: {
        title: 'All-night Advent Adoration',
        summary:
          'From 19:30 on Saturday to 08:45 on Sunday: let us prepare for Advent by spending time with Our Lord in Adoration. The sign-up schedule is at the back of the chapel, and there will be refreshments in the hall.',
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  const retreat = await findEvent('Ignatian retreats')
  if (retreat?.summary === PREVIOUS.retreat) {
    await payload.update({
      collection: 'events',
      id: retreat.id,
      data: {
        title: 'Ignatian retreat',
        location: 'Padre Pio Retreat Centre, Rietvalleirand, Pretoria',
        summary:
          'The Spiritual Exercises, open to all adults, preached by Frs Esposito and Ginoux. R2,700 per person; register and pay by 30 November (forms at the back of the chapel).',
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0, req })
  if (schedule.notice === PREVIOUS.notice) {
    await payload.updateGlobal({
      slug: 'mass-schedule',
      data: {
        notice: 'This weekend: Sung Mass Sun 22 Nov 9:00, then refreshments · Sat 28 Nov: all-night Adoration from 19:30',
        noticeUntil: '2026-11-22T10:00:00.000Z',
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
