import type { Payload } from 'payload'

/**
 * Recomputes and persists `effectivePrice` for a given product.
 *
 * Logic: use the minimum effective variant price (salePriceInRSD ?? priceInRSD)
 * if variants exist; otherwise fall back to the product's own salePriceInRSD ?? priceInRSD.
 */
export async function updateEffectivePrice(
  payload: Payload,
  productId: number,
): Promise<void> {
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
    select: { priceInRSD: true, salePriceInRSD: true },
    overrideAccess: true,
  })

  const variants = await payload.find({
    collection: 'variants',
    where: { product: { equals: productId } },
    select: { priceInRSD: true, salePriceInRSD: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  let effectivePrice: number | null = null

  if (variants.docs.length > 0) {
    const variantPrices = variants.docs
      .map((v) =>
        v.salePriceInRSD != null && v.salePriceInRSD > 0
          ? v.salePriceInRSD
          : (v.priceInRSD ?? null),
      )
      .filter((p): p is number => p != null && p > 0)

    if (variantPrices.length > 0) {
      effectivePrice = Math.min(...variantPrices)
    }
  }

  if (effectivePrice == null) {
    effectivePrice =
      product.salePriceInRSD != null && product.salePriceInRSD > 0
        ? product.salePriceInRSD
        : (product.priceInRSD ?? null)
  }

  await payload.update({
    collection: 'products',
    id: productId,
    data: { effectivePrice: effectivePrice ?? 0 },
    overrideAccess: true,
    select: {},
  })
}
