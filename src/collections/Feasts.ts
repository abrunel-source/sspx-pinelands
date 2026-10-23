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
      'Feasts shown in “Feasts in the coming days” on the home page. The next four from today appear automatically.',
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
  ],
  hooks: {
    afterChange: [revalidateHome],
    afterDelete: [revalidateHomeDelete],
  },
}
