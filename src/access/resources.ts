// Every part of the CMS that can be permissioned. The Roles collection builds
// its permission matrix from this list, and the access helpers check against
// it, so adding a new collection or global here makes it manageable per role.

export type Action = 'read' | 'create' | 'update' | 'delete' | 'publish'

export type Resource = {
  /** Collection or global slug */
  slug: string
  label: string
  kind: 'collection' | 'global'
  description: string
  actions: Action[]
  /** Collection records who created each item, so a role can be limited to its own items. */
  supportsOwn?: boolean
}

export const RESOURCES = [
  {
    slug: 'posts',
    label: 'News & articles',
    kind: 'collection',
    description: 'News posts, announcements and reading published on the website.',
    actions: ['read', 'create', 'update', 'delete', 'publish'],
    supportsOwn: true,
  },
  {
    slug: 'events',
    label: 'Events',
    kind: 'collection',
    description: 'Upcoming parish events shown in the Community section.',
    actions: ['read', 'create', 'update', 'delete', 'publish'],
    supportsOwn: true,
  },
  {
    slug: 'feasts',
    label: 'Feasts & calendar',
    kind: 'collection',
    description: 'The liturgical calendar shown in “Feasts in the coming days”.',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    slug: 'media',
    label: 'Media library',
    kind: 'collection',
    description: 'Photos and files used across the website.',
    actions: ['read', 'create', 'update', 'delete'],
    supportsOwn: true,
  },
  {
    slug: 'form-submissions',
    label: 'Form submissions',
    kind: 'collection',
    description: 'Messages, mailing-list sign-ups and school registrations sent from the website.',
    actions: ['read', 'update', 'delete'],
  },
  {
    slug: 'home-page',
    label: 'Home page',
    kind: 'global',
    description: 'All the text and photos on the home page.',
    actions: ['read', 'update', 'publish'],
  },
  {
    slug: 'mass-schedule',
    label: 'Mass schedule',
    kind: 'global',
    description: 'Mass times, confession times and the notice bar at the top of every page.',
    actions: ['read', 'update', 'publish'],
  },
  {
    slug: 'site-settings',
    label: 'Site settings',
    kind: 'global',
    description: 'Contact details, address, map and the email address forms are sent to.',
    actions: ['read', 'update'],
  },
  {
    slug: 'users',
    label: 'Users',
    kind: 'collection',
    description: 'People who can sign in to this admin panel.',
    actions: ['read', 'create', 'update', 'delete'],
  },
  {
    slug: 'roles',
    label: 'Roles & permissions',
    kind: 'collection',
    description: 'The roles on this screen, and what each one may do.',
    actions: ['read', 'create', 'update', 'delete'],
  },
] as const satisfies readonly Resource[]

export type ResourceSlug = (typeof RESOURCES)[number]['slug']

export const ACTION_LABELS: Record<Action, string> = {
  read: 'See',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  publish: 'Publish',
}

/** Field names inside a role's `permissions` group cannot contain dashes. */
export const permissionKey = (slug: string) => slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
