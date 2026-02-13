import type { Product, User, Variant } from '@/payload-types'
import type { WishlistItem, WishlistItemWithProduct } from '@/lib/wishlist'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'

const WISHLIST_DEPTH = 2

async function getAuthenticatedUser(): Promise<User | null> {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  return user ?? null
}

function toApiItem(
  item: { product: number | Product; variant?: (number | null) | Variant },
): WishlistItemWithProduct {
  const product = typeof item.product === 'object' ? item.product : null
  const variant = item.variant != null && typeof item.variant === 'object' ? item.variant : null
  if (!product) {
    throw new Error('Product must be populated')
  }
  return {
    productId: product.id,
    variantId: variant?.id,
    product,
    variant: variant ?? undefined,
  }
}

/**
 * Merge localStorage items with user's wishlist.
 * Soft validation: skip items whose product was deleted; do not fail the whole sync.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { items: WishlistItem[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { items: incomingItems } = body
  if (!Array.isArray(incomingItems)) {
    return NextResponse.json({ error: 'items must be an array' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  const validItems: Array<{ product: number; variant?: number | null }> = []
  for (const item of incomingItems) {
    const productId = item?.productId
    const variantId = item?.variantId
    if (productId == null || typeof productId !== 'number') continue

    try {
      const product = await payload.findByID({
        id: productId,
        collection: 'products',
        depth: 0,
      })
      if (!product) continue

      if (variantId != null && typeof variantId === 'number') {
        const variant = await payload.findByID({
          id: variantId,
          collection: 'variants',
          depth: 0,
        })
        if (!variant) continue
      }

      validItems.push({ product: productId, variant: variantId ?? null })
    } catch {
      continue
    }
  }

  const currentUser = await payload.findByID({
    id: user.id,
    collection: 'users',
    depth: 0,
    overrideAccess: false,
    user,
  })

  const existing = (currentUser.wishlist ?? []) as Array<{ product: number; variant?: number | null }>
  const key = (p: number, v?: number | null) => `${p}:${v ?? ''}`
  const seen = new Set(existing.map((w) => key(w.product, w.variant)))

  for (const item of validItems) {
    const k = key(item.product, item.variant)
    if (!seen.has(k)) {
      seen.add(k)
      existing.push(item)
    }
  }

  const updated = await payload.update({
    id: user.id,
    collection: 'users',
    data: { wishlist: existing },
    depth: WISHLIST_DEPTH,
    overrideAccess: false,
    user,
  })

  const raw = (updated.wishlist ?? []) as Array<{
    product: number | Product
    variant?: (number | null) | Variant
  }>
  const items: WishlistItemWithProduct[] = []
  for (const item of raw) {
    try {
      items.push(toApiItem(item))
    } catch {
      // skip
    }
  }

  return NextResponse.json({ items })
}
