'use client'

import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { createUrl } from '@/utilities/createUrl'

type Props = {
  categories: { id: number; title: string; slug: string }[]
}

export function CategoryFilter({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  // "Sve" (slug sve) is active when no category param or when category=sve
  const effectiveActive = activeCategory ?? 'sve'

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Kategorija</h3>
      <ul className="space-y-1.5">
        {categories.map((cat) => {
          const isActive = effectiveActive === cat.slug
          return (
            <li key={cat.id}>
              <button
                className={clsx(
                  'text-sm transition-colors cursor-pointer',
                  isActive
                    ? 'font-semibold text-foreground underline underline-offset-4'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (isActive) {
                    params.delete('category')
                  } else {
                    params.set('category', cat.slug)
                  }
                  // "Sve" = no category in URL for cleaner /shop
                  if (cat.slug === 'sve') params.delete('category')
                  // Reset brand when changing category
                  params.delete('brand')
                  router.push(createUrl(pathname, params), { scroll: false })
                }}
              >
                {cat.title}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
