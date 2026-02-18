import {
  DEFAULT_SHOP_SORT,
  isShopSortValue,
  type ShopSortValue,
} from '@/components/shop/filters/sortOptions'
import { buildShopProductWhere, SHOP_PRODUCT_SELECT } from '@/lib/shopProducts'
import type { Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

const DEFAULT_LIMIT = 12

function parseArray(value: string | string[] | undefined): number[] {
  if (value == null) return []
  const str = Array.isArray(value) ? value[0] : value
  if (!str) return []
  try {
    const parsed = JSON.parse(str) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
      : []
  } catch {
    return []
  }
}

function parseNullableArray(value: string | string[] | undefined): number[] | null {
  if (value == null) return null
  const str = Array.isArray(value) ? value[0] : value
  if (!str || str === 'null') return null
  return parseArray(value)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(36, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT))

  const searchValue =
    typeof searchParams.get('q') === 'string' ? searchParams.get('q') ?? '' : ''

  const sortParam = searchParams.get('sort')
  const sort: ShopSortValue = isShopSortValue(sortParam) ? sortParam : DEFAULT_SHOP_SORT

  const categoryIds = parseArray(searchParams.get('categoryIds'))
  const brandIdParam = searchParams.get('brandId')
  const brandId =
    brandIdParam != null && brandIdParam !== ''
      ? Number(brandIdParam)
      : null
  const variantProductIds = parseNullableArray(searchParams.get('variantProductIds'))

  const minPriceParam = searchParams.get('minPrice')
  const minPriceVal =
    minPriceParam != null && minPriceParam !== ''
      ? Number(minPriceParam)
      : null
  const maxPriceParam = searchParams.get('maxPrice')
  const maxPriceVal =
    maxPriceParam != null && maxPriceParam !== ''
      ? Number(maxPriceParam)
      : null

  const onSaleParam = searchParams.get('onSale')
  const onSale = onSaleParam === '1' || onSaleParam === 'true'

  const payload = await getPayload({ config: configPromise })
  const whereConditions = await buildShopProductWhere(
    {
      categoryIds,
      brandId: Number.isFinite(brandId) ? brandId : null,
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
    page,
    limit,
  })

  return NextResponse.json({
    docs: result.docs as Partial<Product>[],
    hasNextPage: result.hasNextPage ?? false,
    totalDocs: result.totalDocs,
  })
}
