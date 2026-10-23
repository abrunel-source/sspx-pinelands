import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm, EmailSignupForm } from '@/components/site/Forms'
import { MediaImage } from '@/components/site/MediaImage'
import { CATEGORY_LABELS, formatDate, formatEventDate, telHref, toRoman } from '@/lib/format'
import { getHomePage, getMassSchedule, getNextEvent, getPosts, getSiteSettings } from '@/lib/queries'
import { getServerSideURL } from '@/lib/url'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage()
  const image = typeof home.meta?.image === 'object' ? home.meta?.image : null
  return {
    title: home.meta?.title ? { absolute: home.meta.title } : undefined,
    description: home.meta?.description || undefined,
    alternates: { canonical: '/' },
    openGraph: image?.url ? { images: [{ url: image.url }] } : undefined,
  }
}

const DEFAULT_TOPICS = ['General question', 'Baptism', 'Marriage', 'Sick call or Last Rites', 'Homeschooling', 'First visit']

const YouTubeIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M10 9.5v5l4.5-2.5z" />
  </svg>
)

export default async function HomePage() {
  const [home, schedule, settings, nextEvent, posts] = await Promise.all([
    getHomePage(),
    getMassSchedule(),
    getSiteSettings(),
    getNextEvent(),
    getPosts({ limit: 2 }),
  ])

  const { hero, visit, listen, community, school, news, give, contact } = home
  const quote = home.quote ?? {}
  const masses = schedule.masses ?? []
  const [featuredPost, secondPost] = posts.docs
  const topics = contact.topics?.length ? contact.topics.map((t) => t.label) : DEFAULT_TOPICS
  const address = `${settings.street}, ${settings.suburb}, ${settings.city}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CatholicChurch',
    name: settings.chapelName,
    alternateName: 'SSPX Cape Town',
    url: getServerSideURL(),
    telephone: settings.phone,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.street,
      addressLocality: settings.suburb,
      addressRegion: 'Western Cape',
      addressCountry: 'ZA',
    },
    geo: { '@type': 'GeoCoordinates', latitude: -33.93919436739519, longitude: 18.49626381803948 },
    hasMap: settings.directionsUrl,
    sameAs: [settings.youtubeUrl].filter(Boolean),
    event: masses.map((m) => ({
      '@type': 'Event',
      name: `${m.description || 'Holy Mass'} (${m.day})`,
      eventSchedule: { '@type': 'Schedule', byDay: `https://schema.org/${m.day}`, startTime: m.time, scheduleTimezone: 'Africa/Johannesburg' },
      location: { '@type': 'Place', name: settings.chapelName, address },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      {/* Welcome */}
      <section className="hero on-dark" aria-labelledby="hero-heading">
        <MediaImage media={hero.image} fill priority className="hero-bg" sizes="100vw" alt="" />
        <div className="container hero-inner">
          <div className="hero-copy">
            {hero.kicker && <p className="hero-kicker">{hero.kicker}</p>}
            <h1 id="hero-heading">{hero.heading}</h1>
            {hero.intro && <p className="hero-sub">{hero.intro}</p>}
            <div className="hero-actions">
              <a href="#visit" className="btn btn-light">Plan your first visit</a>
              <a href="#mass" className="btn btn-outline-light">See Mass times</a>
            </div>
          </div>
          <div className="hero-card">
            <h2 className="card-label">Holy Mass this week</h2>
            <ul className="schedule-list">
              {masses.map((m) => (
                <li key={m.id}>
                  <span className="day">{m.day}</span>
                  <span>{m.time}</span>
                </li>
              ))}
            </ul>
            {settings.directionsUrl && (
              <a href={settings.directionsUrl} className="text-link">Get directions to the chapel</a>
            )}
          </div>
        </div>
      </section>

      {/* Mass & Confessions */}
      <section id="mass" className="container section" aria-labelledby="mass-heading">
        <div className="section-head">
          <div>
            <p className="eyebrow">Mass &amp; Sacraments</p>
            <h2 id="mass-heading" className="display">Mass schedule</h2>
          </div>
          {schedule.intro && <p className="lede">{schedule.intro}</p>}
        </div>
        <div className="mass-grid">
          {masses.map((m) => (
            <div key={m.id} className={`mass-card${m.highlight ? ' is-featured' : ''}`}>
              <span className="day">{m.day}</span>
              <span className="time">{m.time}</span>
              <span className="what">
                {m.description || 'Holy Mass'}
                {m.note && (
                  <>
                    <br />
                    {m.note}
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mass-note">
          {(schedule.specialNote?.title || schedule.specialNote?.text) && (
            <p>
              {schedule.specialNote?.title && <strong>{schedule.specialNote.title}</strong>} {schedule.specialNote?.text}
            </p>
          )}
          {settings.youtubeUrl && (
            <a href={settings.youtubeUrl} className="icon-link">
              <YouTubeIcon />
              Watch recorded Masses on YouTube
            </a>
          )}
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="section-white" aria-labelledby="visit-heading">
        <div className="container section visit-grid">
          <div>
            {visit.eyebrow && <p className="eyebrow">{visit.eyebrow}</p>}
            <h2 id="visit-heading" className="display">{visit.heading}</h2>
            {visit.intro && <p className="lede visit-intro">{visit.intro}</p>}
            {visit.image && typeof visit.image === 'object' && (
              <figure className="visit-figure">
                <MediaImage media={visit.image} sizes="(max-width: 960px) 100vw, 600px" />
                {visit.imageCaption && <figcaption>{visit.imageCaption}</figcaption>}
              </figure>
            )}
            {visit.steps && visit.steps.length > 0 && (
              <ol className="steps">
                {visit.steps.map((step, i) => (
                  <li key={step.id}>
                    <span className="numeral" aria-hidden="true">{toRoman(i + 1)}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="location-card">
            {settings.mapEmbedUrl && (
              <div className="map-frame">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={`Map showing the ${settings.chapelName}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
            <div className="location-body">
              <div>
                <h3>{settings.chapelName}</h3>
                <address>{address}</address>
              </div>
              <dl className="facts">
                {settings.parking && (
                  <div>
                    <dt>Parking</dt>
                    <dd>{settings.parking}</dd>
                  </div>
                )}
                <div>
                  <dt>Phone</dt>
                  <dd><a href={telHref(settings.phone)}>{settings.phone}</a></dd>
                </div>
              </dl>
              {settings.directionsUrl && (
                <a href={settings.directionsUrl} className="btn btn-ink">Get directions</a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      {quote.latin && (
        <section className="quote" aria-label="Quotation">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/two-hearts-red.svg" alt="" width={48} height={64} />
          <blockquote>
            <p lang="la" className="latin">{quote.latin}</p>
            {quote.translation && <p className="translation">{quote.translation}</p>}
            {quote.attribution && <footer>{quote.attribution}</footer>}
          </blockquote>
        </section>
      )}

      {/* Listen & Watch */}
      <section id="listen" className="section-dark on-dark" aria-labelledby="listen-heading">
        <div className="container section">
          <div className="section-head">
            <div>
              {listen.eyebrow && <p className="eyebrow">{listen.eyebrow}</p>}
              <h2 id="listen-heading" className="display">{listen.heading}</h2>
            </div>
            {listen.intro && <p className="lede">{listen.intro}</p>}
          </div>
          <div className="media-grid">
            {settings.youtubePlaylistId && (
              <article className="media-card">
                <div className="media-embed">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(settings.youtubePlaylistId)}`}
                    title="Recorded Masses from the chapel on YouTube"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="media-body">
                  <span className="kicker">YouTube</span>
                  <h3>{listen.youtubeTitle}</h3>
                  {listen.youtubeText && <p>{listen.youtubeText}</p>}
                  {settings.youtubeUrl && <a href={settings.youtubeUrl}>Open the full archive</a>}
                </div>
              </article>
            )}
            {settings.podcastEmbedUrl && (
              <article className="media-card">
                <div className="media-embed is-podcast">
                  <iframe
                    src={settings.podcastEmbedUrl}
                    title="The SSPX Podcast on Apple Podcasts"
                    loading="lazy"
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  />
                </div>
                <div className="media-body">
                  <span className="kicker">Apple Podcasts · Updated weekly</span>
                  <h3>{listen.podcastTitle}</h3>
                  {listen.podcastText && <p>{listen.podcastText}</p>}
                  {settings.podcastUrl && <a href={settings.podcastUrl}>Listen on Apple Podcasts</a>}
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="container section" aria-labelledby="community-heading">
        <div className="section-head">
          <div>
            {community.eyebrow && <p className="eyebrow">{community.eyebrow}</p>}
            <h2 id="community-heading" className="display">{community.heading}</h2>
          </div>
          {community.intro && <p className="lede">{community.intro}</p>}
        </div>
        {community.gallery && community.gallery.length > 0 && (
          <div className="gallery">
            {community.gallery.map((item) => (
              <figure key={item.id}>
                <MediaImage media={item.image} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 300px" />
                <figcaption>
                  <strong>{item.title}</strong>
                  {item.caption && <span> · {item.caption}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="callout">
          <div>
            <p className="label">Upcoming</p>
            {nextEvent ? (
              <>
                <p className="title">{nextEvent.title}</p>
                <p className="muted" style={{ margin: '4px 0 0' }}>
                  {formatEventDate(nextEvent.startsAt)}
                  {nextEvent.location ? ` · ${nextEvent.location}` : ''}
                </p>
                {nextEvent.summary && <p style={{ margin: '8px 0 0' }}>{nextEvent.summary}</p>}
              </>
            ) : (
              <p className="title">{community.noEventsText || 'Coming soon'}</p>
            )}
          </div>
          <a href="#contact" className="text-link">Ask about getting involved</a>
        </div>
      </section>

      {/* School */}
      <section id="school" className="section-white" aria-labelledby="school-heading">
        <div className="container section split">
          <div>
            <MediaImage media={school.image} sizes="(max-width: 960px) 100vw, 600px" />
          </div>
          <div>
            {school.eyebrow && <p className="eyebrow">{school.eyebrow}</p>}
            <h2 id="school-heading" className="display">{school.heading}</h2>
            {school.body && <p className="muted">{school.body}</p>}
            {school.emphasis && <p className="emphasis">{school.emphasis}</p>}
            {school.showForm && (
              <EmailSignupForm formType="school" buttonLabel="Register interest" buttonClass="btn btn-wine" inputId="school-email" />
            )}
          </div>
        </div>
      </section>

      {/* News */}
      <section id="news" className="container section" aria-labelledby="news-heading">
        <div className="news-head">
          <div>
            {news.eyebrow && <p className="eyebrow">{news.eyebrow}</p>}
            <h2 id="news-heading" className="display">{news.heading}</h2>
          </div>
          <Link href="/news" className="text-link">All news</Link>
        </div>
        <div className="news-row">
          {featuredPost ? (
            <article className="news-feature">
              {featuredPost.coverImage && typeof featuredPost.coverImage === 'object' && (
                <MediaImage media={featuredPost.coverImage} sizes="(max-width: 560px) 100vw, 220px" alt="" />
              )}
              <div className="body">
                <span className="news-meta">
                  {formatDate(featuredPost.publishedAt)}
                  {featuredPost.category ? ` · ${CATEGORY_LABELS[featuredPost.category]}` : ''}
                </span>
                <h3 className="news-title">
                  <Link href={`/news/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h3>
                {featuredPost.excerpt && <p>{featuredPost.excerpt}</p>}
                <Link href={`/news/${featuredPost.slug}`} className="text-link">
                  Read the article<span className="visually-hidden">: {featuredPost.title}</span>
                </Link>
              </div>
            </article>
          ) : (
            <article className="news-feature">
              <div className="body">
                <h3 className="news-title">News coming soon</h3>
              </div>
            </article>
          )}
          {secondPost ? (
            <article className="news-side">
              <span className="news-meta">
                {formatDate(secondPost.publishedAt)}
                {secondPost.category ? ` · ${CATEGORY_LABELS[secondPost.category]}` : ''}
              </span>
              <h3 className="news-title">
                <Link href={`/news/${secondPost.slug}`}>{secondPost.title}</Link>
              </h3>
              {secondPost.excerpt && <p>{secondPost.excerpt}</p>}
              <Link href={`/news/${secondPost.slug}`} className="text-link">
                Read more<span className="visually-hidden">: {secondPost.title}</span>
              </Link>
            </article>
          ) : (
            <article className="news-side">
              <span className="news-meta">Mailing list</span>
              <h3 className="news-title">Hear about news first</h3>
              <p>Mass changes, feast days and announcements, sent by email. No more than a few messages a month.</p>
              <a href="#contact" className="text-link">Join the mailing list</a>
            </article>
          )}
        </div>
      </section>

      {/* Give */}
      <section id="give" className="give on-dark" aria-labelledby="give-heading">
        <div className="container">
          <div className="copy">
            <h2 id="give-heading">{give.heading}</h2>
            {give.text && <p>{give.text}</p>}
          </div>
          <div className="give-action">
            {give.buttonUrl ? (
              <a href={give.buttonUrl} className="btn btn-light">{give.buttonLabel || 'Give online'}</a>
            ) : (
              <span className="status">{give.comingSoonText || 'Online giving coming soon'}</span>
            )}
            {give.bankDetails && <p className="bank-details">{give.bankDetails}</p>}
          </div>
        </div>
      </section>

      {/* Contact & Newsletter */}
      <section id="contact" className="container section contact-grid" aria-labelledby="contact-heading">
        <div className="contact-info">
          <div>
            {contact.eyebrow && <p className="eyebrow">{contact.eyebrow}</p>}
            <h2 id="contact-heading" className="display">{contact.heading}</h2>
            {contact.intro && <p className="lede">{contact.intro}</p>}
          </div>
          <div className="contact-lines">
            <a href={telHref(settings.phone)}>{settings.phone}</a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </div>
          <div className="newsletter">
            <h3>{contact.newsletterHeading}</h3>
            {contact.newsletterText && <p>{contact.newsletterText}</p>}
            <EmailSignupForm formType="newsletter" buttonLabel="Subscribe" inputId="news-email" />
          </div>
        </div>
        <ContactForm topics={topics} phone={settings.phone} />
      </section>
    </>
  )
}
