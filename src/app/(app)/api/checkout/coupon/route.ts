import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { CheckoutCartItem, resolveCheckoutPricing } from '@/lib/checkoutPricing'

type CouponPreviewBody = {
  couponCode?: string
  currency?: string
  items?: unknown[]
}

function normalizeCartItems(items: unknown[]): CheckoutCartItem[] {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const raw = item as Record<string, unknown>
      const product =
        typeof raw.product === 'number' || typeof raw.product === 'string' ? raw.product : null
      const variant =
        typeof raw.variant === 'number' || typeof raw.variant === 'string' ? raw.variant : null
      const quantity = typeof raw.quantity === 'number' ? raw.quantity : 1

      return {
        product,
        variant,
        quantity,
      }
    })
    .filter((item) => item.product != null)
}

export async function POST(request: Request) {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  let body: CouponPreviewBody
  try {
    body = (await request.json()) as CouponPreviewBody
  } catch {
    return NextResponse.json({ message: 'Invalid request body.', valid: false }, { status: 400 })
  }

  const couponCode = typeof body.couponCode === 'string' ? body.couponCode : ''
  if (!couponCode.trim()) {
    return NextResponse.json({ message: 'Coupon code is required.', valid: false }, { status: 400 })
  }

  const items = normalizeCartItems(Array.isArray(body.items) ? body.items : [])
  if (items.length === 0) {
    return NextResponse.json({ message: 'Cart items are required.', valid: false }, { status: 400 })
  }

  const currency =
    typeof body.currency === 'string' && body.currency.trim()
      ? body.currency.trim().toUpperCase()
      : 'RSD'

  try {
    const pricing = await resolveCheckoutPricing({
      cartItems: items,
      couponCode,
      currency,
      payload,
      user: user ?? null,
    })

    return NextResponse.json({
      valid: true,
      coupon: pricing.coupon,
      pricing,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Coupon could not be applied.',
        valid: false,
      },
      { status: 400 },
    )
  }
}
