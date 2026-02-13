'use client'

import type { Product, Variant } from '@/payload-types'
import type { WishlistItemWithProduct } from '@/lib/wishlist'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { AddToCart } from '@/components/Cart/AddToCart'
import { resolveItemPrice, resolveProductDisplayPriceInfo } from '@/lib/resolvePrice'
import Link from 'next/link'
import React from 'react'
import { AddToWishlist } from './AddToWishlist'

type Props = {
  item: WishlistItemWithProduct
}

export function WishlistItemCard({ item }: Props) {
  const { product, variant } = item
  const priceInfo = variant
    ? resolveItemPrice(product, variant)
    : resolveProductDisplayPriceInfo(product)?.amount

  const images =
    product.gallery
      ?.map((item) => (item.image && typeof item.image !== 'string' ? item.image : null))
      .filter(Boolean) ?? []
  const image = images[0]
  const productUrl = `/products/${product.slug}${variant ? `?variant=${variant.id}` : ''}`

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden p-3">
        <Link href={productUrl} className="block h-full w-full">
          {image && typeof image === 'object' ? (
            <Media
              className="h-full w-full"
              height={400}
              imgClassName="h-full w-full object-contain transition duration-300 group-hover:scale-105"
              resource={image}
              width={400}
            />
          ) : null}
        </Link>
        <div className="absolute right-2 top-2 z-10">
          <AddToWishlist
            productId={product.id}
            variantId={variant?.id}
            stopPropagation
            size="sm"
            className="bg-background/90 backdrop-blur-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 py-4">
        <h3 className="text-[15px] font-medium leading-snug text-foreground line-clamp-2">
          <Link href={productUrl} className="hover:text-accent-brand">
            {product.title}
          </Link>
        </h3>
        {variant && (
          <p className="text-sm text-muted-foreground font-mono tracking-wider">
            {variant.options
              ?.map((o) => (typeof o === 'object' ? o.label : null))
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        {priceInfo != null && (
          <Price
            className="text-[15px] font-bold text-accent-brand"
            amount={priceInfo}
            as="span"
          />
        )}
        <AddToCart product={product as Product} variant={variant ?? undefined} />
      </div>
    </div>
  )
}
