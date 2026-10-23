import Link from 'next/link'

import type { MassSchedule, SiteSetting } from '@/payload-types'
import { telHref } from '@/lib/format'

import { NavToggle } from './NavToggle'

export const NAV = [
  { href: '/#mass', label: 'Mass Times' },
  { href: '/#visit', label: 'Visit' },
  { href: '/#listen', label: 'Sermons' },
  { href: '/#community', label: 'Community' },
  { href: '/#school', label: 'School' },
  { href: '/news', label: 'News' },
  { href: '/#contact', label: 'Contact' },
]

const noticeText = (schedule: MassSchedule) => {
  if (schedule.notice) return { label: 'Notice:', text: schedule.notice }
  const mass = schedule.masses?.find((m) => m.highlight) ?? schedule.masses?.[0]
  if (!mass) return null
  const label = mass.day === 'Sunday' ? 'This Sunday:' : `${mass.day}s:`
  return {
    label,
    text: `${mass.description || 'Holy Mass'} at ${mass.time}${mass.note ? ` · ${mass.note}` : ''}`,
  }
}

export const Header = ({ settings, schedule }: { settings: SiteSetting; schedule: MassSchedule }) => {
  const notice = noticeText(schedule)
  return (
    <>
      <div className="utility on-dark">
        <div className="container">
          {notice ? (
            <span>
              <strong>{notice.label}</strong> {notice.text}
            </span>
          ) : (
            <span />
          )}
          <span className="utility-links">
            <a href={telHref(settings.phone)}>{settings.phone}</a>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/fsspx-wordmark.svg" alt="FSSPX, Society of Saint Pius X" width={230} height={20} />
            <span>Our Lady of the Blessed Sacrament · Cape Town</span>
          </Link>
          <NavToggle>
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/#give" className="nav-give">
                  Give
                </Link>
              </li>
            </ul>
          </NavToggle>
        </div>
      </header>
    </>
  )
}
