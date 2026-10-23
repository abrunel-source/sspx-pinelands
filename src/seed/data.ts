import type { HomePage, MassSchedule, Role } from '@/payload-types'

type Perms = NonNullable<Role['permissions']>

// --- Starter roles ---------------------------------------------------------
// Examples to adapt or delete. Super admins always have full access.

const all = { read: true, create: true, update: true, delete: true, publish: true }

export const roles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Administrator',
    description: 'Runs the website: all content, settings and user accounts.',
    permissions: {
      posts: all,
      events: all,
      media: { read: true, create: true, update: true, delete: true },
      formSubmissions: { read: true, update: true, delete: true },
      homePage: { read: true, update: true, publish: true },
      massSchedule: { read: true, update: true, publish: true },
      siteSettings: { read: true, update: true },
      users: { read: true, create: true, update: true, delete: true },
      roles: { read: true, create: true, update: true, delete: true },
    } satisfies Perms,
  },
  {
    name: 'Editor',
    description: 'Writes and publishes all website content. Cannot manage users or settings.',
    permissions: {
      posts: all,
      events: all,
      media: { read: true, create: true, update: true, delete: true },
      homePage: { read: true, update: true, publish: true },
      massSchedule: { read: true, update: true, publish: true },
    } satisfies Perms,
  },
  {
    name: 'Contributor',
    description: 'Drafts news posts and events for an editor to review. Can only edit their own items.',
    permissions: {
      posts: { read: true, create: true, update: true, ownOnly: true },
      events: { read: true, create: true, update: true, ownOnly: true },
      media: { read: true, create: true, update: true, ownOnly: true },
    } satisfies Perms,
  },
  {
    name: 'Chapel office',
    description: 'Answers website messages and keeps the Mass schedule up to date.',
    permissions: {
      formSubmissions: { read: true, update: true },
      massSchedule: { read: true, update: true, publish: true },
      events: all,
    } satisfies Perms,
  },
]

// --- Mass schedule ---------------------------------------------------------

export const massSchedule: Partial<MassSchedule> = {
  masses: [
    { day: 'Sunday', time: '9:00', description: 'Holy Mass', note: 'Confessions from 8:00', highlight: true },
    { day: 'Monday', time: '8:00', description: 'Holy Mass' },
    { day: 'Friday', time: '18:30', description: 'Holy Mass' },
    { day: 'Saturday', time: '9:00', description: 'Holy Mass' },
  ],
  intro:
    'All Masses are offered according to the 1962 Roman Missal. Confessions are heard before Sunday Mass, and by appointment with the priest.',
  specialNote: {
    title: 'First Fridays & First Saturdays:',
    text: 'Rosary and Benediction 30 minutes before the usual Mass time.',
  },
}

// --- Home page -------------------------------------------------------------

export const home = (media: Record<string, number>): Partial<HomePage> => ({
  hero: {
    kicker: 'Priestly Society of Saint Pius X · Cape Town',
    heading: 'The Traditional Latin Mass, offered every week in Cape Town.',
    intro:
      'Our Lady of the Blessed Sacrament upholds Catholic tradition and prevails in her call of souls to their everlasting home. All are welcome.',
    image: media['hero-altar.jpg'],
  },
  visit: {
    eyebrow: 'Plan your visit',
    heading: 'New to the Traditional Mass?',
    intro:
      'Once housed in the old local post office, our chapel now stands on the centre square overlooking the park. Whether you are returning to the faith or discovering the ancient liturgy for the first time, you will be warmly received.',
    image: media['park-morning.jpg'],
    imageCaption: 'Morning in the park across from the chapel, Pinelands',
    steps: [
      {
        title: 'Arrive a little early',
        text: 'The chapel keeps a prayerful silence before Mass. Confessions are heard from 8:00 on Sundays.',
      },
      {
        title: 'Follow along with the Latin',
        text: 'The Mass is offered in Latin. Booklets at the entrance help you follow along, and hand missals can be bought from our repository.',
      },
      {
        title: 'Dress with reverence',
        text: 'Modest Sunday dress is customary. Chapel veils are available for ladies who wish to wear one.',
      },
      {
        title: 'Stay for fellowship',
        text: 'Introduce yourself to the priest after Mass. We would be glad to meet you.',
      },
    ],
  },
  quote: {
    latin: 'Irrequietum est cor nostrum donec requiescat in Te, Domine.',
    translation: 'Our heart, O Lord, is restless, until it finds rest in Thee.',
    attribution: 'St Augustine, Confessions',
  },
  listen: {
    eyebrow: 'Listen & Watch',
    heading: 'Sermons, Masses and the SSPX Podcast',
    intro:
      "Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society's official podcast are always available.",
    youtubeTitle: 'Recorded Masses from our chapel',
    youtubeText: 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.',
    podcastTitle: 'Interviews, sermons and Q&A with SSPX priests',
    podcastText: 'The official English-language podcast of the Society, updated weekly.',
  },
  community: {
    eyebrow: 'Parish life',
    heading: 'A faith lived together',
    intro:
      'Feast days, fêtes, shared meals and Christmas preparations. Life at Our Lady of the Blessed Sacrament extends well beyond Sunday morning.',
    gallery: [
      { image: media['community-all-saints.jpg'], title: 'All Saints', caption: 'The children as their patron saints' },
      { image: media['community-fete.jpg'], title: 'Parish fête', caption: 'Stalls on the chapel lawn' },
      { image: media['community-cook-off.jpg'], title: 'Cook-off', caption: 'Food from many nations' },
      { image: media['community-advent.jpg'], title: 'Advent', caption: 'Preparing the hall for Christmas' },
    ],
    noEventsText: 'Coming soon',
  },
  school: {
    eyebrow: 'Catholic education',
    heading: 'Homeschooling with faith at the heart of every subject',
    body: 'Our Catholic homeschooling curriculum weaves the faith into every subject. Small class sizes give each child individual attention, and a close-knit community binds students, teachers and families together.',
    emphasis: 'Registrations for the new year open soon.',
    image: media['school.jpg'],
    showForm: true,
  },
  news: { eyebrow: 'News & Reading', heading: 'From the chapel' },
  give: {
    heading: 'Support the chapel',
    text: 'Our chapel, its priests and its school are sustained entirely by the generosity of the faithful. Every gift helps keep the Traditional Mass alive in Cape Town.',
    buttonLabel: 'Give online',
    comingSoonText: 'Online giving coming soon',
  },
  contact: {
    eyebrow: 'Get in touch',
    heading: 'Contact the chapel',
    intro:
      'For baptisms, weddings, confessions by appointment, sick calls or any question about the faith, send us a message and the priest will reply.',
    newsletterHeading: 'Stay up to date',
    newsletterText: 'Join the mailing list for Mass changes, feast days and announcements.',
    topics: ['General question', 'Baptism', 'Marriage', 'Sick call or Last Rites', 'Homeschooling', 'First visit'].map(
      (label) => ({ label }),
    ),
  },
  meta: {
    title: 'Our Lady of the Blessed Sacrament · SSPX Cape Town',
    description:
      'The Traditional Latin Mass every week at the Chapel of Our Lady of the Blessed Sacrament, Society of Saint Pius X, Pinelands, Cape Town. Mass times, directions and parish news.',
  },
})

// --- Posts migrated from WordPress -------------------------------------------

export const posts = [
  {
    slug: 'an-open-letter-to-confused-catholics',
    title: 'An Open Letter to Confused Catholics',
    htmlFile: 'open-letter-to-confused-catholics.html',
    author: 'Archbishop Marcel Lefebvre',
    category: 'reading' as const,
    publishedAt: '2024-07-08T11:19:31.000Z',
    coverImage: 'open-letter-cover.jpg',
    excerpt:
      "Archbishop Marcel Lefebvre's plain-spoken defence of the faith, introduced with the preface to the English edition.",
    metaTitle: 'An Open Letter to Confused Catholics · SSPX Cape Town',
    metaDescription:
      "His Grace Archbishop Marcel Lefebvre exposes the truth about the Catholic Church's disintegration and the need for renewal based on tradition.",
  },
]
