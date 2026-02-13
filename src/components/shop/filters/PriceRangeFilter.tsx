'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createUrl } from '@/utilities/createUrl'
import { Slider } from '@/components/ui/slider'
import { formatRSD } from '@/lib/formatRSD'

type Props = {
  min: number
  max: number
}

export function PriceRangeFilter({ min, max }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlMin = Number(searchParams.get('minPrice')) || min
  const urlMax = Number(searchParams.get('maxPrice')) || max
  const [range, setRange] = useState([urlMin, urlMax])

  // Sync local state when URL changes externally
  useEffect(() => {
    setRange([
      Number(searchParams.get('minPrice')) || min,
      Number(searchParams.get('maxPrice')) || max,
    ])
  }, [searchParams, min, max])

  if (min >= max) return null

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (range[0] > min) {
      params.set('minPrice', String(range[0]))
    } else {
      params.delete('minPrice')
    }
    if (range[1] < max) {
      params.set('maxPrice', String(range[1]))
    } else {
      params.delete('maxPrice')
    }
    router.push(createUrl(pathname, params), { scroll: false })
  }

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide mb-5">Cena</h3>
      <Slider
        min={min}
        max={max}
        step={100}
        value={range}
        onValueChange={setRange}
        className="mb-4"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm">
          Cena: <span className="font-semibold">{formatRSD(range[0])}</span> &mdash;{' '}
          <span className="font-semibold">{formatRSD(range[1])}</span>
        </p>
        <button
          onClick={handleFilter}
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          Filtriraj
        </button>
      </div>
    </div>
  )
}
