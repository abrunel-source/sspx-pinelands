import type { GlobalConfig } from 'payload'

import { enforceGlobalPublish, globalAccess } from '../access/permissions'
import { revalidateSite } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

export const MassSchedule: GlobalConfig = {
  slug: 'mass-schedule',
  label: 'Mass schedule',
  admin: {
    group: 'Content',
    description: 'Shown on the home page, in the footer and in the notice bar at the top of every page.',
    livePreview: { url: () => previewPath('/#mass') },
  },
  access: globalAccess('mass-schedule'),
  hooks: {
    beforeChange: [enforceGlobalPublish('mass-schedule')],
    afterChange: [revalidateSite],
  },
  versions: { drafts: { autosave: { interval: 800 } }, max: 30 },
  fields: [
    {
      name: 'notice',
      label: 'Notice bar',
      type: 'text',
      admin: {
        description:
          'Optional. Replaces “This Sunday: …” at the top of every page, e.g. “No Mass on Monday 2 November”. Leave empty for the usual Sunday times.',
      },
    },
    {
      name: 'masses',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Mass', plural: 'Masses' },
      admin: { initCollapsed: false, components: { RowLabel: '@/components/admin/MassRowLabel#MassRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              admin: { width: '30%' },
              options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => ({
                label: d,
                value: d,
              })),
            },
            { name: 'time', type: 'text', required: true, admin: { width: '20%', placeholder: '9:00' } },
            {
              name: 'description',
              type: 'text',
              defaultValue: 'Holy Mass',
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'note',
          type: 'text',
          admin: { placeholder: 'Confessions from 8:00' },
        },
        {
          name: 'highlight',
          type: 'checkbox',
          admin: { description: 'Show this Mass in the dark card, and in the notice bar.' },
        },
      ],
    },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue:
        'All Masses are offered according to the 1962 Roman Missal. Confessions are heard before Sunday Mass, and by appointment with the priest.',
    },
    {
      name: 'specialNote',
      label: 'First Fridays & Saturdays note',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'First Fridays & First Saturdays:' },
        { name: 'text', type: 'text', defaultValue: 'Rosary and Benediction 30 minutes before the usual Mass time.' },
      ],
    },
  ],
}
