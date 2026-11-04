import type { MassSchedule } from '@/payload-types'

// Content from the chapel notices of 30 October 2026 and the photos of All
// Saints, Sunday 1 November: added to production by a content migration.

const photo = (n: string, alt: string, caption?: string) => ({ file: `all-saints-2026-${n}.jpg`, alt, caption })

export const ALL_SAINTS_COVER = photo(
  '5801',
  'A girl dressed as a virgin martyr, with a palm branch and a crown of white flowers, smiling as she speaks about her saint',
)

export const ALL_SAINTS_PHOTOS = [
  photo('5813', 'A boy in a cloak holding a crucifix as he speaks about his saint', 'Crucifix in hand.'),
  photo('5804', 'A young man in a black habit with a rosary at his belt, holding a cross and reading from his notes', 'Rosary at the belt, cross in hand.'),
  photo('5810', 'A woman in a dark robe kneeling on the chapel floor with a sword laid beside her', 'Kneeling, a sword laid at her side.'),
  photo('5791', 'A parishioner dressed as a nun in a black habit and white wimple, reading from a book', 'A religious sister reads from her book.'),
  photo('5830', 'A girl dressed as a nun reading from a book about her saint', 'Reading from the life of her saint.'),
  photo('5840', 'A boy dressed as a knight with a wooden sword beside a painted dragon, a lady in a gold robe and crown behind him', 'A young knight, a crowned lady and a dragon.'),
  photo('5857', 'A boy in a helmet swinging a bat at the piñata on the lawn behind the chapel', 'A mighty swing.'),
  photo('5865', 'A blindfolded girl in a helmet being guided towards the piñata', 'Blindfolded and guided into place.'),
  photo('5888', 'A boy in a helmet and blindfold taking aim at the piñata as parishioners watch', 'Taking aim.'),
  photo('5895', 'Father Keiser being handed a helmet before his turn at the piñata', 'Father Keiser gets ready…'),
  photo('5899', 'Father Keiser, blindfolded and in a helmet, holding the bat at the piñata', '…and takes his turn.'),
  photo('5890', 'Two small children kneeling on the grass, gathering the treats from the broken piñata', 'Gathering the treats.'),
]

/** Which photos replace each "[photos N]" line in the All Saints article. */
export const ALL_SAINTS_GROUPS: Record<string, string[]> = {
  '1': ALL_SAINTS_PHOTOS.slice(0, 6).map((p) => p.file),
  '2': ALL_SAINTS_PHOTOS.slice(6).map((p) => p.file),
}

export const NOVEMBER_POSTS = [
  {
    slug: 'all-saints-2026',
    title: 'All Saints: a gathering of saints, and a piñata',
    htmlFile: 'all-saints-2026.html',
    category: 'parish-life' as const,
    // Published after the notices so it leads the home page news with its photo.
    publishedAt: '2026-11-04T06:30:00.000Z',
    coverImage: ALL_SAINTS_COVER.file,
    excerpt:
      'After the Sung Mass on the Feast of All Saints, parishioners came dressed as saints and spoke about them one by one, before a piñata in the garden behind the chapel.',
    metaTitle: 'All Saints 2026 · SSPX Cape Town',
    metaDescription:
      'Parishioners dressed as saints and spoke about them after Sung Mass on the Feast of All Saints, 1 November 2026, followed by a piñata behind the chapel.',
  },
  {
    slug: 'chapel-notices-4-9-november-2026',
    title: 'Chapel notices and Mass times: 4–9 November',
    htmlFile: 'chapel-notices-2026-11-04.html',
    category: 'announcement' as const,
    publishedAt: '2026-11-04T06:00:00.000Z',
    coverImage: undefined,
    excerpt:
      'First Friday and First Saturday Masses with Benediction, Sunday Sung Mass, the November lists for the Holy Souls, and dates for the Christmas Market and retreats.',
    metaTitle: 'Chapel notices, 4–9 November 2026 · SSPX Cape Town',
    metaDescription:
      'Mass times for 4–9 November 2026 at Our Lady of the Blessed Sacrament, Pinelands, with the week’s notices.',
  },
]

// Times are Cape Town (UTC+2). An event at 00:00 has no set time (shown as a date only).
export const NOVEMBER_EVENTS = [
  {
    title: 'Christmas Market',
    startsAt: '2026-12-04T22:00:00.000Z',
    summary: 'Our annual Christmas Market. Donations are welcome: please speak to Chantal or Nirrie after Mass if you can donate or help.',
  },
  {
    title: 'Ignatian retreats',
    startsAt: '2026-12-13T22:00:00.000Z',
    endsAt: '2026-12-18T22:00:00.000Z',
    location: 'Padre Pio Centre, Pretoria',
    summary: 'Preached by Frs Esposito and Ginoux. Registration forms are at the back of the chapel; register and book flights early for cheaper fares.',
  },
  {
    title: 'SSPX Annual Sports Day',
    startsAt: '2027-04-23T22:00:00.000Z',
    endsAt: '2027-04-26T22:00:00.000Z',
    location: 'Cape Town',
    summary: 'Hosted in Cape Town. Save the date: planning is under way.',
  },
]

/** The usual times from the chapel notices, replacing the starting ones from the old website. */
export const MASS_TIMES: NonNullable<MassSchedule['masses']> = [
  { day: 'Sunday', time: '9:00', description: 'Sung Mass', note: 'Confessions 8:00–8:45 · Rosary 8:20', highlight: true },
  { day: 'Monday', time: '8:00', description: 'Low Mass' },
  { day: 'Friday', time: '18:45', description: 'Low Mass', note: 'Confessions from 17:45' },
  { day: 'Saturday', time: '8:30', description: 'Low Mass', note: 'Confessions from 7:30' },
]

export const MASS_INTRO =
  'All Masses are offered according to the 1962 Roman Missal. Our chapel is served by the priests of Our Lady of Sorrows Priory in Roodepoort, so times can change from week to week: see the latest chapel notices under News.'

export const FIRST_FRIDAYS_TEXT = 'Low Mass followed by Benediction.'

export const WEEK_NOTICE = {
  notice: 'This week: First Friday Mass and Benediction, Fri 6 Nov 18:45 · Sung Mass, Sun 8 Nov 9:00',
  noticeUntil: '2026-11-09T10:00:00.000Z',
}
