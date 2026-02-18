import { describe, it, expect } from 'vitest'

import { formatRSD } from '@/lib/formatRSD'
import {
  resolveItemPrice,
  computeDiscountPercent,
  resolveProductPriceRange,
  resolveProductDisplayPrice,
  resolveProductSaleInfo,
  resolveProductDisplaySaleInfo,
  resolveProductDisplayPriceInfo,
} from '@/lib/resolvePrice'
import type { Product, Variant } from '@/payload-types'

// ---------------------------------------------------------------------------
// Helpers – minimal Product / Variant stubs
// ---------------------------------------------------------------------------
function makeProduct(overrides: Partial<Product> = {}): Partial<Product> {
  return {
    priceInRSD: 10000,
    ...overrides,
  }
}

function makeVariant(overrides: Partial<Variant> = {}): Partial<Variant> {
  return {
    priceInRSD: 12000,
    ...overrides,
  }
}

function makeProductWithVariants(
  productOverrides: Partial<Product> = {},
  variants: Partial<Variant>[],
): Partial<Product> {
  return {
    priceInRSD: 10000,
    ...productOverrides,
    variants: {
      docs: variants as Variant[],
    },
  } as Partial<Product>
}

// ---------------------------------------------------------------------------
// formatRSD
// ---------------------------------------------------------------------------
describe('formatRSD', () => {
  it('formats integer price', () => {
    // Serbian locale uses period for thousands, comma for decimals
    const result = formatRSD(1000)
    expect(result).toContain('1')
    expect(result).toContain('00')
    expect(result.endsWith('RSD')).toBe(true)
  })

  it('formats decimal price', () => {
    const result = formatRSD(1234.5)
    expect(result.endsWith('RSD')).toBe(true)
    expect(result).toContain('50')
  })

  it('formats zero', () => {
    const result = formatRSD(0)
    expect(result.endsWith('RSD')).toBe(true)
    expect(result).toContain('0')
  })

  it('formats large numbers', () => {
    const result = formatRSD(100000)
    expect(result.endsWith('RSD')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// resolveItemPrice
// ---------------------------------------------------------------------------
describe('resolveItemPrice', () => {
  it('returns base price when no variant', () => {
    expect(resolveItemPrice(makeProduct({ priceInRSD: 5000 }))).toBe(5000)
  })

  it('returns variant sale price first (highest priority)', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 8000 })
    const variant = makeVariant({ priceInRSD: 12000, salePriceInRSD: 9000 })
    expect(resolveItemPrice(product, variant)).toBe(9000)
  })

  it('returns base sale price when no variant sale price', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 7000 })
    const variant = makeVariant({ priceInRSD: 12000 })
    expect(resolveItemPrice(product, variant)).toBe(7000)
  })

  it('returns variant regular price when no sale prices exist', () => {
    const product = makeProduct({ priceInRSD: 10000 })
    const variant = makeVariant({ priceInRSD: 12000 })
    expect(resolveItemPrice(product, variant)).toBe(12000)
  })

  it('returns base price when variant has no price', () => {
    const product = makeProduct({ priceInRSD: 10000 })
    const variant = makeVariant({ priceInRSD: undefined })
    expect(resolveItemPrice(product, variant)).toBe(10000)
  })

  it('returns undefined when no prices exist', () => {
    expect(resolveItemPrice(makeProduct({ priceInRSD: undefined }))).toBeUndefined()
  })

  it('returns undefined with no variant and no base price', () => {
    expect(resolveItemPrice({}, null)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// computeDiscountPercent
// ---------------------------------------------------------------------------
describe('computeDiscountPercent', () => {
  it('computes 50% discount', () => {
    expect(computeDiscountPercent(10000, 5000)).toBe(50)
  })

  it('computes 25% discount', () => {
    expect(computeDiscountPercent(10000, 7500)).toBe(25)
  })

  it('rounds to nearest integer', () => {
    expect(computeDiscountPercent(10000, 6666)).toBe(33)
  })

  it('returns 0 for zero original price', () => {
    expect(computeDiscountPercent(0, 5000)).toBe(0)
  })

  it('returns 100 for free', () => {
    expect(computeDiscountPercent(10000, 0)).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// resolveProductPriceRange
// ---------------------------------------------------------------------------
describe('resolveProductPriceRange', () => {
  it('returns range from variants', () => {
    const product = makeProductWithVariants({}, [
      makeVariant({ priceInRSD: 8000 }),
      makeVariant({ priceInRSD: 12000 }),
      makeVariant({ priceInRSD: 10000 }),
    ])
    expect(resolveProductPriceRange(product)).toEqual({ lowest: 8000, highest: 12000 })
  })

  it('prefers sale price in variants for range', () => {
    const product = makeProductWithVariants({}, [
      makeVariant({ priceInRSD: 12000, salePriceInRSD: 6000 }),
      makeVariant({ priceInRSD: 10000 }),
    ])
    expect(resolveProductPriceRange(product)).toEqual({ lowest: 6000, highest: 10000 })
  })

  it('falls back to base price when no variants', () => {
    const product = makeProduct({ priceInRSD: 5000 })
    expect(resolveProductPriceRange(product)).toEqual({ lowest: 5000, highest: 5000 })
  })

  it('falls back to base sale price when no variants', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 7000 })
    expect(resolveProductPriceRange(product)).toEqual({ lowest: 7000, highest: 7000 })
  })

  it('returns null when no prices at all', () => {
    expect(resolveProductPriceRange({})).toBeNull()
  })

  it('handles empty variants array', () => {
    const product = makeProductWithVariants({ priceInRSD: 5000 }, [])
    expect(resolveProductPriceRange(product)).toEqual({ lowest: 5000, highest: 5000 })
  })
})

// ---------------------------------------------------------------------------
// resolveProductDisplayPrice
// ---------------------------------------------------------------------------
describe('resolveProductDisplayPrice', () => {
  it('returns lowest price from range', () => {
    const product = makeProductWithVariants({}, [
      makeVariant({ priceInRSD: 12000 }),
      makeVariant({ priceInRSD: 8000 }),
    ])
    expect(resolveProductDisplayPrice(product)).toBe(8000)
  })

  it('returns base price for simple product', () => {
    expect(resolveProductDisplayPrice(makeProduct({ priceInRSD: 5000 }))).toBe(5000)
  })

  it('returns undefined when no price', () => {
    expect(resolveProductDisplayPrice({})).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// resolveProductSaleInfo
// ---------------------------------------------------------------------------
describe('resolveProductSaleInfo', () => {
  it('returns sale info from variant', () => {
    const product = makeProduct({ priceInRSD: 10000 })
    const variant = makeVariant({ priceInRSD: 12000, salePriceInRSD: 9000 })
    const info = resolveProductSaleInfo(product, variant)
    expect(info).toEqual({
      originalPrice: 12000,
      salePrice: 9000,
      discountPercent: 25,
      isOnSale: true,
    })
  })

  it('returns sale info from product when variant has no sale', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 7000 })
    const variant = makeVariant({ priceInRSD: 12000 })
    const info = resolveProductSaleInfo(product, variant)
    expect(info).toEqual({
      originalPrice: 10000,
      salePrice: 7000,
      discountPercent: 30,
      isOnSale: true,
    })
  })

  it('returns product-level sale info when no variant', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 5000 })
    const info = resolveProductSaleInfo(product)
    expect(info).toEqual({
      originalPrice: 10000,
      salePrice: 5000,
      discountPercent: 50,
      isOnSale: true,
    })
  })

  it('returns null when not on sale', () => {
    expect(resolveProductSaleInfo(makeProduct({ priceInRSD: 10000 }))).toBeNull()
  })

  it('returns null when sale price >= original', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 10000 })
    expect(resolveProductSaleInfo(product)).toBeNull()
  })

  it('returns null when sale price > original on variant', () => {
    const product = makeProduct({ priceInRSD: 10000 })
    const variant = makeVariant({ priceInRSD: 5000, salePriceInRSD: 6000 })
    expect(resolveProductSaleInfo(product, variant)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// resolveProductDisplaySaleInfo
// ---------------------------------------------------------------------------
describe('resolveProductDisplaySaleInfo', () => {
  it('picks variant with lowest effective price that is on sale', () => {
    const product = makeProductWithVariants({}, [
      makeVariant({ priceInRSD: 15000, salePriceInRSD: 10000 }),
      makeVariant({ priceInRSD: 12000, salePriceInRSD: 8000 }),
      makeVariant({ priceInRSD: 10000 }),
    ])
    const info = resolveProductDisplaySaleInfo(product)
    expect(info).toEqual({
      originalPrice: 12000,
      salePrice: 8000,
      discountPercent: 33,
      isOnSale: true,
    })
  })

  it('returns null when no variants are on sale', () => {
    const product = makeProductWithVariants({}, [
      makeVariant({ priceInRSD: 10000 }),
      makeVariant({ priceInRSD: 12000 }),
    ])
    expect(resolveProductDisplaySaleInfo(product)).toBeNull()
  })

  it('falls back to product-level sale info without variants', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 7000 })
    const info = resolveProductDisplaySaleInfo(product)
    expect(info).toEqual({
      originalPrice: 10000,
      salePrice: 7000,
      discountPercent: 30,
      isOnSale: true,
    })
  })

  it('returns null when product has no sale and no variants', () => {
    expect(resolveProductDisplaySaleInfo(makeProduct())).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// resolveProductDisplayPriceInfo
// ---------------------------------------------------------------------------
describe('resolveProductDisplayPriceInfo', () => {
  it('returns amount with sale info when on sale', () => {
    const product = makeProduct({ priceInRSD: 10000, salePriceInRSD: 7000 })
    const info = resolveProductDisplayPriceInfo(product)
    expect(info).toEqual({
      amount: 7000,
      saleInfo: {
        originalPrice: 10000,
        salePrice: 7000,
        discountPercent: 30,
        isOnSale: true,
      },
    })
  })

  it('returns amount without sale info when not on sale', () => {
    const product = makeProduct({ priceInRSD: 10000 })
    const info = resolveProductDisplayPriceInfo(product)
    expect(info).toEqual({ amount: 10000, saleInfo: null })
  })

  it('returns null when no price available', () => {
    expect(resolveProductDisplayPriceInfo({})).toBeNull()
  })

  it('uses lowest variant price as display amount', () => {
    const product = makeProductWithVariants({}, [
      makeVariant({ priceInRSD: 12000, salePriceInRSD: 9000 }),
      makeVariant({ priceInRSD: 8000 }),
    ])
    const info = resolveProductDisplayPriceInfo(product)
    expect(info).not.toBeNull()
    expect(info!.amount).toBe(8000)
  })
})
