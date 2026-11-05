import type { Payload } from 'payload'

import type { AnnouncementBanner } from '@/payload-types'

const capeTownDay = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(date)

/** Switched on, and not past its "Remove it after" day (Cape Town time). */
export const isBannerLive = (banner: AnnouncementBanner | null | undefined, now = new Date()) =>
  Boolean(banner?.enabled && banner.heading && (!banner.hideAfter || capeTownDay(now) <= capeTownDay(new Date(banner.hideAfter))))

/**
 * Run by the daily job: switches the banner off once its last day has passed,
 * so it does not come back by itself. Returns whether anything changed.
 */
export const expireBanner = async (payload: Payload, now = new Date()) => {
  const banner = await payload.findGlobal({ slug: 'announcement-banner', depth: 0 })
  if (!banner.enabled || isBannerLive(banner, now)) return false
  await payload.updateGlobal({ slug: 'announcement-banner', data: { enabled: false } })
  return true
}
