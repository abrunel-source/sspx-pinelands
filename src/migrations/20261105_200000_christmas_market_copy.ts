import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Content only, no schema change: the organisers' copy for the Christmas
// Market banner and event. Only replaces the text set by the previous
// migration, so nothing an editor has changed is undone. Runs once.

const context = () => ({ disableRevalidate: true })

const PREVIOUS_TEXT =
  'Join us at the chapel for our annual Christmas Market. Donations and volunteers are still needed, for the day itself and for setting up and taking down: please speak to Chantal or Nirrie after Mass.'
const PREVIOUS_SUMMARY =
  'Our annual Christmas Market. All are welcome! Donations and volunteers are still needed, for the day itself and for setting up and taking down: please speak to Chantal or Nirrie after Mass.'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const banner = await payload.findGlobal({ slug: 'announcement-banner', depth: 0, req })
  if (banner.text === PREVIOUS_TEXT) {
    await payload.updateGlobal({
      slug: 'announcement-banner',
      data: {
        eyebrow: 'Our Lady of the Blessed Sacrament presents',
        place: '2A St Stephens Road, Pinelands · opposite Ou Meul Bakery',
        text: [
          'A newly established market in Pinelands: festive, cosy and family-friendly, held once a year. We are passionate about hosting local traders and crafters from the community, so come and support local crafters and homemade goodies.',
          'Light meals from the Sacred Heart Café. Tasty home-baked goods, biltong, a fresh vegetable stall, thrift clothing, plants, beautiful decoupage items, vintage items and more, and an art expo to discover beautiful artwork and local creativity.',
          'Free entry · Cash and card accepted · Support small businesses',
        ].join('\n'),
      },
      context: context(),
      req,
    })
  }

  const [event] = (
    await payload.find({ collection: 'events', where: { title: { equals: 'Christmas Market' } }, limit: 1, depth: 0, req })
  ).docs
  if (event?.summary === PREVIOUS_SUMMARY) {
    await payload.update({
      collection: 'events',
      id: event.id,
      data: {
        summary:
          'A festive, family-friendly market of local traders and crafters: light meals from the Sacred Heart Café, home-baked goods, an art expo and more. Free entry; cash and card accepted.',
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
