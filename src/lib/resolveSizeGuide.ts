import type { Category, Product, SizeGuide } from '@/payload-types'
import type { Payload } from 'payload'

const DEFAULT_CLOTHES_ROWS = [
  { size: 'S', length: 66, width: 53 },
  { size: 'M', length: 70, width: 58 },
  { size: 'L', length: 72, width: 60 },
  { size: 'XL', length: 73, width: 62 },
  { size: 'XXL', length: 75, width: 66 },
]

export type SizeGuideRowClothes = { size: string; length: number; width: number }
export type SizeGuideRowFootwear = { eu: number; us: number; cm: number }

export type ResolvedSizeGuide =
  | { title: string; rowType: 'clothes'; rows: SizeGuideRowClothes[] }
  | { title: string; rowType: 'footwear'; rows: SizeGuideRowFootwear[] }

export async function resolveSizeGuideForProduct(
  payload: Payload,
  product: Product,
): Promise<ResolvedSizeGuide> {
  const categories = product.categories?.filter((cat): cat is Category => typeof cat === 'object')

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
      const resolved = resolveGuideToResolved(guide)
      if (resolved) return resolved
    }
  }

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })

  const defaultSizeGuide = siteSettings?.defaultSizeGuide
  const defaultGuideId =
    defaultSizeGuide &&
    (typeof defaultSizeGuide === 'object' ? defaultSizeGuide.id : defaultSizeGuide)

  if (defaultGuideId != null && typeof defaultGuideId !== 'object') {
    const defaultGuide = await payload.findByID({
      collection: 'size-guides',
      id: defaultGuideId,
      depth: 0,
    })

    if (defaultGuide) {
      const resolved = resolveGuideToResolved(defaultGuide as SizeGuide)
      if (resolved) return resolved
    }
  }

  return {
    title: 'Vodič za veličine',
    rowType: 'clothes',
    rows: DEFAULT_CLOTHES_ROWS,
  }
}

/** Legacy rows shape (pre-migration) */
type LegacyRows = { size?: string; length?: number; width?: number }[]

function resolveGuideToResolved(
  guide: SizeGuide & { rows?: LegacyRows },
): ResolvedSizeGuide | null {
  if (guide.rowType === 'footwear' && guide.footwearRows?.length) {
    return {
      title: guide.title,
      rowType: 'footwear',
      rows: guide.footwearRows.map((r) => ({
        eu: r.eu ?? 0,
        us: r.us ?? 0,
        cm: r.cm ?? 0,
      })),
    }
  }
  if (guide.clothesRows?.length) {
    return {
      title: guide.title,
      rowType: 'clothes',
      rows: guide.clothesRows.map((r) => ({
        size: r.size ?? '',
        length: r.length ?? 0,
        width: r.width ?? 0,
      })),
    }
  }
  // Legacy: migrate from old `rows` to clothes format
  const legacyRows = guide.rows
  if (Array.isArray(legacyRows) && legacyRows.length > 0) {
    return {
      title: guide.title,
      rowType: 'clothes',
      rows: legacyRows.map((r) => ({
        size: r.size ?? '',
        length: r.length ?? 0,
        width: r.width ?? 0,
      })),
    }
  }
  return null
}
