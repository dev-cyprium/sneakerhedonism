import type { CollectionSlug, Payload, PayloadRequest } from 'payload'

import { getShippingSummary } from '@/lib/shipping'

type ProductOrVariantRef = {
  id: number | string
}

export type CheckoutCartItem = {
  product?: number | string | ProductOrVariantRef | null
  variant?: number | string | ProductOrVariantRef | null
  quantity?: number | null
}

export type FlattenedCheckoutItem = {
  product: number
  quantity: number
  variant?: number
}

export type CouponSnapshot = {
  id: number
  code: string
  discountPercent: number
  minimumSubtotal: number
  usageLimit: number | null
  unlimitedUsage: boolean
  expiresAt: string | null
}

export type CheckoutPricingResult = {
  subtotalAmount: number
  discountAmount: number
  discountedSubtotalAmount: number
  shippingAmount: number
  totalAmount: number
  hasFreeShipping: boolean
  remainingForFreeShipping: number
  progressToFreeShipping: number
  coupon: CouponSnapshot | null
  flattenedItems: FlattenedCheckoutItem[]
}

export type ResolveCheckoutPricingArgs = {
  cartItems: CheckoutCartItem[]
  couponCode?: null | string
  couponsSlug?: CollectionSlug
  currency: string
  ordersSlug?: CollectionSlug
  payload: Payload
  productsSlug?: CollectionSlug
  req?: PayloadRequest
  user?: { id: number | string } | null
  variantsSlug?: CollectionSlug
}

const DEFAULT_COUPONS_SLUG = 'coupons' as CollectionSlug
const DEFAULT_ORDERS_SLUG = 'orders' as CollectionSlug
const DEFAULT_PRODUCTS_SLUG = 'products' as CollectionSlug
const DEFAULT_VARIANTS_SLUG = 'variants' as CollectionSlug

function toID(value: CheckoutCartItem['product']): null | number {
  if (value == null) return null

  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (typeof value === 'object' && 'id' in value && value.id != null) {
    if (typeof value.id === 'number') return value.id
    if (typeof value.id === 'string') {
      const parsed = Number(value.id)
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

function sanitizeQuantity(quantity: CheckoutCartItem['quantity']): number {
  if (typeof quantity !== 'number' || !Number.isFinite(quantity)) return 1
  if (quantity <= 0) return 1
  return Math.floor(quantity)
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return 0
}

export function normalizeCouponCode(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().toUpperCase()
}

async function countCouponUsage({
  couponID,
  ordersSlug,
  payload,
  req,
}: {
  couponID: number
  ordersSlug: CollectionSlug
  payload: Payload
  req?: PayloadRequest
}): Promise<number> {
  const result = await payload.find({
    collection: ordersSlug,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      coupon: {
        equals: couponID,
      },
    },
  })

  return safeNumber(result.totalDocs)
}

export async function resolveCheckoutPricing({
  cartItems,
  couponCode,
  couponsSlug = DEFAULT_COUPONS_SLUG,
  currency,
  ordersSlug = DEFAULT_ORDERS_SLUG,
  payload,
  productsSlug = DEFAULT_PRODUCTS_SLUG,
  req,
  user,
  variantsSlug = DEFAULT_VARIANTS_SLUG,
}: ResolveCheckoutPricingArgs): Promise<CheckoutPricingResult> {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart is empty or not provided.')
  }

  const priceField = `priceIn${currency.toUpperCase()}`
  const saleField = `salePriceIn${currency.toUpperCase()}`
  const documentCache = new Map<string, Record<string, unknown>>()

  const getDocument = async ({
    collection,
    id,
  }: {
    collection: CollectionSlug
    id: number
  }): Promise<Record<string, unknown>> => {
    const cacheKey = `${collection}:${id}`
    const cached = documentCache.get(cacheKey)
    if (cached) return cached

    const doc = (await payload.findByID({
      id,
      collection,
      depth: 0,
      overrideAccess: true,
      req,
      select: {
        [priceField]: true,
        [saleField]: true,
      },
    })) as unknown as Record<string, unknown>

    documentCache.set(cacheKey, doc)

    return doc
  }

  let subtotalAmount = 0
  const flattenedItems: FlattenedCheckoutItem[] = []

  for (const item of cartItems) {
    const productID = toID(item.product)
    if (productID == null) continue

    const quantity = sanitizeQuantity(item.quantity)
    const variantID = toID(item.variant)

    const productDoc = await getDocument({
      collection: productsSlug,
      id: productID,
    })

    let unitPrice = 0

    if (variantID != null) {
      const variantDoc = await getDocument({
        collection: variantsSlug,
        id: variantID,
      })

      unitPrice =
        safeNumber(variantDoc[saleField]) ||
        safeNumber(productDoc[saleField]) ||
        safeNumber(variantDoc[priceField]) ||
        safeNumber(productDoc[priceField]) ||
        0
    } else {
      unitPrice = safeNumber(productDoc[saleField]) || safeNumber(productDoc[priceField]) || 0
    }

    subtotalAmount += unitPrice * quantity
    flattenedItems.push({
      product: productID,
      quantity,
      ...(variantID != null ? { variant: variantID } : {}),
    })
  }

  const shippingSummary = getShippingSummary(subtotalAmount)

  const normalizedCode = normalizeCouponCode(couponCode)
  let discountAmount = 0
  let couponSnapshot: CheckoutPricingResult['coupon'] = null

  if (normalizedCode) {
    const couponResult = await payload.find({
      collection: couponsSlug,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
      select: {
        id: true,
        code: true,
        active: true,
        discountPercent: true,
        minimumSubtotal: true,
        usageLimit: true,
        unlimitedUsage: true,
        expiresAt: true,
      },
      where: {
        and: [
          {
            code: {
              equals: normalizedCode,
            },
          },
          {
            active: {
              equals: true,
            },
          },
        ],
      },
    })

    const couponDoc = couponResult.docs[0] as unknown as Record<string, unknown> | undefined

    if (!couponDoc || couponDoc.id == null) {
      throw new Error('Coupon code is invalid or inactive.')
    }

    const expiresAt =
      typeof couponDoc.expiresAt === 'string' && couponDoc.expiresAt ? couponDoc.expiresAt : null
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      throw new Error('Coupon has expired.')
    }

    const minimumSubtotal = safeNumber(couponDoc.minimumSubtotal)
    if (subtotalAmount < minimumSubtotal) {
      throw new Error('Coupon minimum subtotal has not been reached.')
    }

    const unlimitedUsage = Boolean(couponDoc.unlimitedUsage)
    if (!user && unlimitedUsage) {
      throw new Error('Guests cannot redeem this coupon.')
    }

    const usageLimitRaw = couponDoc.usageLimit
    const usageLimit =
      typeof usageLimitRaw === 'number' && Number.isFinite(usageLimitRaw) ? usageLimitRaw : null

    if (!unlimitedUsage) {
      if (usageLimit == null || usageLimit < 1) {
        throw new Error('Coupon usage limit is not configured correctly.')
      }

      const usageCount = await countCouponUsage({
        couponID: couponDoc.id as number,
        ordersSlug,
        payload,
        req,
      })

      if (usageCount >= usageLimit) {
        throw new Error('Coupon usage limit has been reached.')
      }
    }

    const discountPercent = safeNumber(couponDoc.discountPercent)
    if (discountPercent <= 0 || discountPercent > 100) {
      throw new Error('Coupon discount value is invalid.')
    }

    discountAmount = Math.round((subtotalAmount * discountPercent) / 100)
    discountAmount = Math.min(discountAmount, subtotalAmount)

    couponSnapshot = {
      id: couponDoc.id as number,
      code: normalizedCode,
      discountPercent,
      minimumSubtotal,
      usageLimit,
      unlimitedUsage,
      expiresAt,
    }
  }

  const discountedSubtotalAmount = Math.max(subtotalAmount - discountAmount, 0)
  const totalAmount = discountedSubtotalAmount + shippingSummary.shippingAmount

  return {
    subtotalAmount,
    discountAmount,
    discountedSubtotalAmount,
    shippingAmount: shippingSummary.shippingAmount,
    totalAmount,
    hasFreeShipping: shippingSummary.hasFreeShipping,
    remainingForFreeShipping: shippingSummary.remainingForFreeShipping,
    progressToFreeShipping: shippingSummary.progressToFreeShipping,
    coupon: couponSnapshot,
    flattenedItems,
  }
}
