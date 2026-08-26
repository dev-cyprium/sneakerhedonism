'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { ShopVariantType } from '@/lib/shopVariantFilters'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'

type Props = {
  /** Group id -> group ids it can be combined with. See getVariantTypeCompatibility. */
  variantTypeCompatibility: Record<number, number[]>
  variantTypes: ShopVariantType[]
}

type Draft = Record<number, number[]>

/**
 * Reads a group's selected ids out of the URL. Accepts a repeated param and a
 * comma-separated one, so links shared before multi-select existed still work.
 */
function readSelected(searchParams: URLSearchParams, name: string): number[] {
  return [
    ...new Set(
      searchParams
        .getAll(name)
        .flatMap((value) => value.split(','))
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ]
}

function draftFromUrl(searchParams: URLSearchParams, variantTypes: ShopVariantType[]): Draft {
  const draft: Draft = {}
  for (const variantType of variantTypes) {
    const selected = readSelected(searchParams, variantType.name)
    if (selected.length > 0) draft[variantType.id] = selected
  }
  return draft
}

const sameSelection = (a: number[] = [], b: number[] = []): boolean => {
  if (a.length !== b.length) return false
  const sortedB = [...b].sort()
  return [...a].sort().every((value, index) => value === sortedB[index])
}

export function VariantFilter({ variantTypeCompatibility, variantTypes }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const applied = useMemo(
    () => draftFromUrl(new URLSearchParams(searchParams.toString()), variantTypes),
    [searchParams, variantTypes],
  )

  // Selections are staged rather than applied per click: picking three sizes
  // should be one navigation, and on mobile each navigation closes the filter
  // drawer, which would otherwise make multi-select unusable.
  const [draft, setDraft] = useState<Draft>(applied)

  useEffect(() => {
    setDraft(applied)
  }, [applied])

  const toggle = useCallback(
    (variantType: ShopVariantType, optionId: number, checked: boolean) => {
      setDraft((previous) => {
        const current = new Set(previous[variantType.id] ?? [])
        if (checked) {
          current.add(optionId)
        } else {
          current.delete(optionId)
        }

        const next: Draft = { ...previous }
        if (current.size > 0) {
          next[variantType.id] = [...current]
        } else {
          delete next[variantType.id]
        }

        // Shoe numbers and clothing sizes never sit on the same product, so
        // holding both could only ever return an empty grid. Picking one clears
        // every group it cannot coexist with.
        if (current.size > 0) {
          const compatible = new Set(variantTypeCompatibility[variantType.id] ?? [])
          for (const other of variantTypes) {
            if (other.id !== variantType.id && !compatible.has(other.id)) {
              delete next[other.id]
            }
          }
        }

        return next
      })
    },
    [variantTypeCompatibility, variantTypes],
  )

  const hasPendingChanges = useMemo(
    () => variantTypes.some((vt) => !sameSelection(draft[vt.id], applied[vt.id])),
    [applied, draft, variantTypes],
  )

  const hasAnySelection = variantTypes.some((vt) => (draft[vt.id]?.length ?? 0) > 0)

  const apply = (next: Draft) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const variantType of variantTypes) {
      params.delete(variantType.name)
      for (const optionId of next[variantType.id] ?? []) {
        params.append(variantType.name, String(optionId))
      }
    }

    router.push(createUrl(pathname, params), { scroll: false })
  }

  if (variantTypes.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      {variantTypes.map((variantType) => {
        const selected = new Set(draft[variantType.id] ?? [])

        return (
          <div key={variantType.id}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">{variantType.label}</h3>

            <div className="flex flex-wrap gap-x-4 gap-y-2.5">
              {variantType.options.map((option) => {
                const inputId = `variant-${variantType.id}-${option.id}`
                const isSelected = selected.has(option.id)

                return (
                  <div className="flex items-center gap-2" key={option.id}>
                    <Checkbox
                      checked={isSelected}
                      id={inputId}
                      onCheckedChange={(checked) =>
                        toggle(variantType, option.id, checked === true)
                      }
                    />
                    <label
                      className={cn(
                        'cursor-pointer text-sm transition-colors',
                        isSelected
                          ? 'font-semibold text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                      htmlFor={inputId}
                    >
                      {option.label}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between gap-3">
        {hasAnySelection ? (
          <button
            className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              setDraft({})
              apply({})
            }}
            type="button"
          >
            Poništi
          </button>
        ) : (
          <span />
        )}

        <button
          className={cn(
            'text-sm font-semibold uppercase tracking-wide transition-colors',
            hasPendingChanges
              ? 'cursor-pointer text-foreground underline underline-offset-4'
              : 'cursor-default text-muted-foreground/50',
          )}
          disabled={!hasPendingChanges}
          onClick={() => apply(draft)}
          type="button"
        >
          Primeni
        </button>
      </div>
    </div>
  )
}
