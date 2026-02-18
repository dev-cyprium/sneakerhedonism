import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { SortFilter } from '@/components/shop/filters/SortFilter'
import {
  DEFAULT_SHOP_SORT,
  isShopSortValue,
  type ShopSortValue,
} from '@/components/shop/filters/sortOptions'
import { ShopSidebar } from '@/components/shop/ShopSidebar'
import configPromise from '@payload-config'
import { getPayload, Where } from 'payload'
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

  const whereConditions: Where[] = [{ _status: { equals: 'published' } }]

  if (brandId) {
    whereConditions.push({ categories: { in: [brandId] } })
  } else if (categoryIds.length > 0) {
    whereConditions.push({ categories: { in: categoryIds } })
  }

  if (searchValue) {
    whereConditions.push({ title: { like: searchValue } })
  }

  if (variantProductIds !== null) {
    if (variantProductIds.length > 0) {
      whereConditions.push({ id: { in: variantProductIds } })
    } else {
      whereConditions.push({ id: { equals: -1 } })
    }
  }

  if (minPriceVal && !isNaN(minPriceVal)) {
    whereConditions.push({ priceInRSD: { greater_than_equal: minPriceVal } })
  }
  if (maxPriceVal && !isNaN(maxPriceVal)) {
    whereConditions.push({ priceInRSD: { less_than_equal: maxPriceVal } })
  }

  if (onSale) {
    const saleVariantProducts = await payload.find({
      collection: 'variants',
      where: { salePriceInRSD: { exists: true } },
      select: { product: true },
      pagination: false,
      depth: 0,
    })
    const productIdsFromVariants = [
      ...new Set(
        saleVariantProducts.docs.map((v) =>
          typeof v.product === 'number' ? v.product : (v.product as { id: number }).id,
        ),
      ),
    ]
    const saleConditions: Where[] = [{ salePriceInRSD: { exists: true } }]
    if (productIdsFromVariants.length > 0) {
      saleConditions.push({ id: { in: productIdsFromVariants } })
    }
    whereConditions.push({ or: saleConditions })
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    depth: 1,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInRSD: true,
      salePriceInRSD: true,
      variants: true,
    },
    sort,
    where: { and: whereConditions },
  })

  const resultsText = products.docs.length > 1 ? 'rezultata' : 'rezultat'

  return (
    <>
      {searchValue && products.docs.length > 0 ? (
        <p className="mb-4">
          {`Prikazano ${products.docs.length} ${resultsText} za `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {products.docs.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-10 py-12 text-center shadow-sm max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 120 120"
              fill="none"
              className="h-28 w-28 text-muted-foreground/40"
            >
              <rect x="20" y="30" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="2" />
              <path d="M20 45h80" stroke="currentColor" strokeWidth="2" />
              <circle cx="60" cy="70" r="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
              <path d="M56 66l8 8M64 66l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M38 38h6M50 38h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </>
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
