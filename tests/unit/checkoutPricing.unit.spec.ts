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
}

function buildMockPayload({
  coupons = [],
  ordersUsage = {},
  productPrice = 10000,
}: {
  coupons?: MockCoupon[]
  ordersUsage?: Record<number, number>
  productPrice?: number
}): Payload {
  const findByID = vi.fn(async ({ collection, id }: { collection: string; id: number | string }) => {
    if (collection === 'products') {
      return {
        id,
        priceInRSD: productPrice,
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
})
