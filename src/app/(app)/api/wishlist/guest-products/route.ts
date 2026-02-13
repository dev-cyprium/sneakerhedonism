import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

/**
 * Fetch products by IDs for guest wishlist display.
 * POST body: { productIds: number[] }
 */
export async function POST(request: Request) {
  let body: { productIds: number[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { productIds } = body
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ products: [] })
  }

  const ids = productIds.filter((id) => typeof id === 'number' && Number.isFinite(id))
  if (ids.length === 0) {
    return NextResponse.json({ products: [] })
  }

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    where: { id: { in: ids } },
    depth: 2,
    limit: ids.length,
    pagination: false,
  })

  return NextResponse.json({ products: result.docs })
}
