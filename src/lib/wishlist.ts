import type { Product, Variant } from '@/payload-types'

/**
 * Shared wishlist types and utilities.
 * Product/Variant IDs are `number` per Payload schema.
 */
export type WishlistItem = {
  productId: number
  variantId?: number
}

export type WishlistItemWithProduct = {
  productId: number
  variantId?: number
  product: Product
  variant?: Variant | null
}
