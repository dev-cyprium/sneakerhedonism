'use client'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import { RichText } from '@/components/RichText'
import {
  resolveItemPrice,
  resolveProductDisplaySaleInfo,
  resolveProductPriceRange,
  resolveProductSaleInfo,
} from '@/lib/resolvePrice'
import type { Category, Product, Variant } from '@/payload-types'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useMemo } from 'react'

import { AddToWishlist } from '@/components/Wishlist/AddToWishlist'
import { StockIndicator } from '@/components/product/StockIndicator'
import type { ResolvedSizeGuide } from '@/lib/resolveSizeGuide'
import { SizeGuide } from './SizeGuide'
import { VariantSelector } from './VariantSelector'

const DEFAULT_PLACEHOLDER = 'NEMA KRATKOG OPISA'

function extractTextFromLexicalNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>
  if (typeof n.text === 'string') return n.text
  const children = n.children
  if (Array.isArray(children)) {
    return children.map(extractTextFromLexicalNode).join('')
  }
  return ''
}

function hasShortDescriptionContent(
  data: Product['shortDescription'],
): data is NonNullable<Product['shortDescription']> {
  if (!data?.root?.children?.length) return false
  const allText = data.root.children
    .map(extractTextFromLexicalNode)
    .join('')
    .trim()
  if (!allText) return false
  if (allText === DEFAULT_PLACEHOLDER) return false
  return true
}

export function ProductDescription({
  product,
  sizeGuide,
}: {
  product: Product
  sizeGuide?: ResolvedSizeGuide | null
}) {
  const { currency } = useCurrency()
  const priceField = `priceIn${currency.code}` as keyof Product
  const searchParams = useSearchParams()
  const hasVariantTypes =
    product.enableVariants &&
    Boolean(product.variantTypes?.some((t) => typeof t === 'object' && t.options?.docs?.length))
  const hasVariantDocs = product.enableVariants && Boolean(product.variants?.docs?.length)

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (!hasVariantDocs) return undefined
    const variantId = searchParams.get('variant')
    const variants = product.variants?.docs ?? []
    const found = variants.find((v) => typeof v === 'object' && String(v.id) === variantId)
    return found && typeof found === 'object' ? found : undefined
  }, [hasVariantDocs, searchParams, product.variants?.docs])

  const saleInfo = selectedVariant
    ? resolveProductSaleInfo(product, selectedVariant)
    : resolveProductDisplaySaleInfo(product)
  const range = resolveProductPriceRange(product, priceField)
  const itemPrice = selectedVariant ? resolveItemPrice(product, selectedVariant) : null

  const categories = product.categories?.filter((cat): cat is Category => typeof cat === 'object')

  return (
    <div className="flex flex-col gap-5">
      {/* Title + Price */}
      <div>
        {saleInfo && (
          <span
            className="mb-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-brand px-1.5 py-1 text-xs font-bold leading-tight text-primary-foreground"
            aria-label={`${saleInfo.discountPercent}% off`}
          >
            -{saleInfo.discountPercent}%
          </span>
        )}
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="mt-1 flex flex-wrap items-baseline gap-2 text-xl font-semibold">
          {saleInfo ? (
            <>
              <Price
                className="text-lg text-muted-foreground line-through"
                amount={saleInfo.originalPrice}
                as="span"
              />
              <Price className="text-accent-brand" amount={saleInfo.salePrice} as="span" />
            </>
          ) : itemPrice != null ? (
            <Price className="text-accent-brand" amount={itemPrice} as="span" />
          ) : range ? (
            <Price
              className="text-accent-brand"
              highestAmount={range.highest}
              lowestAmount={range.lowest}
              as="span"
            />
          ) : null}
        </div>
      </div>

      {/* Short description (rich text) - shown in product card */}
      {hasShortDescriptionContent(product.shortDescription) ? (
        <RichText
          className="mx-0 max-w-none text-base text-muted-foreground text-left"
          data={product.shortDescription}
          enableGutter={false}
        />
      ) : (
        <p className="text-base text-muted-foreground">{DEFAULT_PLACEHOLDER}</p>
      )}

      <hr />

      {/* Variant selector */}
      {hasVariantTypes && (
        <Suspense fallback={null}>
          <VariantSelector product={product} />
        </Suspense>
      )}

      {/* Add to cart + Wishlist */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <Suspense fallback={null}>
            <AddToCart product={product} />
          </Suspense>
        </div>
        <AddToWishlist
          productId={product.id}
          variantId={selectedVariant?.id}
          size="lg"
        />
      </div>

      {/* Size guide + Stock */}
      <div className="flex items-center gap-4">
        <SizeGuide sizeGuide={sizeGuide} />
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
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="hover:text-foreground transition-colors"
                >
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
