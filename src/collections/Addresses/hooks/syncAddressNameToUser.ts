import type { CollectionAfterChangeHook } from 'payload'

/**
 * When a customer saves an address with firstName/lastName, sync that name to the
 * user account if the account's name is currently empty.
 */
export const syncAddressNameToUser: CollectionAfterChangeHook = async ({ doc, req }) => {
  const customerId =
    typeof doc.customer === 'object' && doc.customer !== null
      ? (doc.customer as { id?: number }).id
      : doc.customer

  if (customerId == null) return doc

  const firstName = doc.firstName?.trim()
  const lastName = doc.lastName?.trim()
  if (!firstName && !lastName) return doc

  const { payload } = req
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  if (!fullName) return doc

  let user: { name?: string | null } | null
  try {
    user = await payload.findByID({
      collection: 'users',
      id: customerId,
      depth: 0,
      req,
      overrideAccess: true,
    })
  } catch {
    return doc
  }

  const currentName = user?.name?.trim()
  if (currentName != null && currentName !== '') return doc

  try {
    await payload.update({
      collection: 'users',
      id: customerId,
      data: { name: fullName },
      req,
      overrideAccess: true,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    req.payload.logger.warn?.(`syncAddressNameToUser: failed to update user name: ${msg}`)
  }

  return doc
}
