import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactForm, EmailSignupForm } from '@/components/site/Forms'
import { MediaImage } from '@/components/site/MediaImage'
import { Divider, Hearts, RoseWindow } from '@/components/site/Ornament'
import { CATEGORY_LABELS, formatDate, formatEventDate, formatFeastDate, telHref, toRoman } from '@/lib/format'
import { getHomePage, getMassSchedule, getNextEvent, getPosts, getSiteSettings, getUpcomingFeasts } from '@/lib/queries'
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

const COLOUR_LABELS: Record<string, string> = {
  white: 'White',
  red: 'Red',
  green: 'Green',
  violet: 'Violet',
  rose: 'Rose',
  black: 'Black',
}

const DEFAULT_TOPICS = ['General question', 'Baptism', 'Marriage', 'Sick call or Last Rites', 'Homeschooling', 'First visit']

const YouTubeIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M10 9.5v5l4.5-2.5z" />
  </svg>
)

export default async function HomePage() {
  const [home, schedule, settings, nextEvent, posts, feasts] = await Promise.all([
    getHomePage(),
    getMassSchedule(),
    getSiteSettings(),
    getNextEvent(),
    getPosts({ limit: 2 }),
    getUpcomingFeasts(4),
  ])

  const { hero, visit, listen, community, school, news, give, contact } = home
  const quote = home.quote ?? {}
  const homily = settings.latestHomily
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
        <RoseWindow />
        <div className="container hero-inner">
          <div className="hero-copy">
            {hero.kicker && <p className="hero-kicker">{hero.kicker}</p>}
            <Divider light />
            <h1 id="hero-heading">{hero.heading}</h1>
            {hero.intro && <p className="hero-sub">{hero.intro}</p>}
            <div className="hero-actions">
              <a href="#visit" className="btn btn-gold">Plan your first visit</a>
              <a href="#mass" className="btn btn-outline-gold">See Mass times</a>
            </div>
          </div>
          <div className="arch hero-card">
            <Hearts size={36} />
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
              <a href={settings.directionsUrl} className="text-link">
                {settings.street}, {settings.suburb}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Liturgical calendar */}
      {feasts.length > 0 && (
        <section id="calendar" className="calendar pat-navy rule-bottom on-dark" aria-labelledby="calendar-heading">
          <div className="container">
            <div className="calendar-intro">
              <p className="eyebrow">The Church&rsquo;s Year</p>
              <h2 id="calendar-heading">Feasts in the coming days</h2>
            </div>
            <ul className="feast-grid">
              {feasts.map((feast) => (
                <li key={feast.id} className="feast">
                  <time className="when" dateTime={feast.date}>{formatFeastDate(feast.date)}</time>
                  <span className="name">{feast.title}</span>
                  <span className="colour">
                    <span className={`swatch swatch-${feast.colour}`} aria-hidden="true" />
                    {COLOUR_LABELS[feast.colour] ?? feast.colour}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Mass & Confessions */}
      <section id="mass" className="pat-cream" aria-labelledby="mass-heading">
        <div className="container section">
          <div className="section-intro">
            <p className="eyebrow">Mass &amp; Sacraments</p>
            <h2 id="mass-heading" className="display">Mass schedule</h2>
            <Divider />
            {schedule.intro && <p className="lede">{schedule.intro}</p>}
          </div>
          <div className="mass-grid">
            {masses.map((m) => (
              <div key={m.id} className={`arch mass-card${m.highlight ? ' is-featured' : ''}`}>
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
                Listen to Sunday homilies on YouTube
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="bg-card rule-y" aria-labelledby="visit-heading">
        <div className="container section visit-grid">
          <div>
            {visit.eyebrow && <p className="eyebrow">{visit.eyebrow}</p>}
            <h2 id="visit-heading" className="display">{visit.heading}</h2>
            <Divider />
            {visit.intro && <p className="visit-intro">{visit.intro}</p>}
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
          <div className="visit-aside">
            {visit.image && typeof visit.image === 'object' && (
              <figure className="arch-frame">
                <MediaImage media={visit.image} sizes="(max-width: 960px) 100vw, 580px" />
                {visit.imageCaption && <figcaption>{visit.imageCaption}</figcaption>}
              </figure>
            )}
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
                  <a href={settings.directionsUrl} className="btn btn-navy">Get directions</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      {quote.latin && (
        <section className="quote pat-navy on-dark" aria-label="Quotation">
          <RoseWindow />
          <div className="quote-inner">
            <Hearts gold size={56} />
            <blockquote>
              <p lang="la" className="latin">{quote.latin}</p>
              <Divider light />
              {quote.translation && <p className="translation">{quote.translation}</p>}
              {quote.attribution && <footer>{quote.attribution}</footer>}
            </blockquote>
          </div>
        </section>
      )}

      {/* Listen & Watch */}
      <section id="listen" className="bg-sand" aria-labelledby="listen-heading">
        <div className="container section">
          <div className="section-intro">
            {listen.eyebrow && <p className="eyebrow">{listen.eyebrow}</p>}
            <h2 id="listen-heading" className="display">{listen.heading}</h2>
            <Divider />
            {listen.intro && <p className="lede">{listen.intro}</p>}
          </div>
          <div className="media-grid">
            {(homily?.videoId || settings.youtubePlaylistId) && (
              <article className="media-card">
                <div className="media-embed">
                  <iframe
                    src={
                      homily?.videoId
                        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(homily.videoId)}?rel=0`
                        : `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(settings.youtubePlaylistId ?? '')}`
                    }
                    title={homily?.publishedAt ? `Homily of ${formatDate(homily.publishedAt)}` : 'Latest homily from the chapel on YouTube'}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="media-body">
                  <span className="caps-label">
                    {homily?.publishedAt ? `Latest homily · ${formatDate(homily.publishedAt)}` : 'YouTube'}
                  </span>
                  <h3>{listen.youtubeTitle}</h3>
                  {listen.youtubeText && <p>{listen.youtubeText}</p>}
                  {settings.youtubeUrl && <a href={settings.youtubeUrl}>Hear earlier homilies</a>}
                </div>
              </article>
            )}
            {settings.podcastEmbedUrl && (
              <article className="media-card">
                <div className="media-embed is-podcast pat-wine">
                  <iframe
                    src={settings.podcastEmbedUrl}
                    title="The SSPX Podcast on Apple Podcasts"
                    loading="lazy"
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  />
                </div>
                <div className="media-body">
                  <span className="caps-label">Apple Podcasts · Updated weekly</span>
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
      <section id="community" className="pat-cream" aria-labelledby="community-heading">
        <div className="container section">
          <div className="section-intro">
            {community.eyebrow && <p className="eyebrow">{community.eyebrow}</p>}
            <h2 id="community-heading" className="display">{community.heading}</h2>
            <Divider />
            {community.intro && <p className="lede">{community.intro}</p>}
          </div>
          {community.gallery && community.gallery.length > 0 && (
            <div className="gallery">
              {community.gallery.map((item) => (
                <figure key={item.id}>
                  <span className="frame">
                    <MediaImage media={item.image} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 300px" />
                  </span>
                  <figcaption>
                    <span className="title">{item.title}</span>
                    {item.caption && <span className="caption">{item.caption}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
          <div className="callout double-frame">
            <div>
              <p className="caps-label">Upcoming</p>
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
        </div>
      </section>

      {/* School */}
      <section id="school" className="bg-card rule-y" aria-labelledby="school-heading">
        <div className="container section split">
          {school.image && typeof school.image === 'object' && (
            <div className="offset-frame">
              <MediaImage media={school.image} sizes="(max-width: 960px) 100vw, 600px" />
            </div>
          )}
          <div>
            {school.eyebrow && <p className="eyebrow">{school.eyebrow}</p>}
            <h2 id="school-heading" className="display">{school.heading}</h2>
            <Divider />
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
        <div className="section-intro" style={{ marginBottom: 48 }}>
          {news.eyebrow && <p className="eyebrow">{news.eyebrow}</p>}
          <h2 id="news-heading" className="display">{news.heading}</h2>
          <Divider />
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
        <p className="news-all">
          <Link href="/news" className="text-link">All news &amp; reading</Link>
        </p>
      </section>

      {/* Give */}
      <section id="give" className="give pat-wine on-dark" aria-labelledby="give-heading">
        <div className="give-inner">
          <Hearts gold size={44} />
          <h2 id="give-heading">{give.heading}</h2>
          <Divider light />
          {give.text && <p>{give.text}</p>}
          {give.buttonUrl ? (
            <a href={give.buttonUrl} className="btn btn-gold">{give.buttonLabel || 'Give online'}</a>
          ) : (
            <span className="status">{give.comingSoonText || 'Online giving coming soon'}</span>
          )}
          {give.bankDetails && <p className="bank-details">{give.bankDetails}</p>}
        </div>
      </section>

      {/* Contact & Newsletter */}
      <section id="contact" className="container section contact-grid" aria-labelledby="contact-heading">
        <div className="contact-info">
          <div>
            {contact.eyebrow && <p className="eyebrow">{contact.eyebrow}</p>}
            <h2 id="contact-heading" className="display">{contact.heading}</h2>
            <Divider />
            {contact.intro && <p className="lede">{contact.intro}</p>}
          </div>
          <div className="contact-lines">
            <a href={telHref(settings.phone)}>{settings.phone}</a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
            <span>{address}</span>
          </div>
          <div className="newsletter rule-top">
            <h3>{contact.newsletterHeading}</h3>
            {contact.newsletterText && <p>{contact.newsletterText}</p>}
            <EmailSignupForm formType="newsletter" buttonLabel="Subscribe" buttonClass="btn btn-navy" inputId="news-email" />
          </div>
        </div>
        <ContactForm topics={topics} phone={settings.phone} />
      </section>
    </>
  )
}
