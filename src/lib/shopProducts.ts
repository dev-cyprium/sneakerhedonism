import { inStockWhere } from './inStock'
import type { ShopSortValue } from '@/components/shop/filters/sortOptions'
import type { Payload } from 'payload'
import type { Where } from 'payload'

/**
 * Maps a UI sort value to the DB sort.
 * - Title sorting uses `slug` (lowercase) because the DB collation (C.UTF-8) is
 *   case-sensitive and would put e.g. "adidas" after "Z".
 * - `-id` tiebreaker keeps pagination stable when many rows share the sort value.
 */
export function toShopDbSort(sort: ShopSortValue): string[] {
  const primary = sort === 'title' ? 'slug' : sort === '-title' ? '-slug' : sort
  return [primary, '-id']
}

export type ShopProductFilterParams = {
  categoryIds: number[]
  brandId: number | null
  searchValue: string
  variantProductIds: number[] | null
  minPriceVal: number | null
  maxPriceVal: number | null
  onSale: boolean
}

export const SHOP_PRODUCT_SELECT = {
  title: true,
  slug: true,
  gallery: true,
  categories: true,
  priceInRSD: true,
  salePriceInRSD: true,
  effectivePrice: true,
  variants: true,
} as const

export async function buildShopProductWhere(
  params: ShopProductFilterParams,
  payload: Payload,
): Promise<Where[]> {
  const { categoryIds, brandId, searchValue, variantProductIds, minPriceVal, maxPriceVal, onSale } =
    params

  const whereConditions: Where[] = [inStockWhere]

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

  if (
    (minPriceVal != null && !isNaN(minPriceVal)) ||
    (maxPriceVal != null && !isNaN(maxPriceVal))
  ) {
    // Filter by effective price: use salePriceInRSD when it exists, otherwise priceInRSD
    const saleConditions: Where[] = [{ salePriceInRSD: { exists: true } }]
    const regularConditions: Where[] = [{ salePriceInRSD: { exists: false } }]

    if (minPriceVal != null && !isNaN(minPriceVal)) {
      saleConditions.push({ salePriceInRSD: { greater_than_equal: minPriceVal } })
      regularConditions.push({ priceInRSD: { greater_than_equal: minPriceVal } })
    }
    if (maxPriceVal != null && !isNaN(maxPriceVal)) {
      saleConditions.push({ salePriceInRSD: { less_than_equal: maxPriceVal } })
      regularConditions.push({ priceInRSD: { less_than_equal: maxPriceVal } })
    }

    whereConditions.push({
      or: [{ and: saleConditions }, { and: regularConditions }],
    })
  }

  if (onSale) {
    const saleVariantProducts = await payload.find({
      collection: 'variants',
      where: {
        and: [{ salePriceInRSD: { exists: true } }, { product: { exists: true } }],
      },
      select: { product: true },
      pagination: false,
      depth: 0,
    })
    const productIdsFromVariants = [
      ...new Set(
        saleVariantProducts.docs
          .map((v) => (typeof v.product === 'number' ? v.product : v.product?.id))
          .filter((id): id is number => typeof id === 'number'),
      ),
    ]
    const saleConditions: Where[] = [{ salePriceInRSD: { exists: true } }]
    if (productIdsFromVariants.length > 0) {
      saleConditions.push({ id: { in: productIdsFromVariants } })
    }
    whereConditions.push({ or: saleConditions })
  }

  return whereConditions
}
