import type { Payload } from 'payload'

// Tops up the liturgical calendar from Missale Meum, an open-source edition of
// the 1962 Roman Missal (https://www.missalemeum.com). Keeps Sundays and
// feasts of the first and second class; skips plain weekdays.

type MissaleDay = { id: string; title: string; colors: string[]; rank: number }

const COLOURS: Record<string, 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black'> = {
  w: 'white',
  r: 'red',
  g: 'green',
  v: 'violet',
  p: 'rose',
  b: 'black',
}

const WINDOW_DAYS = 70

const capeTownDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(date)

const isSunday = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`).getUTCDay() === 0

const isNotable = (day: MissaleDay) =>
  isSunday(day.id) || day.rank === 1 || (day.rank === 2 && !/^feria\b/i.test(day.title))

const fetchYear = async (year: number): Promise<MissaleDay[]> => {
  const res = await fetch(`https://www.missalemeum.com/en/api/v5/calendar/${year}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`Missale Meum returned ${res.status} for ${year}`)
  const data = (await res.json()) as MissaleDay[]
  if (!Array.isArray(data)) throw new Error('Unexpected calendar format')
  return data
}

export const syncFeasts = async (payload: Payload) => {
  const today = capeTownDate(new Date())
  const until = capeTownDate(new Date(Date.now() + WINDOW_DAYS * 86_400_000))
  const years = [...new Set([Number(today.slice(0, 4)), Number(until.slice(0, 4))])]

  const days = (await Promise.all(years.map(fetchYear)))
    .flat()
    .filter((d) => d.id >= today && d.id <= until && isNotable(d))

  // Everything already in the window, so we can update instead of duplicating.
  const { docs: existing } = await payload.find({
    collection: 'feasts',
    depth: 0,
    limit: 500,
    pagination: false,
    where: {
      and: [
        { date: { greater_than_equal: `${today}T00:00:00+02:00` } },
        { date: { less_than_equal: `${until}T23:59:59+02:00` } },
      ],
    },
  })
  const byDay = new Map<string, (typeof existing)[number][]>()
  for (const feast of existing) {
    const key = capeTownDate(new Date(feast.date))
    byDay.set(key, [...(byDay.get(key) ?? []), feast])
  }

  let created = 0
  let updated = 0
  for (const day of days) {
    const colour = COLOURS[day.colors?.[0]] ?? 'white'
    const date = `${day.id}T12:00:00.000Z`
    const onDay = byDay.get(day.id) ?? []

    // A feast an editor added by hand for this day always wins, and replaces
    // the automatic entry for that day.
    if (onDay.some((f) => f.source !== 'auto')) {
      for (const f of onDay.filter((f) => f.source === 'auto')) {
        await payload.delete({ collection: 'feasts', id: f.id, context: { disableRevalidate: true } })
      }
      continue
    }

    const auto = onDay[0]
    if (!auto) {
      await payload.create({ collection: 'feasts', data: { title: day.title, date, colour, source: 'auto' }, context: { disableRevalidate: true } })
      created++
    } else if (auto.title !== day.title || auto.colour !== colour) {
      await payload.update({ collection: 'feasts', id: auto.id, data: { title: day.title, colour, source: 'auto' }, context: { disableRevalidate: true } })
      updated++
    }
  }

  // Tidy away automatic entries more than a month old.
  const monthAgo = capeTownDate(new Date(Date.now() - 31 * 86_400_000))
  const removed = await payload.delete({
    collection: 'feasts',
    where: { and: [{ source: { equals: 'auto' } }, { date: { less_than: `${monthAgo}T00:00:00+02:00` } }] },
    context: { disableRevalidate: true },
  })

  return { created, updated, removed: removed.docs.length, window: `${today} to ${until}` }
}
