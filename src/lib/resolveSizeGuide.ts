import type { Category, Product, SizeGuide } from '@/payload-types'
import type { Payload } from 'payload'

const DEFAULT_SIZES = [
  { size: 'S', length: 66, width: 53 },
  { size: 'M', length: 70, width: 58 },
  { size: 'L', length: 72, width: 60 },
  { size: 'XL', length: 73, width: 62 },
  { size: 'XXL', length: 75, width: 66 },
]

export type SizeGuideRow = { size: string; length: number; width: number }

export type ResolvedSizeGuide = {
  title: string
  rows: SizeGuideRow[]
}

export async function resolveSizeGuideForProduct(
  payload: Payload,
  product: Product,
): Promise<ResolvedSizeGuide> {
  const categories = product.categories?.filter(
    (cat): cat is Category => typeof cat === 'object',
  )

  const categoryIds = categories?.map((c) => c.id) ?? []

  if (categoryIds.length > 0) {
    const brandGuide = await payload.find({
      collection: 'size-guides',
      where: {
        categories: { in: categoryIds },
      },
      limit: 1,
      depth: 0,
    })

    if (brandGuide.docs?.[0]) {
      const guide = brandGuide.docs[0] as SizeGuide
      if (guide.rows?.length) {
        return {
          title: guide.title,
          rows: guide.rows.map((r) => ({
            size: r.size ?? '',
            length: r.length ?? 0,
            width: r.width ?? 0,
          })),
        }
      }
    }
  }

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })

  const defaultGuideId =
    siteSettings?.defaultSizeGuide &&
    typeof siteSettings.defaultSizeGuide === 'object'
      ? siteSettings.defaultSizeGuide.id
      : siteSettings?.defaultSizeGuide

  if (defaultGuideId) {
    const defaultGuide = await payload.findByID({
      collection: 'size-guides',
      id: defaultGuideId,
      depth: 0,
    })

    if (defaultGuide?.rows?.length) {
      return {
        title: defaultGuide.title,
        rows: defaultGuide.rows.map((r) => ({
          size: r.size ?? '',
          length: r.length ?? 0,
          width: r.width ?? 0,
        })),
      }
    }
  }

  return {
    title: 'Vodič za veličine',
    rows: DEFAULT_SIZES,
  }
}
