'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createUrl } from '@/utilities/createUrl'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FilterVariantType = {
  id: number
  label: string
  name: string
  options: { id: number; label: string }[]
}

type Props = {
  variantTypes: FilterVariantType[]
}

function getAllLabel(vt: FilterVariantType): string {
  const key = (vt.name || vt.label || '').toLowerCase()
  if (key.includes('broj')) return 'Svi brojevi'
  if (key.includes('velicin')) return 'Sve veličine'
  return `Sve ${vt.label.toLowerCase()}`
}

export function VariantFilter({ variantTypes }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selections, setSelections] = useState<Record<string, string>>({})

  // Reset local selections when URL params change externally
  useEffect(() => {
    setSelections({})
  }, [searchParams])

  if (variantTypes.length === 0) return null

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const vt of variantTypes) {
      params.delete(vt.name)
    }
    for (const [key, value] of Object.entries(selections)) {
      if (value && value !== 'any') {
        params.set(key, value)
      }
    }
    router.push(createUrl(pathname, params), { scroll: false })
  }

  return (
    <div>
      {variantTypes.map((vt) => {
        const currentValue = selections[vt.name] ?? searchParams.get(vt.name) ?? 'any'
        return (
          <div key={vt.id}>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3">{vt.label}</h3>
            <Select
              value={currentValue}
              onValueChange={(value) => {
                setSelections((prev) => ({ ...prev, [vt.name]: value }))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={getAllLabel(vt)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{getAllLabel(vt)}</SelectItem>
                {vt.options.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
      <div className="flex justify-end mt-1">
        <button
          onClick={handleApply}
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          Primeni
        </button>
      </div>
    </div>
  )
}
