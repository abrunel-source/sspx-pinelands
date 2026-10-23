import type { Payload } from 'payload'

// Finds the newest video on the chapel's YouTube channel (the Sunday homily)
// from YouTube's public channel feed. No API key is needed.

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]?.trim()

const decode = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

export type LatestVideo = { videoId: string; title: string; publishedAt: string }

export const fetchLatestVideo = async (channelId: string): Promise<LatestVideo | null> => {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`)
  const xml = await res.text()

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1])
  const videos = entries
    .map((entry) => ({
      videoId: tag(entry, 'yt:videoId') ?? '',
      title: decode(tag(entry, 'title') ?? ''),
      publishedAt: tag(entry, 'published') ?? '',
    }))
    .filter((v) => /^[\w-]{6,20}$/.test(v.videoId) && v.publishedAt)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return videos[0] ?? null
}

/** Stores the newest homily in Site settings. Returns what changed. */
export const syncLatestHomily = async (payload: Payload) => {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const channelId = settings.youtubeChannelId || 'UCALIHWtnVE-4Tqe-mW8Xuyw'
  const latest = await fetchLatestVideo(channelId)
  const now = new Date().toISOString()

  if (!latest) return { updated: false, reason: 'no videos found' }

  const changed = latest.videoId !== settings.latestHomily?.videoId
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { latestHomily: { ...latest, checkedAt: now } },
    // Only clear the page cache when there is actually a new video.
    context: { disableRevalidate: !changed },
  })
  return { updated: changed, video: latest }
}
