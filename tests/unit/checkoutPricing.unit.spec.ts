import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

import { resolveCheckoutPricing } from '@/lib/checkoutPricing'

type MockCoupon = {
  id: number
  code: string
  active: boolean
  discountPercent: number
  minimumSubtotal: number
  usageLimit: number | null
  unlimitedUsage: boolean
  expiresAt?: null | string
  appliesTo?: 'all' | 'categories'
  categories?: number[]
}

type MockProduct = {
  categories?: number[]
  price: number
  /** Omit for published; 'draft' for unpublished; 'deleted' to make findByID throw NotFound. */
  status?: 'deleted' | 'draft'
}

function buildMockPayload({
  categoryParents = {},
  coupons = [],
  ordersUsage = {},
  productPrice = 10000,
  products = {},
}: {
  /** child category id -> parent category id, used to expand a coupon's categories */
  categoryParents?: Record<number, number>
  coupons?: MockCoupon[]
  ordersUsage?: Record<number, number>
  productPrice?: number
  products?: Record<number, MockProduct>
}): Payload {
  const findByID = vi.fn(async ({ collection, id }: { collection: string; id: number | string }) => {
    if (collection === 'products') {
      const product = products[Number(id)]
      if (product?.status === 'deleted') throw new Error('Not Found')

      return {
        id,
        _status: product?.status === 'draft' ? 'draft' : 'published',
        priceInRSD: product?.price ?? productPrice,
        ...(product?.categories ? { categories: product.categories } : {}),
      }
    }

    if (collection === 'variants') {
      return {
        id,
        priceInRSD: productPrice,
      }
    }

    throw new Error(`Unexpected collection in findByID: ${collection}`)
  })

  const find = vi.fn(async ({ collection, where }: { collection: string; where?: Record<string, any> }) => {
    if (collection === 'coupons') {
      const andConditions = Array.isArray(where?.and) ? where.and : []
      const code = andConditions.find((condition) => condition?.code?.equals)?.code?.equals
      const matching = coupons.filter((coupon) => coupon.code === code && coupon.active)

      return {
        docs: matching,
        totalDocs: matching.length,
      }
    }

    if (collection === 'categories') {
      const parentIds: number[] = where?.parent?.in ?? []
      const docs = Object.entries(categoryParents)
        .filter(([, parentId]) => parentIds.includes(parentId))
        .map(([childId]) => ({ id: Number(childId) }))

      return { docs, totalDocs: docs.length }
    }

    if (collection === 'orders') {
      const couponID = where?.coupon?.equals
      const usage = typeof couponID === 'number' ? (ordersUsage[couponID] ?? 0) : 0

      return {
        docs: [],
        totalDocs: usage,
      }
    }

    throw new Error(`Unexpected collection in find: ${collection}`)
  })

  return {
    findByID,
    find,
  } as unknown as Payload
}

describe('resolveCheckoutPricing', () => {
  it('applies a valid percent coupon and returns correct totals', async () => {
    const payload = buildMockPayload({
      coupons: [
        {
          id: 1,
          code: 'SAVE10',
          active: true,
          discountPercent: 10,
          minimumSubtotal: 5000,
          usageLimit: 10,
          unlimitedUsage: false,
          expiresAt: null,
        },
      ],
      ordersUsage: { 1: 3 },
      productPrice: 10000,
    })

    const result = await resolveCheckoutPricing({
      cartItems: [{ product: 1, quantity: 1 }],
      couponCode: 'save10',
      currency: 'RSD',
      payload,
      user: { id: 123 },
    })

    expect(result.subtotalAmount).toBe(10000)
    expect(result.discountAmount).toBe(1000)
    expect(result.discountedSubtotalAmount).toBe(9000)
    expect(result.shippingAmount).toBe(0)
    expect(result.totalAmount).toBe(9000)
    expect(result.coupon?.code).toBe('SAVE10')
  })

  it('rejects expired coupons', async () => {
    const payload = buildMockPayload({
      coupons: [
        {
          id: 2,
          code: 'EXPIRED10',
          active: true,
          discountPercent: 10,
          minimumSubtotal: 0,
          usageLimit: 5,
          unlimitedUsage: false,
          expiresAt: '2000-01-01T00:00:00.000Z',
        },
      ],
      productPrice: 5000,
    })

    await expect(
      resolveCheckoutPricing({
        cartItems: [{ product: 1, quantity: 1 }],
        couponCode: 'EXPIRED10',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      }),
    ).rejects.toThrow('Coupon has expired.')
  })

  it('rejects coupons when minimum subtotal is not reached', async () => {
    const payload = buildMockPayload({
      coupons: [
        {
          id: 3,
          code: 'MIN10000',
          active: true,
          discountPercent: 10,
          minimumSubtotal: 10000,
          usageLimit: 5,
          unlimitedUsage: false,
          expiresAt: null,
        },
      ],
      productPrice: 2500,
    })

    await expect(
      resolveCheckoutPricing({
        cartItems: [{ product: 1, quantity: 1 }],
        couponCode: 'MIN10000',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      }),
    ).rejects.toThrow('Coupon minimum subtotal has not been reached.')
  })

  it('rejects unlimited coupons for guests', async () => {
    const payload = buildMockPayload({
      coupons: [
        {
          id: 4,
          code: 'MEMBERSONLY',
          active: true,
          discountPercent: 20,
          minimumSubtotal: 0,
          usageLimit: null,
          unlimitedUsage: true,
          expiresAt: null,
        },
      ],
      productPrice: 5000,
    })

    await expect(
      resolveCheckoutPricing({
        cartItems: [{ product: 1, quantity: 1 }],
        couponCode: 'MEMBERSONLY',
        currency: 'RSD',
        payload,
        user: null,
      }),
    ).rejects.toThrow('Guests cannot redeem this coupon.')
  })

  it('rejects coupons when usage limit is reached', async () => {
    const payload = buildMockPayload({
      coupons: [
        {
          id: 5,
          code: 'LIMIT1',
          active: true,
          discountPercent: 10,
          minimumSubtotal: 0,
          usageLimit: 1,
          unlimitedUsage: false,
          expiresAt: null,
        },
      ],
      ordersUsage: { 5: 1 },
      productPrice: 5000,
    })

    await expect(
      resolveCheckoutPricing({
        cartItems: [{ product: 1, quantity: 1 }],
        couponCode: 'LIMIT1',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      }),
    ).rejects.toThrow('Coupon usage limit has been reached.')
  })

  describe('category-scoped coupons', () => {
    // Patta (25) sits under Odeća (10); Nike (2) sits under Patike (1).
    const CATEGORY_PARENTS = { 2: 1, 25: 10 }
    const PRODUCTS = {
      1: { categories: [10, 25], price: 8000 },
      2: { categories: [1, 2], price: 9000 },
    }

    const pattaCoupon = (overrides = {}) => ({
      id: 10,
      code: 'PATTA10',
      active: true,
      discountPercent: 10,
      minimumSubtotal: 0,
      usageLimit: 100,
      unlimitedUsage: false,
      expiresAt: null,
      appliesTo: 'categories' as const,
      categories: [25],
      ...overrides,
    })

    it('discounts only the items in the coupon categories', async () => {
      const payload = buildMockPayload({
        categoryParents: CATEGORY_PARENTS,
        coupons: [pattaCoupon()],
        products: PRODUCTS,
      })

      const result = await resolveCheckoutPricing({
        cartItems: [
          { product: 1, quantity: 1 },
          { product: 2, quantity: 1 },
        ],
        couponCode: 'PATTA10',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      })

      expect(result.subtotalAmount).toBe(17000)
      expect(result.discountBaseAmount).toBe(8000)
      expect(result.discountAmount).toBe(800)
      expect(result.coupon?.appliesTo).toBe('categories')
    })

    it('rejects the coupon when nothing in the cart qualifies', async () => {
      const payload = buildMockPayload({
        categoryParents: CATEGORY_PARENTS,
        coupons: [pattaCoupon()],
        products: PRODUCTS,
      })

      await expect(
        resolveCheckoutPricing({
          cartItems: [{ product: 2, quantity: 1 }],
          couponCode: 'PATTA10',
          currency: 'RSD',
          payload,
          user: { id: 1 },
        }),
      ).rejects.toThrow('Coupon does not apply to any item in the cart.')
    })

    it('covers the brands beneath a top-level category', async () => {
      const payload = buildMockPayload({
        categoryParents: CATEGORY_PARENTS,
        coupons: [pattaCoupon({ categories: [10], code: 'ODECA10' })],
        products: PRODUCTS,
      })

      const result = await resolveCheckoutPricing({
        cartItems: [
          { product: 1, quantity: 1 },
          { product: 2, quantity: 1 },
        ],
        couponCode: 'ODECA10',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      })

      expect(result.discountBaseAmount).toBe(8000)
      expect(result.discountAmount).toBe(800)
    })

    it('measures the minimum subtotal against the qualifying items only', async () => {
      const payload = buildMockPayload({
        categoryParents: CATEGORY_PARENTS,
        coupons: [pattaCoupon({ minimumSubtotal: 10000 })],
        products: PRODUCTS,
      })

      // The cart is worth 17000, but only 8000 of it is Patta.
      await expect(
        resolveCheckoutPricing({
          cartItems: [
            { product: 1, quantity: 1 },
            { product: 2, quantity: 1 },
          ],
          couponCode: 'PATTA10',
          currency: 'RSD',
          payload,
          user: { id: 1 },
        }),
      ).rejects.toThrow('Coupon minimum subtotal has not been reached.')

      const result = await resolveCheckoutPricing({
        cartItems: [{ product: 1, quantity: 2 }],
        couponCode: 'PATTA10',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      })

      expect(result.discountBaseAmount).toBe(16000)
      expect(result.discountAmount).toBe(1600)
    })

    it('leaves cart-wide coupons discounting everything', async () => {
      const payload = buildMockPayload({
        categoryParents: CATEGORY_PARENTS,
        coupons: [pattaCoupon({ appliesTo: 'all' as const, categories: [], code: 'ALL10' })],
        products: PRODUCTS,
      })

      const result = await resolveCheckoutPricing({
        cartItems: [
          { product: 1, quantity: 1 },
          { product: 2, quantity: 1 },
        ],
        couponCode: 'ALL10',
        currency: 'RSD',
        payload,
        user: { id: 1 },
      })

      expect(result.discountBaseAmount).toBe(17000)
      expect(result.discountAmount).toBe(1700)
      expect(result.coupon?.appliesTo).toBe('all')
    })
  })
  describe('unavailable products', () => {
    it('does not charge for a deleted or unpublished product even if its id reaches the server', async () => {
      // The storefront hides such lines; a public reader gets a bare id for
      // an unpublished product and the checkout used to price it anyway.
      const payload = buildMockPayload({
        products: {
          1: { price: 5000 },
          2: { price: 3600, status: 'draft' },
          3: { price: 9999, status: 'deleted' },
        },
      })

      const result = await resolveCheckoutPricing({
        cartItems: [
          { product: 1, quantity: 1 },
          { product: 2, quantity: 1 },
          { product: 3, quantity: 1 },
        ],
        currency: 'RSD',
        payload,
      })

      expect(result.subtotalAmount).toBe(5000)
      expect(result.flattenedItems).toEqual([{ product: 1, quantity: 1 }])
    })

    it('refuses a cart whose every line is unavailable', async () => {
      const payload = buildMockPayload({ products: { 2: { price: 1, status: 'draft' } } })

      await expect(
        resolveCheckoutPricing({ cartItems: [{ product: 2, quantity: 1 }], currency: 'RSD', payload }),
      ).rejects.toThrow('Cart has no purchasable items.')
    })
  })
})
