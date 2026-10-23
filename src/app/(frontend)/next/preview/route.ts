import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'
import { getSafeRedirect } from 'payload/shared'

import { getPayloadClient } from '@/lib/payload'

// Opened by the admin panel's Preview / Live preview. Switches on Next.js draft
// mode for signed-in editors only, then shows the requested page.
export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const safePath = path ? getSafeRedirect({ fallbackTo: '', redirectTo: path }) : null
  if (!safePath) return new Response('Invalid preview path', { status: 400 })

  const payload = await getPayloadClient()
  const draft = await draftMode()

  let user = null
  try {
    ;({ user } = await payload.auth({ req: req as unknown as PayloadRequest, headers: req.headers }))
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not verify the editor for preview')
  }

  if (!user) {
    draft.disable()
    return new Response('Please sign in to the admin panel to preview drafts', { status: 403 })
  }

  draft.enable()
  redirect(safePath)
}
