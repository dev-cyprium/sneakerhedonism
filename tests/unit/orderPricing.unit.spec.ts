import { describe, expect, it } from 'vitest'
import type { PayloadRequest } from 'payload'

import { couponCodeFromRequest, orderPricingFromTransaction } from '@/payments/orderPricing'

function reqWithBody(body: Record<string, unknown> | undefined): PayloadRequest {
  return { data: body } as unknown as PayloadRequest
}

describe('couponCodeFromRequest', () => {
  it('reads the code from the raw request body, which the plugin drops from adapter data', () => {
    // The ecommerce plugin's initiatePayment endpoint forwards only a fixed
    // set of fields to the adapter — `couponCode` from additionalData is not
    // among them. This is the exact shape that produced full-price orders.
    const req = reqWithBody({ cartID: 1, customerEmail: 'a@b.rs', couponCode: 'patta10' })
    const adapterData = { cart: {}, currency: 'RSD', customerEmail: 'a@b.rs' }

    expect(couponCodeFromRequest(req, adapterData)).toBe('PATTA10')
  })

  it('falls back to the adapter data when the body has no code', () => {
    expect(couponCodeFromRequest(reqWithBody({}), { couponCode: ' sale20 ' })).toBe('SALE20')
  })

  it('prefers the body over the adapter data', () => {
    expect(couponCodeFromRequest(reqWithBody({ couponCode: 'BODY' }), { couponCode: 'DATA' })).toBe(
      'BODY',
    )
  })

  it('returns undefined when no code was sent', () => {
    expect(couponCodeFromRequest(reqWithBody(undefined), {})).toBeUndefined()
    expect(couponCodeFromRequest(reqWithBody({ couponCode: '   ' }), undefined)).toBeUndefined()
    expect(couponCodeFromRequest(reqWithBody({ couponCode: 42 }), undefined)).toBeUndefined()
  })
})

describe('orderPricingFromTransaction', () => {
  it('copies the full coupon snapshot from a discounted transaction', () => {
    expect(
      orderPricingFromTransaction({
        amount: 9500,
        currency: 'RSD',
        coupon: 7,
        couponCode: 'PATTA10',
        couponDiscountPercent: 10,
        couponDiscountAmount: 1000,
        couponMinimumSubtotal: 0,
        subtotalBeforeDiscount: 10000,
        subtotalAfterDiscount: 9000,
        shippingAmount: 500,
      }),
    ).toEqual({
      amount: 9500,
      currency: 'RSD',
      coupon: 7,
      couponCode: 'PATTA10',
      couponDiscountPercent: 10,
      couponDiscountAmount: 1000,
      couponMinimumSubtotal: 0,
      subtotalBeforeDiscount: 10000,
      subtotalAfterDiscount: 9000,
      shippingAmount: 500,
    })
  })

  it('unwraps a populated coupon relationship to its id', () => {
    const data = orderPricingFromTransaction({
      amount: 1,
      currency: 'RSD',
      coupon: { id: 7, code: 'X' },
      couponCode: 'X',
    })

    expect(data.coupon).toBe(7)
  })

  it('omits coupon fields entirely for a transaction without a coupon', () => {
    expect(
      orderPricingFromTransaction({
        amount: 10500,
        currency: 'RSD',
        coupon: null,
        couponCode: null,
        couponDiscountPercent: null,
        subtotalBeforeDiscount: 10000,
        subtotalAfterDiscount: 10000,
        shippingAmount: 500,
      }),
    ).toEqual({
      amount: 10500,
      currency: 'RSD',
      subtotalBeforeDiscount: 10000,
      subtotalAfterDiscount: 10000,
      shippingAmount: 500,
    })
  })
})
