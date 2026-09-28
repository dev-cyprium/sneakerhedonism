import type { Cart, Product, Variant } from '@/payload-types'

export type CartLine = NonNullable<Cart['items']>[number]

/**
 * A cart line the storefront can actually show and charge for: its product is
 * populated and published, and — if it has a variant — so is the variant.
 *
 * Anything else is a ghost: the product was deleted (relation comes back
 * `null`), unpublished (public reads get just the id, never the document), or
 * the variant was removed. Ghosts used to be hidden by the list but still
 * counted by the badge, the subtotal and the checkout, which is how a cart
 * could show one item and a total for two.
 */
export type ResolvedCartLine = CartLine & {
  product: Product
  variant?: Variant | null
}

const isPublished = (doc: { _status?: string | null }): boolean =>
  doc._status == null || doc._status === 'published'

export function isResolvedCartLine(line: CartLine | null | undefined): line is ResolvedCartLine {
  if (!line) return false

  const { product, variant } = line
  if (!product || typeof product !== 'object' || !isPublished(product)) return false

  // A number here means the variant exists but the reader may not see it
  // (unpublished) — treat it like a missing one.
  if (variant != null && (typeof variant !== 'object' || !isPublished(variant))) return false

  return true
}

/** The lines the customer should see and pay for, in cart order. */
export function resolveCartLines(cart: Pick<Cart, 'items'> | null | undefined): ResolvedCartLine[] {
  if (!cart?.items?.length) return []
  return cart.items.filter(isResolvedCartLine)
}

export function countCartQuantity(lines: Pick<CartLine, 'quantity'>[]): number {
  return lines.reduce((total, line) => total + (line.quantity ?? 0), 0)
}
