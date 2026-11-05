import fs from 'fs/promises'
import path from 'path'

import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

import { WEEK_NOTICE } from '../seed/november-2026'
import { wordsOf } from '../seed/procession'

// Content only, no schema change: the revised chapel notices (6–16 November
// 2026) replace those of 4–9 November in the same post, and the notice bar
// mentions Sunday's refreshments. Nothing an editor has changed is touched.
// A migration runs exactly once per database.

const context = () => ({ disableRevalidate: true })
const SLUG = 'chapel-notices-4-9-november-2026'
const read = (file: string) => fs.readFile(path.resolve(process.cwd(), 'src/seed/content', file), 'utf8')

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  const toLexical = (html: string) => convertHTMLToLexical({ editorConfig, html, JSDOM })

  const [post] = (await payload.find({ collection: 'posts', where: { slug: { equals: SLUG } }, limit: 1, depth: 0, req })).docs
  const original = toLexical(await read('chapel-notices-2026-11-04.html'))
  if (post && wordsOf(post.content) === wordsOf(original)) {
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        title: 'Chapel notices and Mass times: 6–16 November',
        excerpt:
          'First Friday and First Saturday with Benediction, refreshments after Sunday Mass, a second-hand book sale, and Mass times until Monday 16 November.',
        content: toLexical(await read('chapel-notices-2026-11-06.html')),
        meta: {
          title: 'Chapel notices, 6–16 November 2026 · SSPX Cape Town',
          description: 'Mass times for 6–16 November 2026 at Our Lady of the Blessed Sacrament, Pinelands, with the chapel notices.',
        },
        _status: 'published',
      },
      context: context(),
      req,
    })
  }

  const schedule = await payload.findGlobal({ slug: 'mass-schedule', depth: 0, req })
  if (schedule.notice === WEEK_NOTICE.notice) {
    await payload.updateGlobal({
      slug: 'mass-schedule',
      data: {
        notice: 'This weekend: First Friday Mass and Benediction, Fri 6 Nov 18:45 · Sung Mass, Sun 8 Nov 9:00, then refreshments in the hall',
        noticeUntil: '2026-11-08T10:00:00.000Z',
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
