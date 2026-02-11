import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { PopularnoBlock as PopularnoBlockProps } from '@/payload-types'
import type { Product } from '@/payload-types'

export const PopularnoBlock: React.FC<PopularnoBlockProps> = async ({ limit }) => {
  const payload = await getPayload({ config: configPromise })
  const maxItems = limit || 8

  // Fetch all non-cancelled orders (depth 0 = IDs only)
  const orders = await payload.find({
    collection: 'orders',
    depth: 0,
    overrideAccess: true,
    limit: 0,
    where: {
      status: {
        not_equals: 'cancelled',
      },
    },
  })

  // Aggregate product IDs by total quantity ordered
  const productCounts = new Map<number, number>()

  for (const order of orders.docs) {
    if (!order.items) continue
    for (const item of order.items) {
      const productId = typeof item.product === 'number' ? item.product : item.product?.id
      if (productId) {
        productCounts.set(productId, (productCounts.get(productId) || 0) + item.quantity)
      }
    }
  }

  // Sort by quantity descending, take top N
  const topProductIds = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([id]) => id)

  let products: Product[] = []

  // Fetch popular products if we have order data
  if (topProductIds.length > 0) {
    const result = await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      limit: topProductIds.length,
      where: {
        _status: { equals: 'published' },
        id: { in: topProductIds },
      },
    })

    // Preserve popularity order
    const productMap = new Map(result.docs.map((p) => [p.id, p]))
    products = topProductIds.map((id) => productMap.get(id)).filter(Boolean) as Product[]
  }

  // Fill remaining slots with newest published products
  if (products.length < maxItems) {
    const existingIds = products.map((p) => p.id)
    const remaining = maxItems - products.length

    const fallback = await payload.find({
      collection: 'products',
      draft: false,
      overrideAccess: false,
      sort: '-createdAt',
      limit: remaining,
      where: {
        _status: { equals: 'published' },
        ...(existingIds.length > 0 && {
          id: { not_in: existingIds },
        }),
      },
    })

    products = [...products, ...fallback.docs]
  }

  if (!products.length) return null

  return (
    <section className="container py-16">
      <h2 className="text-3xl font-bold text-center mb-10">Popularno</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Pogledaj sve
        </Link>
      </div>
    </section>
  )
}
