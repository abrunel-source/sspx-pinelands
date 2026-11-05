import Link from 'next/link'

import { isBannerLive } from '@/lib/banner'
import { formatEventWhen } from '@/lib/format'
import type { AnnouncementBanner as Banner, Media } from '@/payload-types'

import { MediaImage } from './MediaImage'
import { Divider } from './Ornament'

export const BANNER_ID = 'announcement'

const ButtonLink = ({ href, className, children }: { href: string; className: string; children: React.ReactNode }) =>
  href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  )

/** The large banner, under the welcome section of the home page. */
export const AnnouncementBanner = ({ banner }: { banner: Banner }) => {
  if (!isBannerLive(banner)) return null
  const poster = typeof banner.poster === 'object' ? (banner.poster as Media | null) : null
  const when = formatEventWhen(banner.startsAt, banner.endsAt)
  return (
    <section
      id={BANNER_ID}
      className={`event-banner on-dark is-${banner.theme ?? 'plain'}`}
      aria-labelledby="event-banner-heading"
    >
      <span className="event-banner-sky" aria-hidden="true" />
      <div className="container event-banner-inner">
        <div className="event-banner-copy">
          {banner.eyebrow && <p className="eyebrow">{banner.eyebrow}</p>}
          <h2 id="event-banner-heading" className="event-banner-title">
            {banner.heading}
          </h2>
          <Divider light />
          {when && <p className="event-banner-when">{when}</p>}
          {banner.place && <p className="event-banner-place">{banner.place}</p>}
          {banner.text && <p className="event-banner-text">{banner.text}</p>}
          {(banner.buttonLabel || banner.secondButtonLabel) && (
            <div className="event-banner-actions">
              {banner.buttonLabel && banner.buttonLink && (
                <ButtonLink href={banner.buttonLink} className="btn btn-gold">
                  {banner.buttonLabel}
                </ButtonLink>
              )}
              {banner.secondButtonLabel && banner.secondButtonLink && (
                <ButtonLink href={banner.secondButtonLink} className="btn btn-outline-gold">
                  {banner.secondButtonLabel}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
        {poster?.url && (
          <figure className="event-banner-poster">
            <a href={poster.url} target="_blank" rel="noopener">
              <MediaImage media={poster} sizes="(max-width: 860px) 80vw, 380px" />
              <span className="visually-hidden"> (opens the full poster)</span>
            </a>
          </figure>
        )}
      </div>
    </section>
  )
}

/** The slim strip under the menu on every page except the home page. */
export const AnnouncementRibbon = ({ banner }: { banner: Banner }) => {
  if (!isBannerLive(banner)) return null
  const when = formatEventWhen(banner.startsAt, banner.endsAt)
  return (
    <Link href={`/#${BANNER_ID}`} className={`event-ribbon is-${banner.theme ?? 'plain'}`}>
      <span className="container">
        <strong>{banner.heading}</strong>
        {when && <span>{when}</span>}
        <span className="event-ribbon-more">Details →</span>
      </span>
    </Link>
  )
}
