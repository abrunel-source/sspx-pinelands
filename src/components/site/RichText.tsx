import type { DefaultTypedEditorState, SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { slugify } from '@/lib/format'

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

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Headings get an id so the table of contents and shared links can jump to them.
  heading: ({ node, nodesToJSX }) => {
    const Tag = (['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2') as 'h2'
    const id = node.tag === 'h2' ? slugify(plainText(node as unknown as TextLike)) : undefined
    return <Tag id={id}>{nodesToJSX({ nodes: node.children })}</Tag>
  },
})

export const RichText = ({ data, className }: { data?: DefaultTypedEditorState | null; className?: string }) =>
  data ? <LexicalRichText data={data} converters={converters} className={className} disableContainer /> : null
