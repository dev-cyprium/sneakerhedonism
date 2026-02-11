import type { Product, Variant } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInRSD, title } = product

  let price = priceInRSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInRSD &&
      typeof variant.priceInRSD === 'number'
    ) {
      price = variant.priceInRSD
    }
  }

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== 'string' ? gallery[0]?.image : false

  return (
    <Link
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background transition-shadow duration-300 hover:shadow-lg"
      href={`/products/${product.slug}`}
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden p-3">
        {image ? (
          <Media
            className="relative h-full w-full"
            height={400}
            imgClassName="h-full w-full object-contain transition duration-500 ease-out group-hover:scale-105"
            resource={image}
            width={400}
          />
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 px-4 py-4">
        <h3 className="text-[15px] font-medium leading-snug text-foreground line-clamp-2">
          {title}
        </h3>
        {typeof price === 'number' && (
          <Price className="text-[15px] font-bold text-accent-brand" amount={price} as="span" />
        )}
      </div>
    </Link>
  )
}
