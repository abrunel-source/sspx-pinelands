import type { DefaultTypedEditorState, SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { slugify } from '@/lib/format'
import type { Media } from '@/payload-types'

import { MediaImage } from './MediaImage'

type TextLike = { text?: string; children?: TextLike[] }

const plainText = (node: TextLike): string =>
  node.text ?? (node.children ?? []).map(plainText).join('')

/** The second-level headings of a document, for a table of contents. */
export const extractHeadings = (data?: DefaultTypedEditorState | null) =>
  ((data?.root?.children ?? []) as unknown as SerializedHeadingNode[])
    .filter((node) => node.type === 'heading' && node.tag === 'h2')
    .map((node) => {
      const text = plainText(node as unknown as TextLike)
      return { text, id: slugify(text) }
    })

type UploadLike = { type: 'upload'; relationTo?: string; value?: Media | number | null }
type PhotoGroup = { type: 'photoGroup'; photos: UploadLike[] }

const isPhoto = (node: { type?: string }): node is UploadLike =>
  node.type === 'upload' && typeof (node as UploadLike).value === 'object'

/** Photos placed one after another in the editor are shown together as a group. */
const groupPhotos = (data: DefaultTypedEditorState): DefaultTypedEditorState => {
  const children: unknown[] = []
  for (const node of data.root.children as { type?: string }[]) {
    const last = children.at(-1) as PhotoGroup | undefined
    if (isPhoto(node) && last?.type === 'photoGroup') last.photos.push(node)
    else children.push(isPhoto(node) ? { type: 'photoGroup', photos: [node] } : node)
  }
  return { ...data, root: { ...data.root, children: children as typeof data.root.children } }
}

const Photo = ({ media, sizes }: { media: Media; sizes: string }) => (
  <figure>
    <a href={media.url ?? undefined} target="_blank" rel="noopener">
      <MediaImage media={media} sizes={sizes} />
      <span className="visually-hidden"> (opens the full-size photo)</span>
    </a>
    {media.caption && <figcaption>{media.caption}</figcaption>}
  </figure>
)

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  photoGroup: ({ node }: { node: PhotoGroup }) => {
    const photos = node.photos.map((p) => p.value as Media)
    const sizes = photos.length > 1 ? '(max-width: 560px) 100vw, 240px' : '(max-width: 760px) 100vw, 720px'
    return (
      <div className={`post-photos${photos.length > 1 ? ' is-group' : ''}`}>
        {photos.map((media) => (
          <Photo key={media.id} media={media} sizes={sizes} />
        ))}
      </div>
    )
  },
  // Headings get an id so the table of contents and shared links can jump to them.
  heading: ({ node, nodesToJSX }) => {
    const Tag = (['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2') as 'h2'
    const id = node.tag === 'h2' ? slugify(plainText(node as unknown as TextLike)) : undefined
    return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
})

export const RichText = ({ data, className }: { data?: DefaultTypedEditorState | null; className?: string }) =>
  data ? <LexicalRichText data={groupPhotos(data)} converters={converters} className={className} disableContainer /> : null
