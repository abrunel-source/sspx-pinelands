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

// YouTube's feed sometimes answers 404 or 500 for hours at a time, so the
// channel's Videos page is read as a fallback.
const BROWSER_HEADERS = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
  'accept-language': 'en',
}

const get = (url: string, headers?: Record<string, string>) =>
  fetch(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(15_000) })

const fromFeed = async (channelId: string): Promise<LatestVideo | null> => {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
  let res = await get(url)
  if (!res.ok) {
    await new Promise((resolve) => setTimeout(resolve, 2_000))
    res = await get(url)
  }
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

// "Oct 18, 2026" from the video page.
const watchPageDate = (html: string) => {
  const text = html.match(/"publishDate":\{"simpleText":"([^"]+)"/)?.[1]
  const time = text ? Date.parse(`${text} 12:00 UTC`) : NaN
  return Number.isNaN(time) ? '' : new Date(time).toISOString()
}

// The chapel's titles carry the Mass date, e.g. "SSPX Catholic Church Pinelands 2026 10 18".
const titleDate = (title: string) => {
  const m = title.match(/\b(20\d\d)[ ./-](\d{1,2})[ ./-](\d{1,2})\b/)
  if (!m) return ''
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12))
  return date.getUTCMonth() === Number(m[2]) - 1 ? date.toISOString() : ''
}

const fromChannelPage = async (channelId: string): Promise<LatestVideo | null> => {
  const res = await get(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, BROWSER_HEADERS)
  if (!res.ok) throw new Error(`YouTube channel page returned ${res.status}`)
  const html = await res.text()
  // The Videos tab lists uploads newest first.
  const list = html.indexOf('"richItemRenderer"')
  if (list === -1) throw new Error('YouTube channel page had no video list')
  const videoId = html.slice(list).match(/"videoId":"([\w-]{11})"/)?.[1]
  if (!videoId) return null

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const [title, watch] = await Promise.all([
    get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ title?: string }>) : {}))
      .catch(() => ({}))
      .then((data: { title?: string }) => data.title ?? ''),
    get(watchUrl, BROWSER_HEADERS)
      .then((r) => (r.ok ? r.text() : ''))
      .catch(() => ''),
  ])
  return { videoId, title, publishedAt: watchPageDate(watch) || titleDate(title) }
}

/** The newest video on the channel: from the feed, or the Videos page if the feed is down. */
export const fetchLatestVideo = async (channelId: string): Promise<LatestVideo | null> => {
  try {
    return await fromFeed(channelId)
  } catch (feedError) {
    try {
      return await fromChannelPage(channelId)
    } catch (pageError) {
      throw new Error(`${(feedError as Error).message}; ${(pageError as Error).message}`)
    }
  }
}

/** Stores the newest homily in Site settings. Returns what changed. */
export const syncLatestHomily = async (payload: Payload) => {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const channelId = settings.youtubeChannelId || 'UCALIHWtnVE-4Tqe-mW8Xuyw'
  const latest = await fetchLatestVideo(channelId)
  const now = new Date().toISOString()

  if (!latest) return { updated: false, reason: 'no videos found' }

  const changed = latest.videoId !== settings.latestHomily?.videoId
  const stored = changed ? undefined : settings.latestHomily
  const video = {
    videoId: latest.videoId,
    title: latest.title || stored?.title || '',
    publishedAt: latest.publishedAt || stored?.publishedAt || now,
  }
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { latestHomily: { ...video, checkedAt: now } },
    // Only clear the page cache when there is actually a new video.
    context: { disableRevalidate: !changed },
  })
  return { updated: changed, video }
}
