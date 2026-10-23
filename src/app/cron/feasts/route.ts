import { revalidatePath } from 'next/cache'

import { isAuthorisedCron } from '@/lib/cron'
import { getPayloadClient } from '@/lib/payload'
import { syncFeasts } from '@/lib/sync/feasts'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Runs every Friday at 18:00 Cape Town time (see vercel.json).
export async function GET(request: Request) {
  if (!isAuthorisedCron(request)) return new Response('Unauthorised', { status: 401 })

  const payload = await getPayloadClient()
  try {
    const result = await syncFeasts(payload)
    // The page always shows the next four from today, so refresh it weekly regardless.
    revalidatePath('/')
    payload.logger.info({ result }, '[cron] feasts')
    return Response.json({ ok: true, ...result })
  } catch (err) {
    payload.logger.error({ err }, '[cron] feasts failed')
    return Response.json({ ok: false, error: (err as Error).message }, { status: 502 })
  }
}
