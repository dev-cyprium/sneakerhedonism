import { TicketPercent } from 'lucide-react'
import React from 'react'

import type { Order } from '@/payload-types'

import { Price } from '@/components/Price'
import { cn } from '@/utilities/cn'

type OrderPricing = Pick<
  Order,
  | 'amount'
  | 'currency'
  | 'couponCode'
  | 'couponDiscountPercent'
  | 'couponDiscountAmount'
  | 'subtotalBeforeDiscount'
  | 'shippingAmount'
>

export const orderHasCoupon = (order: Partial<OrderPricing>): boolean =>
  Boolean(order.couponCode) && typeof order.couponDiscountAmount === 'number'

/** Small green pill: "PATTA10 · −10%". Used wherever an order is listed. */
export const OrderCouponBadge: React.FC<{
  className?: string
  order: Partial<OrderPricing>
}> = ({ className, order }) => {
  if (!orderHasCoupon(order)) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-success bg-success/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-foreground',
        className,
      )}
    >
      <TicketPercent aria-hidden className="size-3.5" />
      {order.couponCode}
      {typeof order.couponDiscountPercent === 'number' && (
        <span className="font-normal">· −{order.couponDiscountPercent}%</span>
      )}
    </span>
  )
}

const Row: React.FC<{
  children: React.ReactNode
  className?: string
  label: React.ReactNode
}> = ({ children, className, label }) => (
  <div className={cn('flex items-center justify-between gap-4 text-sm', className)}>
    <span className="text-muted-foreground">{label}</span>
    <span>{children}</span>
  </div>
)

/**
 * Subtotal → coupon → shipping → total. For orders placed before pricing was
 * stored on the order, only the total is known, so only the total is shown.
 */
export const OrderTotals: React.FC<{ className?: string; order: OrderPricing }> = ({
  className,
  order,
}) => {
  const currency = order.currency ?? undefined
  const hasCoupon = orderHasCoupon(order)
  const hasBreakdown =
    typeof order.subtotalBeforeDiscount === 'number' &&
    (hasCoupon || typeof order.shippingAmount === 'number')

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {hasBreakdown && (
        <Row label="Međuzbir">
          <Price as="span" amount={order.subtotalBeforeDiscount as number} currencyCode={currency} />
        </Row>
      )}

      {hasCoupon && (
        <Row label={<OrderCouponBadge order={order} />}>
          −
          <Price
            as="span"
            amount={order.couponDiscountAmount as number}
            className="font-semibold"
            currencyCode={currency}
          />
        </Row>
      )}

      {hasBreakdown && typeof order.shippingAmount === 'number' && (
        <Row label="Dostava">
          {order.shippingAmount === 0 ? (
            'Besplatna'
          ) : (
            <Price as="span" amount={order.shippingAmount} currencyCode={currency} />
          )}
        </Row>
      )}

      <Row className="border-t border-border pt-2 text-base font-semibold" label="Ukupno">
        <Price as="span" amount={order.amount ?? 0} className="text-lg" currencyCode={currency} />
      </Row>
    </div>
  )
}
