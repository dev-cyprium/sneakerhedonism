import { SortFilter } from '@/components/shop/filters/SortFilter'
import {
  DEFAULT_SHOP_SORT,
  isShopSortValue,
  type ShopSortValue,
} from '@/components/shop/filters/sortOptions'
import { ShopProductGridInfinite } from '@/components/shop/ShopProductGridInfinite'
import { ShopSidebar } from '@/components/shop/ShopSidebar'
import { buildShopProductWhere, SHOP_PRODUCT_SELECT } from '@/lib/shopProducts'
import type { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'

export const revalidate = 30

export const metadata = {
  description: 'Pretražite proizvode u našoj ponudi.',
  title: 'Prodavnica',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

const INITIAL_PAGE_SIZE = 12

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background"
        >
          <div className="aspect-square w-full animate-pulse bg-muted" />
          <div className="flex flex-col gap-1.5 px-4 py-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

type ProductGridProps = {
  searchValue: string
  sort: ShopSortValue
  categoryIds: number[]
  brandId: number | null
  variantProductIds: number[] | null
  minPriceVal: number | null
  maxPriceVal: number | null
  onSale: boolean
}

async function ShopProductGrid({
  searchValue,
  sort,
  categoryIds,
  brandId,
  variantProductIds,
  minPriceVal,
  maxPriceVal,
  onSale,
}: ProductGridProps) {
  const payload = await getPayload({ config: configPromise })
  const whereConditions = await buildShopProductWhere(
    {
      categoryIds,
      brandId,
      searchValue,
      variantProductIds,
      minPriceVal,
      maxPriceVal,
      onSale,
    },
    payload,
  )

  const result = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 1,
    select: SHOP_PRODUCT_SELECT,
    sort,
    where: { and: whereConditions },
    limit: INITIAL_PAGE_SIZE,
    page: 1,
  })

  return (
    <ShopProductGridInfinite
      searchValue={searchValue}
      sort={sort}
      categoryIds={categoryIds}
      brandId={brandId}
      variantProductIds={variantProductIds}
      minPriceVal={minPriceVal}
      maxPriceVal={maxPriceVal}
      onSale={onSale}
      initialProducts={result.docs as Partial<Product>[]}
      initialHasNextPage={result.hasNextPage ?? false}
    />
  )
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const {
    q: searchValueRaw,
    sort: sortRaw,
    category,
    brand,
    minPrice,
    maxPrice,
    onSale: onSaleRaw,
  } = params

  const searchValue = typeof searchValueRaw === 'string'
    ? searchValueRaw
    : Array.isArray(searchValueRaw)
      ? searchValueRaw[0] ?? ''
      : ''

  const sortParam = typeof sortRaw === 'string' ? sortRaw : Array.isArray(sortRaw) ? sortRaw[0] : undefined
  const sort: ShopSortValue = isShopSortValue(sortParam) ? sortParam : DEFAULT_SHOP_SORT

  const payload = await getPayload({ config: configPromise })

  // --- Parallelize independent queries ---
  const [allCategories, variantTypesResult, [minResult, maxResult]] = await Promise.all([
    payload.find({
      collection: 'categories',
      sort: 'title',
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'variantTypes',
      depth: 1,
      pagination: false,
    }),
    Promise.all([
      payload.find({
        collection: 'products',
        sort: 'priceInRSD',
        limit: 1,
        where: { _status: { equals: 'published' }, priceInRSD: { greater_than: 0 } },
        select: { priceInRSD: true },
      }),
      payload.find({
        collection: 'products',
        sort: '-priceInRSD',
        limit: 1,
        where: { _status: { equals: 'published' }, priceInRSD: { greater_than: 0 } },
        select: { priceInRSD: true },
      }),
    ]),
  ])

  const priceRange = {
    min: minResult.docs[0]?.priceInRSD ?? 0,
    max: maxResult.docs[0]?.priceInRSD ?? 100000,
  }

  const parentCategories = allCategories.docs
    .filter((c) => !c.parent)
    .map((c) => ({ id: c.id, title: c.title, slug: c.slug }))

  const SVE_SLUG = 'sve'
  const categoriesForFilter = [
    { id: 0, title: 'Sve', slug: SVE_SLUG },
    ...parentCategories,
  ]

  // --- Resolve selected parent category ---
  let categoryIds: number[] = []
  let childCategories = allCategories.docs.filter(() => false)
  let selectedCategoryId: number | null = null

  if (category) {
    const slug = Array.isArray(category) ? category[0] : category
    if (slug !== SVE_SLUG) {
      const cat = allCategories.docs.find((c) => c.slug === slug)
      if (cat) {
        selectedCategoryId = cat.id
        categoryIds.push(cat.id)
        childCategories = allCategories.docs.filter((c) => c.parent === cat.id)
        categoryIds.push(...childCategories.map((c) => c.id))
      }
    }
  }

  // --- Resolve selected brand (child category) ---
  let brandId: number | null = null
  if (brand) {
    const brandSlug = Array.isArray(brand) ? brand[0] : brand
    const brandCat = childCategories.find((c) => c.slug === brandSlug)
    if (brandCat) {
      brandId = brandCat.id
    }
  }

  // --- Compute brand counts (products per child category) ---
  let brands: { id: number; title: string; slug: string; count: number }[] = []
  if (selectedCategoryId && childCategories.length > 0) {
    const productsInScope = await payload.find({
      collection: 'products',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { categories: { in: categoryIds } },
        ],
      },
      select: { categories: true },
      pagination: false,
      depth: 0,
    })

    const countMap = new Map<number, number>()
    for (const p of productsInScope.docs) {
      if (p.categories && Array.isArray(p.categories)) {
        for (const catRef of p.categories) {
          const id = typeof catRef === 'number' ? catRef : (catRef as { id: number }).id
          if (childCategories.some((c) => c.id === id)) {
            countMap.set(id, (countMap.get(id) ?? 0) + 1)
          }
        }
      }
    }

    brands = childCategories
      .map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        count: countMap.get(c.id) ?? 0,
      }))
      .filter((b) => b.count > 0)
      .sort((a, b) => a.title.localeCompare(b.title))
  }

  // --- Process variant types ---
  const variantTypes = variantTypesResult.docs.map((vt) => ({
    id: vt.id,
    label: vt.label,
    name: vt.name,
    options: (vt.options?.docs ?? [])
      .filter((o): o is Exclude<typeof o, number> => typeof o === 'object' && o !== null)
      .map((o) => ({ id: o.id, label: o.label })),
  }))

  // --- Resolve variant option filters ---
  let variantProductIds: number[] | null = null
  const selectedVariantOptions: number[] = []
  for (const vt of variantTypes) {
    const value = params[vt.name]
    if (value && value !== 'any') {
      const optionId = Number(Array.isArray(value) ? value[0] : value)
      if (!isNaN(optionId)) {
        selectedVariantOptions.push(optionId)
      }
    }
  }

  if (selectedVariantOptions.length > 0) {
    const matchingVariants = await payload.find({
      collection: 'variants',
      where: {
        and: selectedVariantOptions.map((optId) => ({
          options: { in: [optId] },
        })),
      },
      select: { product: true },
      pagination: false,
      depth: 0,
    })
    variantProductIds = matchingVariants.docs.map((v) =>
      typeof v.product === 'number' ? v.product : (v.product as { id: number }).id,
    )
  }

  // --- Price filter values ---
  const minPriceVal = minPrice ? Number(Array.isArray(minPrice) ? minPrice[0] : minPrice) : null
  const maxPriceVal = maxPrice ? Number(Array.isArray(maxPrice) ? maxPrice[0] : maxPrice) : null
  const onSale = onSaleRaw === '1' || (Array.isArray(onSaleRaw) && onSaleRaw[0] === '1')

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10">
      <ShopSidebar
        parentCategories={categoriesForFilter}
        brands={brands}
        variantTypes={variantTypes}
        priceRange={priceRange}
      />
      <div className="min-h-screen w-full">
        <div className="mb-6 w-full md:flex md:justify-end">
          <SortFilter />
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopProductGrid
            searchValue={searchValue}
            sort={sort}
            categoryIds={categoryIds}
            brandId={brandId}
            variantProductIds={variantProductIds}
            minPriceVal={minPriceVal}
            maxPriceVal={maxPriceVal}
            onSale={onSale}
          />
        </Suspense>
      </div>
    </div>
  )
}
