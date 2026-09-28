import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import type { CollectionBeforeChangeHook, CollectionAfterReadHook, PayloadRequest } from 'payload'

import { isResolvedCartLine } from '@/lib/cartLines'

type RawCartItem = {
  id?: string | null
  product?: number | string | { id?: number | string } | null
  variant?: number | string | { id?: number | string } | null
  quantity?: number | null
}

const toID = (value: RawCartItem['product']): null | number => {
  if (value == null) return null
  if (typeof value === 'object') return toID(value.id ?? null)
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function publishedIDs(
  req: PayloadRequest,
  collection: 'products' | 'variants',
  ids: number[],
): Promise<Set<number>> {
  if (ids.length === 0) return new Set()

  const result = await req.payload.find({
    req,
    collection,
    depth: 0,
    limit: ids.length,
    overrideAccess: true,
    pagination: false,
    select: { id: true, _status: true },
    where: {
      and: [{ id: { in: ids } }, { _status: { equals: 'published' } }],
    },
  })

  return new Set(result.docs.map((doc) => doc.id))
}

/**
 * Drop lines that can no longer be bought before the cart is saved.
 *
 * A line whose product was deleted (relation is `null`) or unpublished, or
 * whose variant is gone, is a ghost: the storefront hides it, but the plugin's
 * own beforeChange hook still tries to price it — and `findByID(null)` throws,
 * so every later add / remove / quantity change on that cart failed silently
 * and the UI stopped matching the server. Pruning here keeps that hook safe
 * and lets a poisoned cart heal itself on its next write.
 */
export const pruneUnavailableCartItems: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) return data

  const items = data.items as RawCartItem[]
  const productIDs = [...new Set(items.map((item) => toID(item.product)).filter((id): id is number => id != null))]
  const variantIDs = [...new Set(items.map((item) => toID(item.variant)).filter((id): id is number => id != null))]

  const [products, variants] = await Promise.all([
    publishedIDs(req, 'products', productIDs),
    publishedIDs(req, 'variants', variantIDs),
  ])

  data.items = items.filter((item) => {
    const productID = toID(item.product)
    if (productID == null || !products.has(productID)) return false

    const variantID = toID(item.variant)
    if (item.variant != null && (variantID == null || !variants.has(variantID))) return false

    return (item.quantity ?? 0) > 0
  })

  return data
}

/**
 * Never hand a ghost line to a reader.
 *
 * A deleted product comes back as `null` at any depth. An unpublished one is
 * subtler: a public reader isn't allowed to see it, so when the request asked
 * for population (the storefront fetches carts at depth 2) Payload hands back
 * the bare id instead of the document. At depth 0 a bare id is simply an
 * unpopulated relation, which is how the plugin's own add/remove operations
 * read carts, so those are left alone — the write-side prune covers them.
 */
export const hideUnavailableCartItems: CollectionAfterReadHook = ({ doc, req }) => {
  if (!doc || !Array.isArray(doc.items)) return doc

  const requestedDepth = Number((req.query as Record<string, unknown> | undefined)?.depth)
  const populated = Number.isFinite(requestedDepth) && requestedDepth > 0

  doc.items = (doc.items as RawCartItem[]).filter((item) => {
    if (item.product == null) return false
    if (typeof item.product !== 'object') return !populated
    return isResolvedCartLine(item as Parameters<typeof isResolvedCartLine>[0])
  })

  return doc
}

export const CartsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...(defaultCollection.hooks ?? {}),
    // Ours runs first so the plugin's subtotal hook only ever sees valid lines.
    beforeChange: [pruneUnavailableCartItems, ...(defaultCollection.hooks?.beforeChange ?? [])],
    afterRead: [...(defaultCollection.hooks?.afterRead ?? []), hideUnavailableCartItems],
  },
})
