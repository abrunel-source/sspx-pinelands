import type { Metadata } from 'next'
import Link from 'next/link'

import { MediaImage } from '@/components/site/MediaImage'
import { CATEGORY_LABELS, formatDate } from '@/lib/format'
import { getPosts } from '@/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'News & reading',
  description: 'Announcements, reading and parish news from the Chapel of Our Lady of the Blessed Sacrament, SSPX Cape Town.',
  alternates: { canonical: '/news' },
}

export default async function NewsIndex() {
  const posts = await getPosts({ limit: 50 })

  return (
    <>
      <div className="page-head">
        <div className="container">
          <p className="eyebrow">News &amp; Reading</p>
          <h1 className="display">From the chapel</h1>
          <p className="lede">Announcements, reading and parish news.</p>
        </div>
      </div>
      <div className="container section">
        {posts.docs.length === 0 ? (
          <p className="lede">No news has been published yet.</p>
        ) : (
          <ul className="news-list">
            {posts.docs.map((post) => (
              <li key={post.id}>
                <article className="news-feature">
                  {post.coverImage && typeof post.coverImage === 'object' && (
                    <MediaImage media={post.coverImage} sizes="(max-width: 560px) 100vw, 220px" alt="" />
                  )}
                  <div className="body">
                    <span className="news-meta">
                      {formatDate(post.publishedAt)}
                      {post.category ? ` · ${CATEGORY_LABELS[post.category]}` : ''}
                    </span>
                    <h2 className="news-title">
                      <Link href={`/news/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <Link href={`/news/${post.slug}`} className="text-link">
                      Read the article<span className="visually-hidden">: {post.title}</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
