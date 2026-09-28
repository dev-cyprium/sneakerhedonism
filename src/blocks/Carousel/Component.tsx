import { inStockWhere, availableSelection } from '@/lib/inStock'
import type { Media, Product, CarouselBlock as CarouselBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'

import { CarouselClient } from './Component.client'

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType
  }
> = async (props) => {
  const { categories, limit = 3, populateBy, selectedDocs, selectedMedia } = props

  let products: Product[] = []
  let media: (Media | number)[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.length
      ? categories.map((category) => {
          if (typeof category === 'object') return category.id
          else return category
        })
      : null

    const fetchedProducts = await payload.find({
      collection: 'products',
      depth: 1,
      limit: limit || undefined,
      draft: false,
      overrideAccess: false,
      where: {
        and: [
          inStockWhere,
          ...(flattenedCategories?.length ? [{ categories: { in: flattenedCategories } }] : []),
        ],
      },
    })

    products = fetchedProducts.docs
  } else if (populateBy === 'selection' && selectedDocs?.length) {
    const payload = await getPayload({ config: configPromise })
    products = await availableSelection(payload, selectedDocs.flatMap(({ value }) =>
      typeof value === 'object' ? [value.id] : typeof value === 'number' ? [value] : []))
  } else if (populateBy === 'media' && selectedMedia?.length) {
    media = selectedMedia
  }

  if (media.length > 0) {
    return (
      <div className="w-full">
        <CarouselClient media={media} />
      </div>
    )
  }

  if (!products?.length) return null

  return (
    <div className="w-full">
      <CarouselClient products={products} />
    </div>
  )
}
