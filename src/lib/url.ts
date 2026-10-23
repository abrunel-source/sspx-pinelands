/** The site's public address, without a trailing slash (tolerates one in the setting). */
export const getServerSideURL = () =>
  (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  ).replace(/\/+$/, '')

/**
 * Every address the site is reached at, for Payload's sign-in (CSRF) check.
 * Covers both fsspx.co.za and www.fsspx.co.za whichever one the setting
 * holds, plus this deployment's own Vercel addresses.
 */
export const getTrustedOrigins = () => {
  const origins = new Set<string>()
  const add = (value?: string) => {
    if (!value) return
    try {
      const url = new URL(value.startsWith('http') ? value : `https://${value}`)
      origins.add(url.origin)
      const host = url.hostname
      if (!host.includes('localhost') && !host.endsWith('.vercel.app')) {
        const twin = host.startsWith('www.') ? host.slice(4) : `www.${host}`
        origins.add(`${url.protocol}//${twin}${url.port ? `:${url.port}` : ''}`)
      }
    } catch {
      // Ignore malformed values.
    }
  }
  add(getServerSideURL())
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  add(process.env.VERCEL_BRANCH_URL)
  add(process.env.VERCEL_URL)
  return [...origins]
}

/** Admin "Preview" and live-preview iframe URL for a site path. */
export const previewPath = (path: string) =>
  `/next/preview?${new URLSearchParams({
    path,
    previewSecret: process.env.PREVIEW_SECRET || '',
  }).toString()}`
