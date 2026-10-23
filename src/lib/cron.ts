import { timingSafeEqual } from 'crypto'

/**
 * Vercel Cron calls these routes with "Authorization: Bearer $CRON_SECRET"
 * when CRON_SECRET is set on the project, and then only that is accepted.
 * Until it is set, requests from Vercel's scheduler (user agent
 * "vercel-cron/…") are accepted so the schedules keep working. The jobs only
 * read public data (YouTube, the 1962 calendar) and change nothing when
 * nothing is new, so this fallback is low-risk; setting CRON_SECRET closes it.
 */
export const isAuthorisedCron = (request: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return (request.headers.get('user-agent') ?? '').startsWith('vercel-cron/')
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
