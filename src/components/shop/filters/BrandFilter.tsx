'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { createUrl } from '@/utilities/createUrl'

type Brand = {
  id: number
  title: string
  slug: string
  count: number
}

type Props = {
  brands: Brand[]
}

export function BrandFilter({ brands }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeBrand = searchParams.get('brand')

  if (brands.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Brendovi</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {brands.map((brand) => {
          const isActive = activeBrand === brand.slug
          return (
            <button
              key={brand.id}
              className={clsx(
                'inline-flex items-center gap-1.5 text-sm transition-colors cursor-pointer',
                isActive
                  ? 'font-bold text-foreground'
                  : 'font-medium text-foreground hover:text-muted-foreground',
              )}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                if (isActive) {
                  params.delete('brand')
                } else {
                  params.set('brand', brand.slug)
                }
                router.push(createUrl(pathname, params), { scroll: false })
              }}
            >
              {brand.title}
              <span className="text-muted-foreground text-xs">{brand.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
