/**
 * Backfill script: recompute `effectivePrice` for all products and write it
 * directly to the products table (the row storefront `draft: false` queries
 * sort on). Mirrors src/collections/Products/updateEffectivePrice.ts.
 *
 * Needed once because the old hook saved the value with `draft: true`, which
 * only created draft versions and never updated the published row.
 *
 * Run: pnpm exec tsx scripts/backfill-effective-price.mts
 * (Ensure .env has PAYLOAD_SECRET and DATABASE_URL.)
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

async function main() {
  const payload = await getPayload({ config })

  const { docs: products } = await payload.find({
    collection: 'products',
    draft: false,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    select: { title: true, priceInRSD: true, salePriceInRSD: true, effectivePrice: true },
  })

  const { docs: variants } = await payload.find({
    collection: 'variants',
    depth: 0,
    pagination: false,
    overrideAccess: true,
    select: { product: true, priceInRSD: true, salePriceInRSD: true },
  })

  const variantsByProduct = new Map<number, { priceInRSD?: number | null; salePriceInRSD?: number | null }[]>()
  for (const v of variants) {
    const pid = typeof v.product === 'number' ? v.product : v.product?.id
    if (typeof pid !== 'number') continue
    const list = variantsByProduct.get(pid) ?? []
    list.push(v)
    variantsByProduct.set(pid, list)
  }

  let updated = 0
  for (const p of products) {
    const productVariants = variantsByProduct.get(p.id) ?? []

    let effectivePrice: number | null = null
    if (productVariants.length > 0) {
      const variantPrices = productVariants
        .map((v) =>
          v.salePriceInRSD != null && v.salePriceInRSD > 0
            ? v.salePriceInRSD
            : (v.priceInRSD ?? null),
        )
        .filter((price): price is number => price != null && price > 0)
      if (variantPrices.length > 0) {
        effectivePrice = Math.min(...variantPrices)
      }
    }
    if (effectivePrice == null) {
      effectivePrice =
        p.salePriceInRSD != null && p.salePriceInRSD > 0
          ? p.salePriceInRSD
          : (p.priceInRSD ?? null)
    }

    const next = effectivePrice ?? 0
    if (p.effectivePrice === next) continue

    await payload.db.updateOne({
      collection: 'products',
      id: p.id,
      data: { effectivePrice: next },
    })
    updated += 1
    console.log(`Updated #${p.id} "${p.title}": ${p.effectivePrice ?? 'null'} -> ${next}`)
  }

  console.log(`Done. ${updated}/${products.length} products updated.`)
  await payload.db.destroy()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
