'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The video's thumbnail with a play button; the YouTube player loads when it
 * is pressed. An image always shows (Safari on iPhone can leave a lazily
 * loaded player black) and the page stays light until someone presses play.
 */
export const YouTubeEmbed = ({ videoId, title }: { videoId: string; title: string }) => {
  const [playing, setPlaying] = useState(false)
  // The large thumbnail is missing for some videos; YouTube then answers 404
  // or a 120px placeholder, so fall back to the standard one.
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`)
  const fallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  const img = useRef<HTMLImageElement>(null)
  const checkThumb = (el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth <= 120 && el.src !== fallback) setThumb(fallback)
  }
  // The image may have finished (or failed) before this code ran.
  useEffect(() => checkThumb(img.current))

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&autoplay=1&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    )
  }

  return (
    <button type="button" className="yt-facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
      <img
        ref={img}
        src={thumb}
        alt=""
        decoding="async"
        onError={() => thumb !== fallback && setThumb(fallback)}
        onLoad={(e) => checkThumb(e.currentTarget)}
      />
      <span className="yt-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      </span>
    </button>
  )
}
