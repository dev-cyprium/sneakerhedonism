export const SHOP_SORT_OPTIONS = [
  { value: '-createdAt', label: 'Najnovije' },
  { value: 'title', label: 'A..Z' },
  { value: '-title', label: 'Z..A' },
  { value: '-priceInRSD', label: 'Najskuplja prvo' },
  { value: 'priceInRSD', label: 'Najjeftinije prvo' },
] as const

export type ShopSortValue = (typeof SHOP_SORT_OPTIONS)[number]['value']

export const DEFAULT_SHOP_SORT: ShopSortValue = '-createdAt'

const SHOP_SORT_VALUES = new Set<ShopSortValue>(SHOP_SORT_OPTIONS.map((option) => option.value))

export const isShopSortValue = (value: string | null | undefined): value is ShopSortValue => {
  if (!value) return false

  return SHOP_SORT_VALUES.has(value as ShopSortValue)
}
