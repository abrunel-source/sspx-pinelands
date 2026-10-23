import type { Field } from 'payload'

/**
 * Records who created an item. Roles limited to "own items only" are checked
 * against this field. It is set automatically and cannot be edited.
 */
export const createdByField: Field = {
  name: 'createdBy',
  type: 'relationship',
  relationTo: 'users',
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Set automatically.',
  },
  access: {
    update: () => false,
  },
  hooks: {
    beforeChange: [
      ({ operation, req, value }) => {
        if (operation === 'create' && req.user?.collection === 'users') return req.user.id
        return value
      },
    ],
  },
}
