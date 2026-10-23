import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { collectionAccess, enforceCollectionPublish } from '../access/permissions'
import { createdByField } from '../fields/createdBy'
import { revalidatePost, revalidatePostDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'News post', plural: 'News & articles' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    description: 'Announcements, reading and parish news. Save as a draft, preview, then publish.',
    livePreview: {
      url: ({ data }) => (data?.slug ? previewPath(`/news/${data.slug}`) : null),
    },
    preview: (data) => (data?.slug ? previewPath(`/news/${data.slug as string}`) : null),
  },
  access: collectionAccess('posts', 'published'),
  defaultSort: '-publishedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: { description: 'One or two sentences shown on the home page and the news list.' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    slugField({ position: 'sidebar' }),
    {
      name: 'publishedAt',
      label: 'Publish date',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
        description: 'Filled in automatically when first published.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) =>
            siblingData._status === 'published' && !value ? new Date().toISOString() : value,
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'announcement',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Announcement', value: 'announcement' },
        { label: 'Reading', value: 'reading' },
        { label: 'Sermon', value: 'sermon' },
        { label: 'Parish life', value: 'parish-life' },
      ],
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Shown as the byline, e.g. "Archbishop Marcel Lefebvre".',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
    createdByField,
  ],
  hooks: {
    beforeChange: [enforceCollectionPublish('posts')],
    afterChange: [revalidatePost],
    afterDelete: [revalidatePostDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
