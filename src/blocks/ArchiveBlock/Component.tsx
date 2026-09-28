import { inStockWhere, availableSelection } from '@/lib/inStock'
import type { Product, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { DefaultDocumentIDType, getPayload } from 'payload'
import React from 'react'
import { RichText } from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Product[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedProducts = await payload.find({
      collection: 'products',
      depth: 1,
      limit,
      draft: false,
      overrideAccess: false,
      where: {
        and: [
          inStockWhere,
          ...(flattenedCategories?.length ? [{ categories: { in: flattenedCategories } }] : []),
        ],
      },
    })

    posts = fetchedProducts.docs
  } else {
    if (selectedDocs?.length) {
      const payload = await getPayload({ config: configPromise })
      posts = await availableSelection(payload, selectedDocs.flatMap(({ value }) =>
        typeof value === 'object' ? [value.id] : typeof value === 'number' ? [value] : []))
    }
  }

  return (
    <div id={`block-${id}`}>
      {introContent && (
        <div className="container mb-8 md:mb-12">
          <RichText className="ml-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
