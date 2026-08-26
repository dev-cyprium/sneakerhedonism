import type { Payload } from 'payload'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export type ShopVariantOption = {
  id: number
  label: string
}

export type ShopVariantType = {
  id: number
  label: string
  name: string
  options: ShopVariantOption[]
}

export type ShopVariantSelection = {
  optionIds: number[]
  typeId: number
  typeName: string
}

type SearchParams = { [key: string]: string | string[] | undefined }

const toArray = (value: string | string[] | undefined): string[] =>
  value == null ? [] : Array.isArray(value) ? value : [value]

const toProductId = (product: unknown): number | null => {
  if (typeof product === 'number') return product
  if (product && typeof product === 'object' && 'id' in product) {
    const { id } = product as { id?: unknown }
    if (typeof id === 'number') return id
  }
  return null
}

/**
 * Reads the selected option ids for each variant group off the query string.
 *
 * A group's param may repeat (`?broj=41&broj=42`) or hold a comma-separated
 * list; both are accepted so links shared before multi-select existed still
 * resolve. Ids that don't belong to the group are dropped — a stale id from an
 * old link must not silently widen the filter.
 */
export function parseVariantSelections(
  params: SearchParams,
  variantTypes: ShopVariantType[],
): ShopVariantSelection[] {
  const selections: ShopVariantSelection[] = []

  for (const variantType of variantTypes) {
    const requested = new Set(
      toArray(params[variantType.name])
        .flatMap((value) => value.split(','))
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    )

    const optionIds = variantType.options
      .map((option) => option.id)
      .filter((optionId) => requested.has(optionId))

    if (optionIds.length > 0) {
      selections.push({ optionIds, typeId: variantType.id, typeName: variantType.name })
    }
  }

  return selections
}

/**
 * Product ids matching the selected sizes, or `null` when nothing is selected.
 *
 * Options inside one group are ORed: picking 41 and 42 means "either", so a
 * shopper unsure of their size sees both. Separate groups are intersected at
 * the *product* level rather than the variant level — a variant only ever
 * carries options from a single group, so demanding that one variant match
 * every group could only ever return nothing, which is why choosing a shoe
 * number together with a clothing size came back empty.
 */
export async function resolveVariantProductIds(
  payload: Payload,
  selections: ShopVariantSelection[],
): Promise<null | number[]> {
  if (selections.length === 0) return null

  const perGroup = await Promise.all(
    selections.map(async (selection) => {
      const variants = await payload.find({
        collection: 'variants',
        depth: 0,
        pagination: false,
        select: { product: true },
        where: {
          and: [{ options: { in: selection.optionIds } }, { product: { exists: true } }],
        },
      })

      return new Set(
        variants.docs
          .map((variant) => toProductId(variant.product))
          .filter((id): id is number => id !== null),
      )
    }),
  )

  const intersection = perGroup.reduce((acc, group) => {
    if (acc === null) return group
    return new Set([...acc].filter((id) => group.has(id)))
  }, null as null | Set<number>)

  return [...(intersection ?? new Set<number>())]
}

/**
 * Which variant groups can be combined, as a map of group id to the ids it
 * coexists with.
 *
 * Two groups are compatible when at least one product carries variants from
 * both. Groups that never coexist — shoe numbers and clothing sizes, in
 * practice — are mutually exclusive, and the filter UI clears one when the
 * other is picked instead of leaving the shopper on an empty grid.
 *
 * Derived from the data rather than hardcoded, so adding a group that genuinely
 * combines with sizes (a colour, say) keeps working without a code change.
 */
async function computeVariantTypeCompatibility(): Promise<Record<number, number[]>> {
  const payload = await getPayload({ config: configPromise })

  const [variantTypesResult, variantsResult] = await Promise.all([
    payload.find({ collection: 'variantTypes', depth: 1, pagination: false }),
    payload.find({
      collection: 'variants',
      depth: 0,
      pagination: false,
      select: { options: true, product: true },
      where: { product: { exists: true } },
    }),
  ])

  const typeIdByOptionId = new Map<number, number>()
  for (const variantType of variantTypesResult.docs) {
    for (const option of variantType.options?.docs ?? []) {
      if (option && typeof option === 'object') {
        typeIdByOptionId.set(option.id, variantType.id)
      }
    }
  }

  const typeIdsByProduct = new Map<number, Set<number>>()
  for (const variant of variantsResult.docs) {
    const productId = toProductId(variant.product)
    if (productId === null) continue

    for (const option of variant.options ?? []) {
      const optionId = typeof option === 'number' ? option : option?.id
      const typeId = typeof optionId === 'number' ? typeIdByOptionId.get(optionId) : undefined
      if (typeId === undefined) continue

      const seen = typeIdsByProduct.get(productId) ?? new Set<number>()
      seen.add(typeId)
      typeIdsByProduct.set(productId, seen)
    }
  }

  const compatible = new Map<number, Set<number>>()
  for (const typeIds of typeIdsByProduct.values()) {
    if (typeIds.size < 2) continue

    for (const typeId of typeIds) {
      const partners = compatible.get(typeId) ?? new Set<number>()
      for (const other of typeIds) {
        if (other !== typeId) partners.add(other)
      }
      compatible.set(typeId, partners)
    }
  }

  return Object.fromEntries(
    [...compatible.entries()].map(([typeId, partners]) => [typeId, [...partners]]),
  )
}

/**
 * Cached because it scans every variant and the answer changes only when the
 * catalogue's variant structure does, which is far rarer than a shop page view.
 */
export const getVariantTypeCompatibility = unstable_cache(
  computeVariantTypeCompatibility,
  ['variant-type-compatibility'],
  { revalidate: 300 },
)
