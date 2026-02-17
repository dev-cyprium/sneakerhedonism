import { FieldLabel } from '@payloadcms/ui'
import type { SelectFieldServerProps } from 'payload'

import './VariantOptionsSelector.scss'
import { VariantOptionsSelectorClient } from './VariantOptionsSelectorClient'

type Props = SelectFieldServerProps

type SelectorOption = {
  label: string
  value: number
}

type SelectorGroup = {
  id: number
  label: string
  options: SelectorOption[]
}

type VariantTypeDoc = {
  id: number
  label?: string | null
  name?: string | null
}

type VariantOptionDoc = {
  id: number
  label?: string | null
  value?: string | null
  variantType?: number | { id: number } | null
}

const naturalSort = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const toID = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const numericValue = Number(value)
    if (Number.isFinite(numericValue)) return numericValue
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number') return id
    if (typeof id === 'string') {
      const numericID = Number(id)
      if (Number.isFinite(numericID)) return numericID
    }
  }

  return null
}

const uniqueOrderedIDs = (values: unknown): number[] => {
  if (!Array.isArray(values)) return []

  const ordered: number[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const id = toID(value)
    if (id === null) continue

    const key = String(id)
    if (seen.has(key)) continue
    seen.add(key)
    ordered.push(id)
  }

  return ordered
}

const sortOptions = (options: SelectorOption[]) =>
  [...options].sort((left, right) => naturalSort.compare(left.label, right.label))

const buildGroups = ({
  variantTypeIDs,
  variantTypes,
  variantOptions,
}: {
  variantTypeIDs: number[]
  variantTypes: VariantTypeDoc[]
  variantOptions: VariantOptionDoc[]
}): SelectorGroup[] => {
  const variantTypeByID = new Map<string, VariantTypeDoc>()

  for (const type of variantTypes) {
    variantTypeByID.set(String(type.id), type)
  }

  const optionsByType = new Map<string, SelectorOption[]>()

  for (const option of variantOptions) {
    const variantTypeID = toID(option.variantType)
    if (variantTypeID === null) continue

    const key = String(variantTypeID)
    const list = optionsByType.get(key) ?? []
    const label = option.label?.trim() || option.value?.trim() || String(option.id)
    list.push({
      label,
      value: option.id,
    })
    optionsByType.set(key, list)
  }

  return variantTypeIDs.map((variantTypeID) => {
    const key = String(variantTypeID)
    const variantType = variantTypeByID.get(key)

    return {
      id: variantTypeID,
      label: variantType?.label || variantType?.name || `Variant group ${key}`,
      options: sortOptions(optionsByType.get(key) ?? []),
    }
  })
}

export const VariantOptionsSelector: React.FC<Props> = async (props) => {
  const { clientField, data, field, path, req, user } = props
  const productsSlug = (field.custom?.productsSlug as string) || 'products'
  const variantTypesSlug = (field.custom?.variantTypesSlug as string) || 'variantTypes'
  const relationField = field as unknown as { relationTo?: string | string[] }
  const variantOptionsSlug =
    typeof relationField.relationTo === 'string' ? relationField.relationTo : 'variantOptions'

  const accessArgs = user
    ? {
        user,
        overrideAccess: false as const,
      }
    : {}

  const productID = toID(data?.product)

  if (productID === null) {
    return (
      <div className="variantOptionsSelector">
        <div className="variantOptionsSelectorHeading">
          <FieldLabel as="span" label={clientField.label} required={clientField.required} />
        </div>
        <p className="variantOptionsSelectorEmpty">Save the variant with a product before selecting options.</p>
      </div>
    )
  }

  const product = await req.payload.findByID({
    id: productID,
    collection: productsSlug as any,
    depth: 0,
    draft: true,
    select: {
      variantTypes: true,
    },
    ...accessArgs,
  })

  const variantTypeIDs = uniqueOrderedIDs((product as { variantTypes?: unknown }).variantTypes)

  if (variantTypeIDs.length === 0) {
    return (
      <div className="variantOptionsSelector">
        <div className="variantOptionsSelectorHeading">
          <FieldLabel as="span" label={clientField.label} required={clientField.required} />
        </div>
        <p className="variantOptionsSelectorEmpty">No variant groups are configured on this product yet.</p>
      </div>
    )
  }

  const [variantTypesResult, variantOptionsResult] = await Promise.all([
    req.payload.find({
      collection: variantTypesSlug as any,
      depth: 0,
      pagination: false,
      where: {
        id: {
          in: variantTypeIDs,
        },
      },
      select: {
        label: true,
        name: true,
      },
      ...accessArgs,
    }),
    req.payload.find({
      collection: variantOptionsSlug as any,
      depth: 0,
      pagination: false,
      where: {
        variantType: {
          in: variantTypeIDs,
        },
      },
      select: {
        label: true,
        value: true,
        variantType: true,
      },
      ...accessArgs,
    }),
  ])

  const groups = buildGroups({
    variantTypeIDs,
    variantTypes: (variantTypesResult.docs ?? []) as VariantTypeDoc[],
    variantOptions: (variantOptionsResult.docs ?? []) as VariantOptionDoc[],
  })

  return (
    <div className="variantOptionsSelector">
      <div className="variantOptionsSelectorHeading">
        <FieldLabel as="span" label={clientField.label} required={clientField.required} />
      </div>
      <VariantOptionsSelectorClient groups={groups} path={path} />
    </div>
  )
}
