import type { Where, Payload } from 'payload'
import type { Product } from '@/payload-types'

// Join filtering happens in SQL before pagination, including variant-only stock.
export const inStockWhere: Where = {
  and: [
    { _status: { equals: 'published' } },
    {
      or: [
        { and: [{ enableVariants: { not_equals: true } }, { inventory: { greater_than: 0 } }] },
        {
          and: [
            { enableVariants: { equals: true } },
            { 'variants.inventory': { greater_than: 0 } },
            { 'variants._status': { equals: 'published' } },
          ],
        },
      ],
    },
  ],
}

/** Re-read curated selections: their populated data may come from a cached page. */
export async function availableSelection(payload: Payload, ids: number[]): Promise<Product[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'products', draft: false, overrideAccess: false, depth: 1,
    pagination: false, where: { and: [inStockWhere, { id: { in: ids } }] },
  })
  const byID = new Map(result.docs.map((product) => [product.id, product]))
  return ids.flatMap((id) => byID.has(id) ? [byID.get(id)!] : [])
}
