import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import { ShopSidebar } from '@/components/shop/ShopSidebar'
import configPromise from '@payload-config'
import { getPayload, Where } from 'payload'
import React from 'react'

export const metadata = {
  description: 'Pretražite proizvode u našoj ponudi.',
  title: 'Prodavnica',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

const VALID_SORT = ['title', '-title', '-createdAt', 'priceInRSD', '-priceInRSD'] as const

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const {
    q: searchValueRaw,
    sort: sortRaw,
    category,
    brand,
    minPrice,
    maxPrice,
  } = params

  const searchValue = typeof searchValueRaw === 'string'
    ? searchValueRaw
    : Array.isArray(searchValueRaw)
      ? searchValueRaw[0] ?? ''
      : ''

  const sort = sortRaw && VALID_SORT.includes(sortRaw as (typeof VALID_SORT)[number])
    ? (sortRaw as string)
    : undefined
  const payload = await getPayload({ config: configPromise })

  // --- Fetch all categories (depth 0 for raw IDs) ---
  const allCategories = await payload.find({
    collection: 'categories',
    sort: 'title',
    pagination: false,
    depth: 0,
  })

  const parentCategories = allCategories.docs
    .filter((c) => !c.parent)
    .map((c) => ({ id: c.id, title: c.title, slug: c.slug }))

  // --- Resolve selected parent category ---
  let categoryIds: number[] = []
  let childCategories = allCategories.docs.filter(() => false) // empty typed array
  let selectedCategoryId: number | null = null

  if (category) {
    const slug = Array.isArray(category) ? category[0] : category
    const cat = allCategories.docs.find((c) => c.slug === slug)
    if (cat) {
      selectedCategoryId = cat.id
      categoryIds.push(cat.id)
      childCategories = allCategories.docs.filter((c) => c.parent === cat.id)
      categoryIds.push(...childCategories.map((c) => c.id))
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

  // --- Fetch variant types with options ---
  const variantTypesResult = await payload.find({
    collection: 'variantTypes',
    depth: 1,
    pagination: false,
  })

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

  // --- Fetch price range (min/max across all published products) ---
  const [minResult, maxResult] = await Promise.all([
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
  ])
  const priceRange = {
    min: minResult.docs[0]?.priceInRSD ?? 0,
    max: maxResult.docs[0]?.priceInRSD ?? 100000,
  }

  // --- Build product query ---
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

  const minPriceVal = minPrice ? Number(Array.isArray(minPrice) ? minPrice[0] : minPrice) : null
  const maxPriceVal = maxPrice ? Number(Array.isArray(maxPrice) ? maxPrice[0] : maxPrice) : null
  if (minPriceVal && !isNaN(minPriceVal)) {
    whereConditions.push({ priceInRSD: { greater_than_equal: minPriceVal } })
  }
  if (maxPriceVal && !isNaN(maxPriceVal)) {
    whereConditions.push({ priceInRSD: { less_than_equal: maxPriceVal } })
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInRSD: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    where: { and: whereConditions },
  })

  const resultsText = products.docs.length > 1 ? 'rezultata' : 'rezultat'

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10">
      <ShopSidebar
        parentCategories={parentCategories}
        brands={brands}
        variantTypes={variantTypes}
        priceRange={priceRange}
      />
      <div className="min-h-screen w-full">
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
          <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.docs.map((product) => {
              return <ProductGridItem key={product.id} product={product} />
            })}
          </Grid>
        ) : null}
      </div>
    </div>
  )
}
