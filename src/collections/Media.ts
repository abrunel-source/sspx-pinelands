import type { CollectionConfig } from 'payload'

import { collectionAccess } from '../access/permissions'
import { createdByField } from '../fields/createdBy'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media item', plural: 'Media library' },
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description: 'Photos and files. Always describe the photo in "Alt text" for visitors using screen readers.',
  },
  access: collectionAccess('media', 'all'),
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 900 },
      { name: 'large', width: 1600 },
      { name: 'hero', width: 2400 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      required: true,
      admin: {
        description: 'What the photo shows, e.g. "Children dressed as saints with the priest".',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    createdByField,
  ],
}
