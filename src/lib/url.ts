export const getServerSideURL = () =>
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

/** Admin "Preview" and live-preview iframe URL for a site path. */
export const previewPath = (path: string) =>
  `/next/preview?${new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  }).toString()}`
