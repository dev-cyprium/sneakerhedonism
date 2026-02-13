import type { Product, Variant } from '@/payload-types'

const SALE_FIELD = 'salePriceInRSD' as const
const PRICE_FIELD = 'priceInRSD' as const

export type SaleInfo = {
  originalPrice: number
  salePrice: number
  discountPercent: number
  isOnSale: true
}

export type PriceInfo = {
  amount: number
  saleInfo?: SaleInfo | null
}

/**
 * Resolves price for a product with an optional specific variant.
 * Rule: Sale/discount price always takes precedence when set (product or variant).
 * Variant price overrides base price when both exist at the same tier.
 */
export function resolveItemPrice(
  product: Product | Partial<Product>,
  variant?: Variant | Partial<Variant> | null,
): number | undefined {
  const variantSalePrice = variant?.salePriceInRSD
  const variantPrice = variant?.priceInRSD
  const baseSalePrice = product.salePriceInRSD
  const basePrice = product.priceInRSD

  // Prefer any sale price over any regular price (discount always wins)
  if (variantSalePrice != null && typeof variantSalePrice === 'number') return variantSalePrice
  if (baseSalePrice != null && typeof baseSalePrice === 'number') return baseSalePrice
  if (variantPrice != null && typeof variantPrice === 'number') return variantPrice
  if (basePrice != null && typeof basePrice === 'number') return basePrice
  return undefined
}

/**
 * Computes discount percentage from original and sale price.
 */
export function computeDiscountPercent(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

/**
 * Resolves effective price for a variant: sale price if on sale, else regular price.
 */
function getVariantEffectivePrice(v: Variant): number | undefined {
  const saleField = 'salePriceInRSD' as keyof Variant
  const priceField = 'priceInRSD' as keyof Variant
  const sale = v[saleField]
  const price = v[priceField]
  if (sale != null && typeof sale === 'number') return sale
  if (price != null && typeof price === 'number') return price
  return undefined
}

/**
 * Resolves price range for a product with variants (no specific variant selected).
 * Uses effective prices (sale when available) from variants or base product.
 */
export function resolveProductPriceRange(
  product: Product | Partial<Product>,
  currencyField: keyof Product = 'priceInRSD',
): { lowest: number; highest: number } | null {
  const variantPriceField = currencyField as keyof Variant
  const variants = product.variants?.docs?.filter((v): v is Variant => typeof v === 'object') ?? []

  if (variants.length > 0) {
    const effectivePrices = variants
      .map((v) => {
        const sale = v[SALE_FIELD]
        const price = v[variantPriceField]
        if (sale != null && typeof sale === 'number') return sale
        if (price != null && typeof price === 'number') return price
        return null
      })
      .filter((p): p is number => p != null)
    if (effectivePrices.length > 0) {
      return { lowest: Math.min(...effectivePrices), highest: Math.max(...effectivePrices) }
    }
  }

  const baseSale = product[SALE_FIELD]
  const basePrice = product[currencyField]
  const effectiveBase =
    baseSale != null && typeof baseSale === 'number'
      ? baseSale
      : basePrice != null && typeof basePrice === 'number'
        ? basePrice
        : null
  if (effectiveBase != null) return { lowest: effectiveBase, highest: effectiveBase }
  return null
}

/**
 * Resolves a single display price for product grids/lists.
 * Uses effective price (sale when available).
 */
export function resolveProductDisplayPrice(
  product: Product | Partial<Product>,
  currencyField: keyof Product = 'priceInRSD',
): number | undefined {
  const range = resolveProductPriceRange(product, currencyField)
  return range ? range.lowest : undefined
}

/**
 * Sale info for display (badge, strikethrough original, sale price).
 * Returns null when product/variant is not on sale.
 */
export function resolveProductSaleInfo(
  product: Product | Partial<Product>,
  variant?: Variant | Partial<Variant> | null,
): SaleInfo | null {
  if (variant && typeof variant === 'object') {
    const orig = variant[PRICE_FIELD]
    const sale = variant[SALE_FIELD]
    if (
      orig != null &&
      typeof orig === 'number' &&
      sale != null &&
      typeof sale === 'number' &&
      sale < orig
    ) {
      return {
        originalPrice: orig,
        salePrice: sale,
        discountPercent: computeDiscountPercent(orig, sale),
        isOnSale: true,
      }
    }
  }

  const orig = product[PRICE_FIELD]
  const sale = product[SALE_FIELD]
  if (
    orig != null &&
    typeof orig === 'number' &&
    sale != null &&
    typeof sale === 'number' &&
    sale < orig
  ) {
    return {
      originalPrice: orig,
      salePrice: sale,
      discountPercent: computeDiscountPercent(orig, sale),
      isOnSale: true,
    }
  }

  return null
}

/**
 * For product with variants: finds sale info for the variant with lowest effective price.
 * For product without variants: uses product-level sale info.
 */
export function resolveProductDisplaySaleInfo(
  product: Product | Partial<Product>,
): SaleInfo | null {
  const variants = product.variants?.docs?.filter((v): v is Variant => typeof v === 'object') ?? []

  if (variants.length > 0) {
    let bestSaleInfo: SaleInfo | null = null
    let lowestPrice = Infinity
    for (const v of variants) {
      const info = resolveProductSaleInfo(product, v)
      const effective = info ? info.salePrice : getVariantEffectivePrice(v)
      if (effective != null && effective < lowestPrice) {
        lowestPrice = effective
        bestSaleInfo = info
      }
    }
    return bestSaleInfo
  }

  return resolveProductSaleInfo(product)
}

/**
 * Resolves display price info for product grids: amount and optional sale info.
 */
export function resolveProductDisplayPriceInfo(
  product: Product | Partial<Product>,
): PriceInfo | null {
  const saleInfo = resolveProductDisplaySaleInfo(product)
  const amount = resolveProductDisplayPrice(product)
  if (amount == null) return null
  return saleInfo ? { amount: saleInfo.salePrice, saleInfo } : { amount, saleInfo: null }
}
