import Link from 'next/link'

import type { MassSchedule, SiteSetting } from '@/payload-types'
import { telHref } from '@/lib/format'

export const Footer = ({ settings, schedule }: { settings: SiteSetting; schedule: MassSchedule }) => (
  <footer className="site-footer pat-night rule-top on-dark">
    <div className="container footer-grid">
      <div className="footer-col footer-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/two-hearts-gold.svg" alt="" width={40} height={54} />
        <span className="name">Our Lady of the Blessed Sacrament</span>
        <address>
          Priestly Society of Saint Pius X
          <br />
          {settings.street}
          <br />
          {settings.suburb}, {settings.city}
        </address>
      </div>
      <div className="footer-col">
        <h2>Holy Mass</h2>
        <ul>
          {schedule.masses?.map((m) => (
            <li key={m.id ?? `${m.day}-${m.time}`}>
              {m.day} {m.time}
            </li>
          ))}
        </ul>
      </div>
      <nav className="footer-col" aria-label="Footer">
        <h2>Explore</h2>
        <ul>
          <li><Link href="/#visit">Plan your visit</Link></li>
          <li><Link href="/#calendar">Feasts &amp; calendar</Link></li>
          <li><Link href="/#listen">Sermons &amp; podcast</Link></li>
          <li><Link href="/#school">Homeschooling</Link></li>
          <li><Link href="/news">News</Link></li>
          <li><Link href="/#give">Give</Link></li>
        </ul>
      </nav>
      <div className="footer-col">
        <h2>Contact</h2>
        <ul>
          <li><a href={telHref(settings.phone)}>{settings.phone}</a></li>
          <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
          {settings.youtubeUrl && <li><a href={settings.youtubeUrl}>YouTube</a></li>}
          {settings.podcastUrl && <li><a href={settings.podcastUrl}>SSPX Podcast</a></li>}
        </ul>
      </div>
    </div>
    <div className="container footer-bottom">
      <span>© {new Date().getFullYear()} SSPX Cape Town. All rights reserved.</span>
      <span className="motto" lang="la">
        Ad Majorem Dei Gloriam
      </span>
    </div>
  </footer>
)
