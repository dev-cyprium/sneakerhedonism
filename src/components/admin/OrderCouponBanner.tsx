'use client'

import { useFormFields } from '@payloadcms/ui'
import React from 'react'

import { formatRSD } from '@/lib/formatRSD'

const numberOrNull = (value: unknown): null | number =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

/**
 * Sits at the top of an order in the admin so nobody has to dig through the
 * sidebar to learn that the order was discounted. Renders nothing for orders
 * without a coupon.
 */
export const OrderCouponBanner: React.FC = () => {
  const pricing = useFormFields(([fields]) => ({
    amount: numberOrNull(fields.amount?.value),
    couponCode: typeof fields.couponCode?.value === 'string' ? fields.couponCode.value : '',
    couponDiscountAmount: numberOrNull(fields.couponDiscountAmount?.value),
    couponDiscountPercent: numberOrNull(fields.couponDiscountPercent?.value),
    shippingAmount: numberOrNull(fields.shippingAmount?.value),
    subtotalBeforeDiscount: numberOrNull(fields.subtotalBeforeDiscount?.value),
  }))

  if (!pricing.couponCode) return null

  const percent =
    pricing.couponDiscountPercent != null ? ` (−${pricing.couponDiscountPercent}%)` : ''

  return (
    <div
      style={{
        alignItems: 'center',
        background: 'var(--theme-success-100)',
        border: '1px solid var(--theme-success-400)',
        borderLeft: '4px solid var(--theme-success-500)',
        borderRadius: 'var(--style-radius-s)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 24px',
        marginBottom: 'var(--base)',
        padding: '12px 16px',
      }}
    >
      <strong style={{ color: 'var(--theme-success-800)', fontSize: '15px' }}>
        Kupon primenjen: <code>{pricing.couponCode}</code>
        {percent}
      </strong>

      <span style={{ color: 'var(--theme-elevation-800)', fontSize: '13px' }}>
        {pricing.subtotalBeforeDiscount != null && (
          <>Međuzbir {formatRSD(pricing.subtotalBeforeDiscount)} · </>
        )}
        {pricing.couponDiscountAmount != null && (
          <>
            popust <strong>−{formatRSD(pricing.couponDiscountAmount)}</strong> ·{' '}
          </>
        )}
        {pricing.shippingAmount != null && (
          <>dostava {pricing.shippingAmount === 0 ? 'besplatna' : formatRSD(pricing.shippingAmount)} · </>
        )}
        {pricing.amount != null && (
          <>
            ukupno <strong>{formatRSD(pricing.amount)}</strong>
          </>
        )}
      </span>
    </div>
  )
}
