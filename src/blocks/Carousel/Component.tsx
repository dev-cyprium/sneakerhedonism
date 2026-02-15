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
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    products = fetchedProducts.docs
  } else if (populateBy === 'selection' && selectedDocs?.length) {
    products = selectedDocs
      .map((post) => (typeof post.value !== 'string' ? post.value : null))
      .filter(Boolean) as Product[]
  } else if (populateBy === 'media' && selectedMedia?.length) {
    media = selectedMedia
  }

  if (media.length > 0) {
    return (
      <div className="w-full pb-6 pt-1">
        <CarouselClient media={media} />
      </div>
    )
  }

  if (!products?.length) return null

  return (
    <div className="w-full pb-6 pt-1">
      <CarouselClient products={products} />
    </div>
  )
}
