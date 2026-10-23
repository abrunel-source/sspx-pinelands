import Image from 'next/image'

import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/lib/url'

// Payload prefixes local uploads with the server URL. Make those relative so
// next/image treats them as local files rather than remote images.
const toSrc = (url: string) => {
  const origin = getServerSideURL()
  return url.startsWith(origin) ? url.slice(origin.length) || '/' : url
}

type Props = {
  media?: Media | number | null
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  /** Used when the editor left the alt text empty, or the image is decorative. */
  alt?: string
}

/** Renders a Media library item with next/image, honouring its focal point. */
export const MediaImage = ({ media, className, sizes = '100vw', priority, fill, alt }: Props) => {
  if (!media || typeof media !== 'object' || !media.url) return null

  const objectPosition =
    typeof media.focalX === 'number' && typeof media.focalY === 'number'
      ? `${media.focalX}% ${media.focalY}%`
      : undefined
  // SVGs are served as-is; they never go through the image optimiser.
  const unoptimized = media.mimeType === 'image/svg+xml'
  const common = {
    src: toSrc(media.url),
    alt: alt ?? media.alt ?? '',
    className,
    sizes,
    priority,
    unoptimized,
    style: objectPosition ? { objectPosition } : undefined,
  }

  if (fill) return <Image {...common} fill />
  return <Image {...common} width={media.width ?? 1200} height={media.height ?? 800} />
}
