import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { NovoBlock as NovoBlockProps } from '@/payload-types'

export const NovoBlock: React.FC<NovoBlockProps> = async ({ limit }) => {
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    sort: '-createdAt',
    limit: limit || 8,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  if (!products.docs.length) return null

  return (
    <section className="container py-16">
      <h2 className="text-3xl font-bold text-center mb-10">Novo</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.docs.map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-md bg-accent-brand px-6 py-3 text-sm font-medium text-white hover:bg-accent-brand/90 transition-colors"
        >
          Pogledaj sve
        </Link>
      </div>
    </section>
  )
}
