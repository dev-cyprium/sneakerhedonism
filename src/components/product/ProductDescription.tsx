'use client'
import type { Category, Product, Variant } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { SizeGuide } from './SizeGuide'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'
import Link from 'next/link'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariantTypes = product.enableVariants && Boolean(product.variantTypes?.some((t) => typeof t === 'object' && t.options?.docs?.length))
  const hasVariantDocs = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariantDocs) {
    const variantPriceField = `priceIn${currency.code}` as keyof Variant
    const productPriceField = `priceIn${currency.code}` as keyof Product
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          variantPriceField in a &&
          variantPriceField in b &&
          typeof a[variantPriceField] === 'number' &&
          typeof b[variantPriceField] === 'number'
        ) {
          return a[variantPriceField] - b[variantPriceField]
        }

        return 0
      }) as Variant[]

    const lowestVariantPrice = variantsOrderedByPrice[0]?.[variantPriceField]
    const highestVariantPrice = variantsOrderedByPrice[variantsOrderedByPrice.length - 1]?.[variantPriceField]
    if (
      variantsOrderedByPrice &&
      typeof lowestVariantPrice === 'number' &&
      typeof highestVariantPrice === 'number'
    ) {
      lowestAmount = lowestVariantPrice
      highestAmount = highestVariantPrice
    } else if (product[productPriceField] && typeof product[productPriceField] === 'number') {
      lowestAmount = product[productPriceField] as number
      highestAmount = product[productPriceField] as number
    }
  }

  if (!hasVariantDocs && product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  const categories = product.categories?.filter(
    (cat): cat is Category => typeof cat === 'object',
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Title + Price */}
      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="mt-1 text-xl font-semibold text-accent-brand">
          {hasVariantDocs ? (
            <Price highestAmount={highestAmount} lowestAmount={lowestAmount} as="span" />
          ) : (
            <Price amount={amount} as="span" />
          )}
        </div>
      </div>

      {/* Description (rich text) */}
      {product.description ? (
        <RichText className="text-sm text-muted-foreground" data={product.description} enableGutter={false} />
      ) : null}

      <hr />

      {/* Variant selector */}
      {hasVariantTypes && (
        <Suspense fallback={null}>
          <VariantSelector product={product} />
        </Suspense>
      )}

      {/* Add to cart */}
      <Suspense fallback={null}>
        <AddToCart product={product} />
      </Suspense>

      {/* Size guide + Stock */}
      <div className="flex items-center gap-4">
        <SizeGuide />
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      {/* SKU + Categories */}
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">SKU:</span> N/A
        </p>
        {categories && categories.length > 0 && (
          <p>
            <span className="font-medium text-foreground">Categories:</span>{' '}
            {categories.map((cat, i) => (
              <React.Fragment key={cat.id}>
                {i > 0 && ', '}
                <Link href={`/shop?category=${cat.slug}`} className="hover:text-foreground transition-colors">
                  {cat.title}
                </Link>
              </React.Fragment>
            ))}
          </p>
        )}
      </div>
    </div>
  )
}
