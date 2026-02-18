import type { Payload } from 'payload'
import type { Where } from 'payload'

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
  variants: true,
} as const

export async function buildShopProductWhere(
  params: ShopProductFilterParams,
  payload: Payload,
): Promise<Where[]> {
  const {
    categoryIds,
    brandId,
    searchValue,
    variantProductIds,
    minPriceVal,
    maxPriceVal,
    onSale,
  } = params

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

  if (minPriceVal != null && !isNaN(minPriceVal)) {
    whereConditions.push({ priceInRSD: { greater_than_equal: minPriceVal } })
  }
  if (maxPriceVal != null && !isNaN(maxPriceVal)) {
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

  return whereConditions
}
