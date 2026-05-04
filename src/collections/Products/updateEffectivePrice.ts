import type { PayloadRequest } from 'payload'

const STEP_TIMEOUT_MS = 5_000

const withTimeout = <T>(p: Promise<T>, label: string): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`updateEffectivePrice: "${label}" exceeded ${STEP_TIMEOUT_MS}ms`)),
        STEP_TIMEOUT_MS,
      ),
    ),
  ])

/**
 * Recomputes and persists `effectivePrice` for a given product.
 *
 * Logic: use the minimum effective variant price (salePriceInRSD ?? priceInRSD)
 * if variants exist; otherwise fall back to the product's own salePriceInRSD ?? priceInRSD.
 *
 * Each DB step has a hard timeout — if a step exceeds it, the error is logged
 * and swallowed so the parent save is never blocked indefinitely.
 */
export async function updateEffectivePrice(
  req: PayloadRequest,
  productId: number,
): Promise<void> {
  const { payload } = req
  const start = Date.now()
  const tag = `[updateEffectivePrice product=${productId}]`
  payload.logger.info(`${tag} start`)

  try {
    const product = await withTimeout(
      payload.findByID({
        collection: 'products',
        id: productId,
        depth: 0,
        select: { priceInRSD: true, salePriceInRSD: true },
        overrideAccess: true,
        req,
      }),
      'findByID(product)',
    )
    payload.logger.info(`${tag} fetched product (+${Date.now() - start}ms)`)

    const variants = await withTimeout(
      payload.find({
        collection: 'variants',
        where: { product: { equals: productId } },
        select: { priceInRSD: true, salePriceInRSD: true },
        pagination: false,
        depth: 0,
        overrideAccess: true,
        req,
      }),
      'find(variants)',
    )
    payload.logger.info(`${tag} fetched ${variants.docs.length} variants (+${Date.now() - start}ms)`)

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

    await withTimeout(
      payload.update({
        collection: 'products',
        id: productId,
        data: { effectivePrice: effectivePrice ?? 0 },
        overrideAccess: true,
        context: { skipUpdateEffectivePrice: true },
        select: {},
        req,
      }),
      'update(product.effectivePrice)',
    )
    payload.logger.info(
      `${tag} done effectivePrice=${effectivePrice} total=${Date.now() - start}ms`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error(`${tag} FAILED after ${Date.now() - start}ms: ${message}`)
    // Swallow: never block the parent save. The next save will retry.
  }
}
