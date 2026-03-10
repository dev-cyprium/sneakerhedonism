'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
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
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isMobileDrawerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileDrawerOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileDrawerOpen])

  useEffect(() => {
    setMobileDrawerOpen(false)
  }, [searchParams])

  useEffect(() => {
    if (!isMobileDrawerOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMobileDrawerOpen])

  const filterContent = (
    <>
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
    </>
  )

  return (
    <>
      {/* Mobile: collapsed filters trigger + bottom drawer */}
      <div className="w-full md:hidden">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-between px-4 text-base font-semibold"
          onClick={() => setMobileDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isMobileDrawerOpen}
          aria-label="Otvori filtere"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Filteri
          </span>
        </Button>
      </div>

      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Zatvori filtere"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => setMobileDrawerOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Filteri proizvoda"
              className="bg-background fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-2xl border-t shadow-2xl md:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-base font-semibold">Filteri</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Zatvori filtere"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="flex max-h-[calc(85vh-57px)] flex-col gap-6 overflow-y-auto px-4 py-4 pb-8">
                {filterContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: static sidebar */}
      <div className="hidden w-full flex-none flex-col gap-6 md:flex md:basis-1/5">
        {filterContent}
      </div>
    </>
  )
}
