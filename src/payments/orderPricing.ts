import type { PayloadRequest } from 'payload'

import { normalizeCouponCode } from '@/lib/checkoutPricing'

/**
 * The coupon code the shopper applied at checkout.
 *
 * The ecommerce plugin's `initiatePayment` endpoint hands adapters a `data`
 * object built from a fixed whitelist (cart, currency, addresses, email) —
 * anything else sent in `additionalData`, including `couponCode`, is dropped
 * on the floor. The raw request body is still on `req.data`, so read it from
 * there first and only fall back to `data` for callers that pass it directly.
 */
export function couponCodeFromRequest(req: PayloadRequest, data?: unknown): string | undefined {
  const fromBody = (req.data as Record<string, unknown> | undefined)?.couponCode
  const fromData = (data as Record<string, unknown> | undefined)?.couponCode

  const code = normalizeCouponCode(fromBody ?? fromData)
  return code || undefined
}

/**
 * The pricing snapshot every order carries, copied verbatim from the
 * transaction that paid for it. Kept in one place so the COD adapter, the ECC
 * adapter and the ECC bank callback can't disagree about which fields make an
 * order "coupon-based".
 */
export function orderPricingFromTransaction(txn: Record<string, any>): Record<string, unknown> {
  const couponID = txn.coupon && typeof txn.coupon === 'object' ? txn.coupon.id : txn.coupon

  const numberFields = [
    'couponDiscountPercent',
    'couponDiscountAmount',
    'couponMinimumSubtotal',
    'subtotalBeforeDiscount',
    'subtotalAfterDiscount',
    'shippingAmount',
  ] as const

  return {
    amount: txn.amount,
    currency: txn.currency,
    ...(couponID ? { coupon: couponID } : {}),
    ...(txn.couponCode ? { couponCode: txn.couponCode } : {}),
    ...Object.fromEntries(
      numberFields
        .filter((field) => typeof txn[field] === 'number')
        .map((field) => [field, txn[field]]),
    ),
  }
}
