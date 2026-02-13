import React, { Suspense } from 'react'
import { CategoryFilter } from './filters/CategoryFilter'
import { BrandFilter } from './filters/BrandFilter'
import { VariantFilter } from './filters/VariantFilter'
import { PriceRangeFilter } from './filters/PriceRangeFilter'
import { SaleFilter } from './filters/SaleFilter'

type ParentCategory = { id: number; title: string; slug: string }
type Brand = { id: number; title: string; slug: string; count: number }
type FilterVariantType = {
  id: number
  label: string
  name: string
  options: { id: number; label: string }[]
}

type Props = {
  parentCategories: ParentCategory[]
  brands: Brand[]
  variantTypes: FilterVariantType[]
  priceRange: { min: number; max: number }
}

export function ShopSidebar({ parentCategories, brands, variantTypes, priceRange }: Props) {
  return (
    <div className="w-full flex-none flex flex-col gap-6 md:basis-1/5">
      <Suspense fallback={null}>
        <CategoryFilter categories={parentCategories} />
      </Suspense>

      {brands.length > 0 && (
        <>
          <hr className="border-border" />
          <Suspense fallback={null}>
            <BrandFilter brands={brands} />
          </Suspense>
        </>
      )}

      {variantTypes.length > 0 && (
        <>
          <hr className="border-border" />
          <Suspense fallback={null}>
            <VariantFilter variantTypes={variantTypes} />
          </Suspense>
        </>
      )}

      {priceRange.min < priceRange.max && (
        <>
          <hr className="border-border" />
          <Suspense fallback={null}>
            <PriceRangeFilter min={priceRange.min} max={priceRange.max} />
          </Suspense>
        </>
      )}

      <hr className="border-border" />
      <SaleFilter />
    </div>
  )
}
