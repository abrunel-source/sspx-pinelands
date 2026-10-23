import { revalidatePath } from 'next/cache'

import { isAuthorisedCron } from '@/lib/cron'
import { getPayloadClient } from '@/lib/payload'
import { syncLatestHomily } from '@/lib/sync/youtube'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Runs every day at 07:00 Cape Town time (see vercel.json).
export async function GET(request: Request) {
  if (!isAuthorisedCron(request)) return new Response('Unauthorised', { status: 401 })

  const payload = await getPayloadClient()
  try {
    const result = await syncLatestHomily(payload)
    if (result.updated) revalidatePath('/', 'layout')
    payload.logger.info({ result }, '[cron] latest homily')
    return Response.json({ ok: true, ...result })
  } catch (err) {
    payload.logger.error({ err }, '[cron] latest homily failed')
    return Response.json({ ok: false, error: (err as Error).message }, { status: 502 })
  }
}
