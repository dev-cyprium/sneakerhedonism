export const FREE_SHIPPING_THRESHOLD_RSD = 10000
export const STANDARD_SHIPPING_FEE_RSD = 500

export type ShippingSummary = {
  subtotalAmount: number
  shippingAmount: number
  totalAmount: number
  hasFreeShipping: boolean
  remainingForFreeShipping: number
  progressToFreeShipping: number
}

/**
 * Serbian shipping rules:
 * - subtotal < 10,000 RSD -> 500 RSD shipping
 * - subtotal >= 10,000 RSD -> free shipping
 */
export function getShippingSummary(subtotalAmount: number): ShippingSummary {
  const safeSubtotal = Number.isFinite(subtotalAmount) && subtotalAmount > 0 ? subtotalAmount : 0
  const hasFreeShipping = safeSubtotal >= FREE_SHIPPING_THRESHOLD_RSD
  const shippingAmount = hasFreeShipping ? 0 : STANDARD_SHIPPING_FEE_RSD
  const remainingForFreeShipping = hasFreeShipping
    ? 0
    : Math.max(FREE_SHIPPING_THRESHOLD_RSD - safeSubtotal, 0)
  const progressToFreeShipping = Math.min(
    100,
    Math.round((Math.min(safeSubtotal, FREE_SHIPPING_THRESHOLD_RSD) / FREE_SHIPPING_THRESHOLD_RSD) * 100),
  )

  return {
    subtotalAmount: safeSubtotal,
    shippingAmount,
    totalAmount: safeSubtotal + shippingAmount,
    hasFreeShipping,
    remainingForFreeShipping,
    progressToFreeShipping,
  }
}
