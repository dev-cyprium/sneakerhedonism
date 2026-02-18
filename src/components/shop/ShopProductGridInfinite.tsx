'use client'

import type { Product } from '@/payload-types'
import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import type { ShopProductFilterParams } from '@/lib/shopProducts'
import type { ShopSortValue } from '@/components/shop/filters/sortOptions'
import React, { useCallback, useEffect, useRef, useState } from 'react'

type Props = ShopProductFilterParams & {
  sort: ShopSortValue
  initialProducts: Partial<Product>[]
  initialHasNextPage: boolean
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-1.5 px-4 py-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

function buildApiUrl(
  page: number,
  params: ShopProductFilterParams & { sort: ShopSortValue },
): string {
  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('limit', '12')
  sp.set('sort', params.sort)
  if (params.searchValue) sp.set('q', params.searchValue)
  if (params.categoryIds.length > 0) sp.set('categoryIds', JSON.stringify(params.categoryIds))
  if (params.brandId != null) sp.set('brandId', String(params.brandId))
  if (params.variantProductIds !== null) {
    sp.set('variantProductIds', JSON.stringify(params.variantProductIds))
  }
  if (params.minPriceVal != null) sp.set('minPrice', String(params.minPriceVal))
  if (params.maxPriceVal != null) sp.set('maxPrice', String(params.maxPriceVal))
  if (params.onSale) sp.set('onSale', '1')
  return `/api/shop/products?${sp.toString()}`
}

export function ShopProductGridInfinite({
  sort,
  initialProducts,
  initialHasNextPage,
  searchValue,
  categoryIds,
  brandId,
  variantProductIds,
  minPriceVal,
  maxPriceVal,
  onSale,
}: Props) {
  const [products, setProducts] = useState<Partial<Product>[]>(initialProducts)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filterKey = JSON.stringify({
    sort,
    searchValue,
    categoryIds,
    brandId,
    variantProductIds,
    minPriceVal,
    maxPriceVal,
    onSale,
  })

  useEffect(() => {
    setProducts(initialProducts)
    setHasNextPage(initialHasNextPage)
    setPage(1)
    setError(null)
  }, [filterKey, initialProducts, initialHasNextPage])

  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return
    const nextPage = page + 1
    setLoading(true)
    setError(null)
    try {
      const params: ShopProductFilterParams & { sort: ShopSortValue } = {
        sort,
        searchValue,
        categoryIds,
        brandId,
        variantProductIds,
        minPriceVal,
        maxPriceVal,
        onSale,
      }
      const res = await fetch(buildApiUrl(nextPage, params))
      if (!res.ok) throw new Error('Failed to load products')
      const data = (await res.json()) as {
        docs: Partial<Product>[]
        hasNextPage: boolean
      }
      setProducts((prev) => [...prev, ...data.docs])
      setHasNextPage(data.hasNextPage)
      setPage(nextPage)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more products')
    } finally {
      setLoading(false)
    }
  }, [
    loading,
    hasNextPage,
    page,
    sort,
    searchValue,
    categoryIds,
    brandId,
    variantProductIds,
    minPriceVal,
    maxPriceVal,
    onSale,
  ])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) loadMore()
      },
      { rootMargin: '200px', threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasNextPage, loading])

  const resultsText = products.length > 1 ? 'rezultata' : 'rezultat'

  return (
    <>
      {searchValue && products.length > 0 ? (
        <p className="mb-4">
          {`Prikazano ${products.length} ${resultsText} za `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {products.length === 0 && !loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-10 py-12 text-center shadow-sm max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 120 120"
              fill="none"
              className="h-28 w-28 text-muted-foreground/40"
            >
              <rect
                x="20"
                y="30"
                width="80"
                height="60"
                rx="6"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M20 45h80" stroke="currentColor" strokeWidth="2" />
              <circle
                cx="60"
                cy="70"
                r="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <path
                d="M56 66l8 8M64 66l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M38 38h6M50 38h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {searchValue
                  ? 'Nema proizvoda koji odgovaraju pojmu'
                  : 'Nema pronađenih proizvoda'}
              </p>
              {searchValue && (
                <p className="mt-1 text-sm font-bold text-foreground">
                  &quot;{searchValue}&quot;
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Pokušajte sa drugim filterima ili pretragom.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {products.length > 0 ? (
        <>
          <Grid className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductGridItem key={product.id} product={product} />
            ))}
          </Grid>

          {hasNextPage ? (
            <div
              ref={sentinelRef}
              className="flex min-h-[120px] items-center justify-center py-8"
              aria-live="polite"
              aria-busy={loading}
            >
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {error && (
            <div className="flex flex-col items-center gap-2 py-8">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                type="button"
                onClick={loadMore}
                className="text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                Pokušaj ponovo
              </button>
            </div>
          )}
        </>
      ) : null}
    </>
  )
}
