/**
 * Runs both automatic updates once: the latest YouTube homily and the
 * liturgical calendar. Used on every deploy (npm run ci) so a new deploy is
 * never stale, and handy by hand: npm run sync
 * Failures are reported but never fail the deploy.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { syncFeasts } from '../lib/sync/feasts'
import { syncLatestHomily } from '../lib/sync/youtube'

const payload = await getPayload({ config })

for (const [name, job] of [
  ['latest homily', () => syncLatestHomily(payload)],
  ['feasts', () => syncFeasts(payload)],
] as const) {
  try {
    payload.logger.info({ result: await job() }, `[sync] ${name}`)
  } catch (err) {
    payload.logger.warn({ err }, `[sync] ${name} failed, will retry on the next scheduled run`)
  }
}

process.exit(0)
