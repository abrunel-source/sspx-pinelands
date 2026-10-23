import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

// Pages are rendered once and cached. These hooks refresh the cache whenever
// published content changes, so edits show on the live site immediately.
// Saving a draft does not touch the cache; drafts are only seen in preview.

const safeRevalidate = (path: string, type?: 'layout' | 'page') => {
  try {
    revalidatePath(path, type)
  } catch {
    // Outside a Next.js request (seed script, migrations) there is no cache to clear.
  }
}

/** Every page shows the header, footer and Mass times, so refresh the whole site. */
export const revalidateSite: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req.context.disableRevalidate) safeRevalidate('/', 'layout')
  return doc
}

export const revalidatePost: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  if (req.context.disableRevalidate) return doc
  if (doc._status === 'published' || previousDoc?._status === 'published') {
    safeRevalidate('/')
    safeRevalidate('/news')
    safeRevalidate(`/news/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) safeRevalidate(`/news/${previousDoc.slug}`)
  }
  return doc
}

export const revalidatePostDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (req.context.disableRevalidate) return doc
  safeRevalidate('/')
  safeRevalidate('/news')
  safeRevalidate(`/news/${doc?.slug}`)
  return doc
}

export const revalidateHome: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context.disableRevalidate) safeRevalidate('/')
  return doc
}

export const revalidateHomeDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context.disableRevalidate) safeRevalidate('/')
  return doc
}
