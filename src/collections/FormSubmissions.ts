import type { CollectionConfig } from 'payload'

import { collectionAccess } from '../access/permissions'

export const FORM_TYPES = [
  { label: 'Contact message', value: 'contact' },
  { label: 'Mailing list', value: 'newsletter' },
  { label: 'School registration', value: 'school' },
] as const

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: { singular: 'Form submission', plural: 'Form submissions' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'email',
    defaultColumns: ['formType', 'name', 'email', 'topic', 'status', 'createdAt'],
    description:
      'Everything sent from the website forms. Each one is also emailed to the address in Site settings.',
  },
  // Submissions are created by the website's server code, never through the public API.
  access: { ...collectionAccess('form-submissions', 'none'), create: () => false },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'formType',
          label: 'Form',
          type: 'select',
          required: true,
          options: [...FORM_TYPES],
          admin: { readOnly: true, width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'In progress', value: 'in-progress' },
            { label: 'Done', value: 'done' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', admin: { readOnly: true, width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { readOnly: true, width: '50%' } },
      ],
    },
    { name: 'topic', type: 'text', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', admin: { readOnly: true } },
    {
      name: 'notes',
      label: 'Internal notes',
      type: 'textarea',
      admin: { description: 'Only visible here, never sent to the person.' },
    },
    {
      name: 'emailDelivered',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Whether the notification email was sent successfully.',
      },
    },
  ],
}
