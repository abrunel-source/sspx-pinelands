import type { GlobalConfig } from 'payload'

import { globalAccess } from '../access/permissions'
import { revalidateSite } from '../hooks/revalidate'

export const AnnouncementBanner: GlobalConfig = {
  slug: 'announcement-banner',
  label: 'Announcement banner',
  admin: {
    group: 'Content',
    description:
      'A banner for a coming event: shown large under the welcome section of the home page, and as a slim strip under the menu on every other page.',
  },
  access: globalAccess('announcement-banner'),
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'enabled', label: 'Show the banner', type: 'checkbox', admin: { width: '34%' } },
        {
          name: 'hideAfter',
          label: 'Remove it after',
          type: 'date',
          admin: {
            width: '33%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
            description: 'From the next day the banner is hidden, and the daily job switches it off.',
          },
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'christmas',
          options: [
            { label: 'Christmas', value: 'christmas' },
            { label: 'Plain', value: 'plain' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    { name: 'eyebrow', label: 'Small heading', type: 'text', admin: { placeholder: 'At the chapel' } },
    { name: 'heading', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          label: 'Starts',
          type: 'date',
          admin: { width: '50%', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } },
        },
        {
          name: 'endsAt',
          label: 'Ends',
          type: 'date',
          admin: { width: '50%', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } },
        },
      ],
    },
    { name: 'place', type: 'text' },
    { name: 'text', type: 'textarea' },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. Shown beside the text on the home page.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'buttonLabel', type: 'text', admin: { width: '50%' } },
        { name: 'buttonLink', type: 'text', admin: { width: '50%', placeholder: '/#contact' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'secondButtonLabel', type: 'text', admin: { width: '50%' } },
        { name: 'secondButtonLink', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}
