import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'

import { countCartQuantity, isResolvedCartLine, resolveCartLines } from '@/lib/cartLines'
import { hideUnavailableCartItems, pruneUnavailableCartItems } from '@/collections/Carts'

const product = (id: number, status: 'draft' | 'published' | undefined = 'published') =>
  ({ id, title: `Product ${id}`, ...(status ? { _status: status } : {}) }) as any
const variant = (id: number, status: 'draft' | 'published' | undefined = 'published') =>
  ({ id, ...(status ? { _status: status } : {}) }) as any

describe('resolveCartLines', () => {
  it('keeps lines whose product (and variant) are populated and published', () => {
    const lines = resolveCartLines({
      items: [
        { product: product(1), quantity: 1 },
        { product: product(2), variant: variant(20), quantity: 2 },
      ],
    })

    expect(lines).toHaveLength(2)
    expect(countCartQuantity(lines)).toBe(3)
  })

  it('drops a deleted product (null relation) — the ghost from the client screenshots', () => {
    // One deleted product plus one real item: badge said 2, list showed 1,
    // total was for both.
    const lines = resolveCartLines({
      items: [
        { product: null, variant: null, quantity: 1 },
        { product: product(166), variant: variant(205), quantity: 1 },
      ],
    })

    expect(lines.map((line) => line.product.id)).toEqual([166])
    expect(countCartQuantity(lines)).toBe(1)
  })

  it('drops an unpublished product that a public reader only gets as a bare id', () => {
    expect(resolveCartLines({ items: [{ product: 71, variant: variant(71), quantity: 1 }] })).toEqual([])
  })

  it('drops a line whose variant is gone or unpublished', () => {
    expect(isResolvedCartLine({ product: product(1), variant: 9, quantity: 1 })).toBe(false)
    expect(isResolvedCartLine({ product: product(1), variant: variant(9, 'draft'), quantity: 1 })).toBe(false)
  })

  it('treats a populated product without _status (storefront populate select) as sellable', () => {
    expect(isResolvedCartLine({ product: product(1, undefined), quantity: 1 })).toBe(true)
  })

  it('handles an empty or missing cart', () => {
    expect(resolveCartLines(null)).toEqual([])
    expect(resolveCartLines({ items: [] })).toEqual([])
  })
})

function reqWithCatalogue({
  products,
  variants,
  depth,
}: {
  products: number[]
  variants: number[]
  depth?: number
}): PayloadRequest {
  const find = vi.fn(async ({ collection, where }: { collection: string; where: any }) => {
    const ids: number[] = where.and[0].id.in
    const published = collection === 'products' ? products : variants
    return { docs: ids.filter((id) => published.includes(id)).map((id) => ({ id })) }
  })

  return {
    payload: { find },
    query: depth == null ? {} : { depth: String(depth) },
  } as unknown as PayloadRequest
}

describe('pruneUnavailableCartItems (beforeChange)', () => {
  it('removes deleted, unpublished and variant-less lines before the plugin prices the cart', async () => {
    const req = reqWithCatalogue({ products: [1, 2, 3], variants: [20] })
    const data = {
      items: [
        { product: null, quantity: 1 }, // deleted
        { product: 99, quantity: 1 }, // unpublished / unknown
        { product: 1, quantity: 1 }, // fine
        { product: 2, variant: 20, quantity: 2 }, // fine
        { product: 3, variant: 21, quantity: 1 }, // variant gone
        { product: { id: 1 }, quantity: 0 }, // nothing to buy
      ],
    }

    const result = await pruneUnavailableCartItems({ data, req, operation: 'update' } as any)

    expect(result.items).toEqual([
      { product: 1, quantity: 1 },
      { product: 2, variant: 20, quantity: 2 },
    ])
  })

  it('leaves a cart without items alone', async () => {
    const req = reqWithCatalogue({ products: [], variants: [] })
    const data = { items: [] as unknown[] }

    await pruneUnavailableCartItems({ data, req, operation: 'update' } as any)

    expect(data.items).toEqual([])
    expect((req.payload.find as any).mock.calls).toHaveLength(0)
  })
})

describe('hideUnavailableCartItems (afterRead)', () => {
  it('always hides a deleted product', () => {
    const doc = { items: [{ product: null, quantity: 1 }, { product: 5, quantity: 1 }] }
    const out = hideUnavailableCartItems({ doc, req: reqWithCatalogue({ products: [], variants: [] }) } as any)
    expect(out.items).toEqual([{ product: 5, quantity: 1 }])
  })

  it('hides a bare id when the reader asked for population (unpublished for them)', () => {
    const doc = {
      items: [
        { product: 71, variant: variant(71), quantity: 1 },
        { product: product(166), variant: variant(205), quantity: 1 },
      ],
    }
    const out = hideUnavailableCartItems({
      doc,
      req: reqWithCatalogue({ products: [], variants: [], depth: 2 }),
    } as any)
    expect(out.items.map((i: any) => i.product.id)).toEqual([166])
  })

  it('keeps bare ids at depth 0 — that is just an unpopulated relation', () => {
    const doc = { items: [{ product: 71, variant: 71, quantity: 1 }] }
    const out = hideUnavailableCartItems({ doc, req: reqWithCatalogue({ products: [], variants: [] }) } as any)
    expect(out.items).toHaveLength(1)
  })
})
