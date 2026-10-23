import type {
  Access,
  CollectionBeforeChangeHook,
  FieldAccess,
  GlobalBeforeChangeHook,
  PayloadRequest,
  Where,
} from 'payload'
import { Forbidden } from 'payload'

import { type Action, type ResourceSlug, RESOURCES, permissionKey } from './resources'

type Grant = { granted: boolean; ownOnly: boolean }
type PermissionMap = Partial<Record<ResourceSlug, Partial<Record<Action, Grant>>>>

type RoleDoc = {
  id: number | string
  permissions?: Record<string, Partial<Record<Action | 'ownOnly', boolean | null>> | null> | null
}

type AuthUser = {
  id: number | string
  superAdmin?: boolean | null
  roles?: (number | string | RoleDoc)[] | null
}

const getUser = (req: PayloadRequest): AuthUser | null =>
  req.user && req.user.collection === 'users' ? (req.user as unknown as AuthUser) : null

export const isSuperAdmin = (req: PayloadRequest): boolean => Boolean(getUser(req)?.superAdmin)

export const getRoleIds = (user: AuthUser | null): (number | string)[] =>
  (user?.roles ?? []).map((role) => (typeof role === 'object' ? role.id : role))

/**
 * Merges every role assigned to the signed-in user into one permission map.
 * An action is granted if any role grants it. It is limited to the user's own
 * items only if every role that grants it is limited that way.
 * Cached on the request so a page full of access checks costs one query.
 */
export const getPermissions = async (req: PayloadRequest): Promise<PermissionMap> => {
  const user = getUser(req)
  if (!user) return {}

  const cacheKey = `permissions:${user.id}`
  const cached = req.context?.[cacheKey] as PermissionMap | undefined
  if (cached) return cached

  const roleIds = getRoleIds(user)
  let roles: RoleDoc[] = []
  if (roleIds.length) {
    const result = await req.payload.find({
      collection: 'roles',
      where: { id: { in: roleIds } },
      depth: 0,
      limit: 100,
      pagination: false,
      overrideAccess: true,
      req,
    })
    roles = result.docs as unknown as RoleDoc[]
  }

  const map: PermissionMap = {}
  for (const resource of RESOURCES) {
    const key = permissionKey(resource.slug)
    const entry: Partial<Record<Action, Grant>> = {}
    for (const action of resource.actions as readonly Action[]) {
      const granting = roles.filter((role) => role.permissions?.[key]?.[action])
      entry[action] = {
        granted: granting.length > 0,
        ownOnly:
          'supportsOwn' in resource && resource.supportsOwn
            ? granting.length > 0 && granting.every((role) => role.permissions?.[key]?.ownOnly)
            : false,
      }
    }
    map[resource.slug] = entry
  }

  if (req.context) req.context[cacheKey] = map
  return map
}

/** `true` (everything), `'own'` (only items the user created) or `false`. */
export const can = async (
  req: PayloadRequest,
  slug: ResourceSlug,
  action: Action,
): Promise<boolean | 'own'> => {
  const user = getUser(req)
  if (!user) return false
  if (user.superAdmin) return true
  const grant = (await getPermissions(req))[slug]?.[action]
  if (!grant?.granted) return false
  return grant.ownOnly ? 'own' : true
}

const ownWhere = (req: PayloadRequest): Where => ({
  createdBy: { equals: getUser(req)?.id },
})

const toAccessResult = (req: PayloadRequest, result: boolean | 'own') =>
  result === 'own' ? ownWhere(req) : result

type PublicRead = 'all' | 'published' | 'none'

/**
 * Access control for a permissioned collection.
 * - Visitors (not signed in) get `publicRead`: everything, only published items, or nothing.
 * - Signed-in users get exactly what their roles allow. A user without "See"
 *   permission does not see the collection in the admin panel at all.
 */
export const collectionAccess = (slug: ResourceSlug, publicRead: PublicRead) => {
  const read: Access = async ({ req }) => {
    if (!req.user) {
      if (publicRead === 'all') return true
      if (publicRead === 'published') return { _status: { equals: 'published' } }
      return false
    }
    return toAccessResult(req, await can(req, slug, 'read'))
  }

  const action =
    (name: Action): Access =>
    async ({ req }) =>
      toAccessResult(req, await can(req, slug, name))

  return {
    read,
    readVersions: action('read'),
    create: action('create'),
    update: action('update'),
    delete: action('delete'),
  }
}

/** Access control for a permissioned global. Visitors may always read published globals. */
export const globalAccess = (slug: ResourceSlug) => ({
  read: (async ({ req }) => (req.user ? Boolean(await can(req, slug, 'read')) : true)) as Access,
  readVersions: (async ({ req }) => Boolean(await can(req, slug, 'read'))) as Access,
  update: (async ({ req }) => Boolean(await can(req, slug, 'update'))) as Access,
})

const assertCanPublish = async (
  req: PayloadRequest,
  slug: ResourceSlug,
  data: Record<string, unknown> | undefined,
  originalDoc?: Record<string, unknown> | null,
) => {
  // Local API calls without a user (seed scripts, server actions) are trusted.
  if (!req.user) return
  if (data?._status !== 'published') return

  const allowed = await can(req, slug, 'publish')
  if (allowed === true) return
  if (allowed === 'own' && (!originalDoc || originalDoc.createdBy === req.user.id)) return

  throw new Forbidden(req.t)
}

/** Blocks publishing for users whose roles may only save drafts. */
export const enforceCollectionPublish =
  (slug: ResourceSlug): CollectionBeforeChangeHook =>
  async ({ req, data, originalDoc }) => {
    const createdBy =
      originalDoc && typeof originalDoc.createdBy === 'object' && originalDoc.createdBy
        ? (originalDoc.createdBy as { id: unknown }).id
        : originalDoc?.createdBy
    await assertCanPublish(req, slug, data, originalDoc ? { ...originalDoc, createdBy } : null)
    return data
  }

export const enforceGlobalPublish =
  (slug: ResourceSlug): GlobalBeforeChangeHook =>
  async ({ req, data }) => {
    await assertCanPublish(req, slug, data)
    return data
  }

export const superAdminFieldAccess: FieldAccess = ({ req }) => isSuperAdmin(req)
