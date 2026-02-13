import type { Product } from '@/payload-types'

import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { cn } from '@/utilities/cn'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInRSD, title } = product

  let price = priceInRSD

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (variant && typeof variant === 'object' && variant.priceInRSD != null) {
      price = variant.priceInRSD
    }
  }

  const images = gallery
    ?.map((item) => (item.image && typeof item.image !== 'string' ? item.image : null))
    .filter(Boolean) ?? []

  const firstImage = images[0] ?? null
  const secondImage = images[1] ?? null

  return (
    <Link
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background transition-shadow duration-300 hover:shadow-lg"
      href={`/products/${product.slug}`}
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden p-3">
        {firstImage && (
          <Media
            className="relative h-full w-full"
            height={400}
            imgClassName={cn(
              'h-full w-full object-contain transition duration-500 ease-out',
              secondImage
                ? 'group-hover:opacity-0 group-hover:scale-105'
                : 'group-hover:scale-105',
            )}
            resource={firstImage}
            width={400}
          />
        )}
        {secondImage && (
          <Media
            className="absolute inset-0 h-full w-full p-3"
            height={400}
            imgClassName="h-full w-full object-contain transition duration-500 ease-out opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100"
            resource={secondImage}
            width={400}
          />
        )}

        {/* Image count indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className="block h-1 w-1 rounded-full bg-foreground/30"
              />
            ))}
          </div>
        )}
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
