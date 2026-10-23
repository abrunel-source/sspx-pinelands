'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** Re-renders the page whenever the editor autosaves, so live preview stays in sync. */
export const LivePreviewListener = () => {
  const router = useRouter()
  const serverURL = typeof window === 'undefined' ? '' : window.location.origin
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
