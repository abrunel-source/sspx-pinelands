import type { CollectionConfig } from 'payload'

import { collectionAccess } from '../access/permissions'
import { revalidateHome, revalidateHomeDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const LITURGICAL_COLOURS = [
  { label: 'White', value: 'white' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Violet', value: 'violet' },
  { label: 'Rose', value: 'rose' },
  { label: 'Black', value: 'black' },
] as const

export const Feasts: CollectionConfig = {
  slug: 'feasts',
  labels: { singular: 'Feast', plural: 'Feasts & calendar' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'colour'],
    description:
      'Feasts shown in “Feasts in the coming days” on the home page; the next four from today appear. Every Friday at 18:00 the calendar is topped up automatically from the 1962 Roman calendar (Missale Meum). Feasts you add yourself are never changed, and replace the automatic entry for that day.',
    livePreview: { url: () => previewPath('/#calendar') },
  },
  access: collectionAccess('feasts', 'all'),
  defaultSort: 'date',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { placeholder: 'Our Lord Jesus Christ the King' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          index: true,
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'EEE d MMM yyyy' } },
        },
        {
          name: 'colour',
          label: 'Liturgical colour',
          type: 'select',
          required: true,
          defaultValue: 'white',
          options: [...LITURGICAL_COLOURS],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Added by hand', value: 'manual' },
        { label: 'Automatic (1962 calendar)', value: 'auto' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatic entries are refreshed every Friday. Edit one and it becomes yours.',
      },
      hooks: {
        // Any edit made in the admin turns an automatic entry into a manual one.
        beforeChange: [({ req, value, operation }) => (req.user && operation === 'update' ? 'manual' : value)],
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHome],
    afterDelete: [revalidateHomeDelete],
  },
}
