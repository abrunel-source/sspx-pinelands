import { randomBytes } from 'crypto'

import type { Post } from '@/payload-types'

// Photos of the Christ the King procession, 25 October 2026, placed in the
// article where its text has a "[photos N]" line.

export const PROCESSION_PHOTOS = [
  {
    file: 'ctk-2026-servers-park.jpg',
    alt: 'Altar servers carrying the processional cross and candles along the path beside the park, the faithful following under the trees',
    caption: 'The cross and candles lead the way around the park.',
  },
  {
    file: 'ctk-2026-thurifer.jpg',
    alt: 'The thurifer in cassock and surplice walking ahead of two servers carrying candles and the processional cross',
    caption: 'The thurifer, with the cross and candles.',
  },
  {
    file: 'ctk-2026-children.jpg',
    alt: 'Young children walking with baskets along the park path, with a lady in a lace veil beside them',
    caption: 'The children with their baskets.',
  },
  {
    file: 'ctk-2026-petals.jpg',
    alt: 'A little girl held by a parishioner, with rose petals in her hand and a basket',
    caption: 'Rose petals ready in hand.',
  },
  {
    file: 'ctk-2026-marshal.jpg',
    alt: 'A parishioner in a dark suit smiling beside a traffic cone on the park path',
    caption: 'Keeping the route safe.',
  },
] as const

type PhotoFile = (typeof PROCESSION_PHOTOS)[number]['file']

/** Which photos replace each "[photos N]" line in the article. */
export const PHOTO_GROUPS: Record<string, PhotoFile[]> = {
  '1': ['ctk-2026-servers-park.jpg', 'ctk-2026-thurifer.jpg'],
  '2': ['ctk-2026-children.jpg', 'ctk-2026-petals.jpg', 'ctk-2026-marshal.jpg'],
}

type Content = Post['content']
type Node = Content['root']['children'][number]

const MARKER = /^\[photos (\d+)\]$/
const textOf = (node: Node): string =>
  typeof node.text === 'string'
    ? node.text
    : ((node.children as Node[] | undefined) ?? []).map(textOf).join('')

const uploadNode = (mediaId: number): Node => ({
  type: 'upload',
  version: 3,
  format: '',
  // Each node with sub-fields needs its own id (not the photo's id).
  id: randomBytes(12).toString('hex'),
  fields: {},
  relationTo: 'media',
  value: mediaId,
})

/**
 * Replaces each "[photos N]" paragraph with its photos. A group whose photos
 * are not all in the library is left out, so a marker never reaches the page.
 */
export const withPhotos = (content: Content, mediaIds: Record<string, number | undefined>): Content => ({
  ...content,
  root: {
    ...content.root,
    children: content.root.children.flatMap((node) => {
      const group = node.type === 'paragraph' ? textOf(node).trim().match(MARKER)?.[1] : undefined
      if (!group) return [node]
      const ids = (PHOTO_GROUPS[group] ?? []).map((file) => mediaIds[file])
      return ids.length && ids.every((id) => typeof id === 'number') ? ids.map((id) => uploadNode(id as number)) : []
    }),
  },
})

/** The article's words without its photos, to tell whether an editor has changed it. */
export const wordsOf = (content: Content) =>
  content.root.children
    .filter((node) => node.type !== 'upload' && !MARKER.test(textOf(node).trim()))
    .map(textOf)
    .join('\n')
    .trim()
