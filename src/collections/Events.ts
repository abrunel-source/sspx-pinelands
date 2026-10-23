import type { CollectionConfig } from 'payload'

import { collectionAccess, enforceCollectionPublish } from '../access/permissions'
import { createdByField } from '../fields/createdBy'
import { revalidateHome, revalidateHomeDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', '_status'],
    description: 'Feast days, fêtes and gatherings. The next upcoming event appears in the Community section.',
    livePreview: { url: () => previewPath('/#community') },
  },
  access: collectionAccess('events', 'published'),
  defaultSort: 'startsAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          label: 'Starts',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } },
        },
        {
          name: 'endsAt',
          label: 'Ends',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } },
        },
      ],
    },
    {
      name: 'location',
      type: 'text',
      admin: { description: 'Leave empty if it is at the chapel.' },
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    createdByField,
  ],
  hooks: {
    beforeChange: [enforceCollectionPublish('events')],
    afterChange: [revalidateHome],
    afterDelete: [revalidateHomeDelete],
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 20,
  },
}
