import type { Product, User, Variant } from '@/payload-types'
import type { WishlistItemWithProduct } from '@/lib/wishlist'
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

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const updated = await payload.findByID({
    id: user.id,
    collection: 'users',
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
      // Skip items without populated product
    }
  }

  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { productId: number; variantId?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { productId, variantId } = body
  if (productId == null || typeof productId !== 'number') {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  const product = await payload.findByID({
    id: productId,
    collection: 'products',
    depth: 0,
  })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 400 })
  }

  if (variantId != null) {
    const variant = await payload.findByID({
      id: variantId,
      collection: 'variants',
      depth: 0,
    })
    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 400 })
    }
  }

  const currentUser = await payload.findByID({
    id: user.id,
    collection: 'users',
    depth: 0,
    overrideAccess: false,
    user,
  })

  const wishlist = (currentUser.wishlist ?? []) as Array<{ product: number; variant?: number | null }>
  const key = (p: number, v?: number | null) => `${p}:${v ?? ''}`
  const existingKeys = new Set(wishlist.map((w) => key(w.product, w.variant)))
  if (existingKeys.has(key(productId, variantId ?? null))) {
    const existing = await payload.findByID({
      id: user.id,
      collection: 'users',
      depth: WISHLIST_DEPTH,
      overrideAccess: false,
      user,
    })
    const rawExisting = (existing.wishlist ?? []) as Array<{
      product: number | Product
      variant?: (number | null) | Variant
    }>
    const items: WishlistItemWithProduct[] = []
    for (const item of rawExisting) {
      try {
        items.push(toApiItem(item))
      } catch {
        // skip
      }
    }
    return NextResponse.json({ items })
  }

  const newItem = { product: productId, variant: variantId ?? null }
  const updated = await payload.update({
    id: user.id,
    collection: 'users',
    data: { wishlist: [...wishlist, newItem] },
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

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const productIdParam = searchParams.get('productId')
  const variantIdParam = searchParams.get('variantId')

  if (!productIdParam) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  const productId = parseInt(productIdParam, 10)
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 })
  }

  let variantId: number | undefined
  if (variantIdParam) {
    const v = parseInt(variantIdParam, 10)
    if (!Number.isNaN(v)) variantId = v
  }

  const payload = await getPayload({ config: configPromise })
  const currentUser = await payload.findByID({
    id: user.id,
    collection: 'users',
    depth: 0,
    overrideAccess: false,
    user,
  })

  const wishlist = (currentUser.wishlist ?? []) as Array<{ product: number; variant?: number | null }>
  const filtered = wishlist.filter((w) => {
    const pMatch = w.product === productId
    const vMatch = variantId == null ? (w.variant == null || w.variant === undefined) : w.variant === variantId
    return !(pMatch && vMatch)
  })

  if (filtered.length === wishlist.length) {
    const existing = await payload.findByID({
      id: user.id,
      collection: 'users',
      depth: WISHLIST_DEPTH,
      overrideAccess: false,
      user,
    })
    const rawExisting = (existing.wishlist ?? []) as Array<{
      product: number | Product
      variant?: (number | null) | Variant
    }>
    const items: WishlistItemWithProduct[] = []
    for (const item of rawExisting) {
      try {
        items.push(toApiItem(item))
      } catch {
        // skip
      }
    }
    return NextResponse.json({ items })
  }

  const updated = await payload.update({
    id: user.id,
    collection: 'users',
    data: { wishlist: filtered },
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
