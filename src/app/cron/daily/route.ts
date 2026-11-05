import { revalidatePath } from 'next/cache'

import { expireBanner } from '@/lib/banner'
import { isAuthorisedCron } from '@/lib/cron'
import { getPayloadClient } from '@/lib/payload'
import { syncLatestHomily } from '@/lib/sync/youtube'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Runs every day at 07:00 Cape Town time (see vercel.json): fetches the newest
// homily, and switches off the announcement banner once its last day has passed.
export async function GET(request: Request) {
  if (!isAuthorisedCron(request)) return new Response('Unauthorised', { status: 401 })

  const payload = await getPayloadClient()
  const results: Record<string, unknown> = {}
  let changed = false

  try {
    const homily = await syncLatestHomily(payload)
    results.homily = homily
    changed ||= homily.updated
  } catch (err) {
    payload.logger.error({ err }, '[cron] latest homily failed')
    results.homily = { error: (err as Error).message }
  }

  try {
    const removed = await expireBanner(payload)
    results.banner = { removed }
    changed ||= removed
  } catch (err) {
    payload.logger.error({ err }, '[cron] banner check failed')
    results.banner = { error: (err as Error).message }
  }

  if (changed) revalidatePath('/', 'layout')
  payload.logger.info({ results }, '[cron] daily')
  const failed = Object.values(results).some((r) => typeof r === 'object' && r && 'error' in r)
  return Response.json({ ok: !failed, ...results }, { status: failed ? 502 : 200 })
}
