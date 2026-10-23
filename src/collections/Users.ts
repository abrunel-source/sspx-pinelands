import type { Access, CollectionConfig, FieldAccess, Where } from 'payload'

import { can, isSuperAdmin, superAdminFieldAccess } from '../access/permissions'
import { brandedEmail } from '../lib/email'
import { getServerSideURL } from '../lib/url'

const self = (id: unknown): Where => ({ id: { equals: id } })

// Everyone can see and edit their own account. Beyond that, the "Users"
// permission on a role decides. Only super admins can touch super admins.
const read: Access = async ({ req }) => {
  if (!req.user) return false
  if (await can(req, 'users', 'read')) return true
  return self(req.user.id)
}

const update: Access = async ({ req }) => {
  if (!req.user) return false
  if (isSuperAdmin(req)) return true
  if (await can(req, 'users', 'update')) {
    return { or: [self(req.user.id), { superAdmin: { not_equals: true } }] }
  }
  return self(req.user.id)
}

const remove: Access = async ({ req }) => {
  if (!req.user) return false
  const notSelf: Where = { id: { not_equals: req.user.id } }
  if (isSuperAdmin(req)) return notSelf
  if (await can(req, 'users', 'delete')) return { and: [notSelf, { superAdmin: { not_equals: true } }] }
  return false
}

// Nobody but a super admin may change their own roles, otherwise a user with
// "Edit users" could hand themselves any role.
const rolesFieldUpdate: FieldAccess = async ({ req, id }) => {
  if (isSuperAdmin(req)) return true
  if (!req.user || String(id) === String(req.user.id)) return false
  return Boolean(await can(req, 'users', 'update'))
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'superAdmin'],
    group: 'Admin',
    description: 'People who can sign in. What each person can see and edit is set by their roles.',
  },
  auth: {
    depth: 0,
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    forgotPassword: {
      generateEmailSubject: () => 'Reset your password · SSPX Cape Town',
      generateEmailHTML: (args) => {
        const url = `${getServerSideURL()}/admin/reset/${args?.token}`
        const name = (args?.user as { name?: string } | undefined)?.name
        return brandedEmail({
          heading: 'Reset your password',
          body: `<p>${name ? `Dear ${name},` : 'Hello,'}</p>
<p>Someone asked to reset the password for your account on the SSPX Cape Town website. If this was you, use the button below to choose a new password. The link is valid for one hour.</p>
<p>If you did not ask for this, you can ignore this email; your password will not change.</p>`,
          button: { label: 'Choose a new password', url },
        })
      },
    },
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: async ({ req }) => Boolean(await can(req, 'users', 'create')),
    read,
    update,
    delete: remove,
    unlock: async ({ req }) => Boolean(await can(req, 'users', 'update')),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      saveToJWT: false,
      admin: {
        description: 'A user can do anything any of their roles allow.',
      },
      access: {
        create: async ({ req }) => Boolean(await can(req, 'users', 'create')),
        update: rolesFieldUpdate,
      },
    },
    {
      name: 'superAdmin',
      label: 'Super admin',
      type: 'checkbox',
      defaultValue: false,
      saveToJWT: true,
      admin: {
        position: 'sidebar',
        description:
          'Can see and change everything, including users and roles. The first account created is a super admin.',
      },
      access: {
        create: superAdminFieldAccess,
        update: superAdminFieldAccess,
      },
    },
  ],
  hooks: {
    beforeChange: [
      // The very first account becomes a super admin so the site can be set up.
      async ({ operation, data, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
          req,
        })
        if (totalDocs === 0) data.superAdmin = true
        return data
      },
    ],
  },
  timestamps: true,
}
