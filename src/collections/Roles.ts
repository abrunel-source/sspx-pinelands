import type { Access, CollectionConfig, Field } from 'payload'

import { can, getRoleIds, isSuperAdmin } from '../access/permissions'
import { ACTION_LABELS, type Action, RESOURCES, permissionKey } from '../access/resources'

// One row of checkboxes per part of the CMS, generated from RESOURCES.
const permissionFields: Field[] = RESOURCES.map((resource) => {
  const actions = resource.actions as readonly Action[]
  const checkboxes: Field[] = actions.map((action) => ({
    name: action,
    label: ACTION_LABELS[action],
    type: 'checkbox',
    defaultValue: false,
    admin: { width: '16%' },
  }))

  if ('supportsOwn' in resource && resource.supportsOwn) {
    checkboxes.push({
      name: 'ownOnly',
      label: 'Own items only',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        width: '20%',
        description: 'Limit to items this person created.',
      },
    })
  }

  return {
    name: permissionKey(resource.slug),
    label: resource.label,
    type: 'group',
    admin: { description: resource.description },
    fields: [{ type: 'row', fields: checkboxes }],
  }
})

// A non-super-admin may never edit or delete a role they hold themselves,
// otherwise they could grant themselves more power.
const notOwnRoles =
  (action: 'update' | 'delete'): Access =>
  async ({ req }) => {
    if (isSuperAdmin(req)) return true
    if (!(await can(req, 'roles', action))) return false
    const own = getRoleIds(req.user as never)
    return own.length ? { id: { not_in: own } } : true
  }

export const Roles: CollectionConfig = {
  slug: 'roles',
  labels: { singular: 'Role', plural: 'Roles' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description', 'updatedAt'],
    group: 'Admin',
    description:
      'Each role is a set of permissions. "See" also controls whether a section appears in the menu. Give people the smallest role they need.',
  },
  access: {
    read: async ({ req }) => {
      if (!req.user) return false
      if (await can(req, 'roles', 'read')) return true
      // Everyone may see the roles they hold.
      return { id: { in: getRoleIds(req.user as never) } }
    },
    create: async ({ req }) => Boolean(await can(req, 'roles', 'create')),
    update: notOwnRoles('update'),
    delete: notOwnRoles('delete'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Who this role is for, in a sentence.' },
    },
    {
      name: 'permissions',
      type: 'group',
      admin: { hideGutter: true },
      fields: permissionFields,
    },
  ],
}
