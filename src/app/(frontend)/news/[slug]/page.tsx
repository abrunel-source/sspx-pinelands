import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/site/MediaImage'
import { Divider } from '@/components/site/Ornament'
import { RichText, extractHeadings } from '@/components/site/RichText'
import { CATEGORY_LABELS, formatDate } from '@/lib/format'
import { getPayloadClient } from '@/lib/payload'
import { getPostBySlug } from '@/lib/queries'
import type { Media } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      select: { slug: true },
      limit: 1000,
      pagination: false,
    })
    return docs.filter((d) => d.slug).map((d) => ({ slug: d.slug as string }))
  } catch {
    // No database during the build: pages are rendered on first visit instead.
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(decodeURIComponent(slug))
  if (!post) return {}
  const image = typeof post.meta?.image === 'object' ? post.meta?.image : typeof post.coverImage === 'object' ? post.coverImage : null
  return {
    title: post.meta?.title ? { absolute: post.meta.title } : post.title,
    description: post.meta?.description || post.excerpt || undefined,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      publishedTime: post.publishedAt || undefined,
      images: image?.url ? [{ url: image.url }] : undefined,
    },
  }
}

/** The whole photo, never taller than 680px or three quarters of the screen, never enlarged. */
const coverWidth = ({ width, height }: Media) => {
  if (!width || !height) return undefined
  const ratio = (width / height).toFixed(4)
  return `min(100%, ${width}px, calc(680px * ${ratio}), calc(75vh * ${ratio}))`
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(decodeURIComponent(slug))
  if (!post) notFound()

  const { isEnabled: preview } = await draftMode()
  const headings = extractHeadings(post.content)
  const showToc = headings.length >= 4
  const cover = typeof post.coverImage === 'object' && post.coverImage?.url ? post.coverImage : null

  return (
    <article>
      <div className="page-head pat-navy rule-bottom on-dark">
        <div className="container">
          <p className="eyebrow">
            {post.category ? CATEGORY_LABELS[post.category] : 'News'}
            {preview && post._status !== 'published' ? ' · Draft' : ''}
          </p>
          <h1 className="display">{post.title}</h1>
          <Divider light />
          <p className="byline">
            {post.author && (
              <>
                By <strong>{post.author}</strong>
                {post.publishedAt ? ' · ' : ''}
              </>
            )}
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          </p>
        </div>
      </div>
      <div className="container section">
        <div className={showToc ? 'article-layout' : undefined}>
          <div>
            {cover && (
              <figure className="article-cover" style={{ width: coverWidth(cover) }}>
                <MediaImage media={cover} sizes="(max-width: 760px) 100vw, 720px" priority />
              </figure>
            )}
            <div className="prose">
              <RichText data={post.content} />
            </div>
          </div>
          {showToc && (
            <aside aria-label="Contents">
              <details className="toc double-frame" open>
                <summary>Contents</summary>
                <ol>
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </details>
            </aside>
          )}
        </div>
        <Link href="/news" className="back-link">← All news</Link>
      </div>
    </article>
  )
}
