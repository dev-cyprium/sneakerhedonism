'use client'

import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import {
  DEFAULT_SHOP_SORT,
  isShopSortValue,
  SHOP_SORT_OPTIONS,
} from '@/components/shop/filters/sortOptions'

type Props = {
  className?: string
}

export function SortFilter({ className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const activeSortRaw = searchParams.get('sort')
  const activeSort = isShopSortValue(activeSortRaw) ? activeSortRaw : DEFAULT_SHOP_SORT
  const activeOption = useMemo(
    () => SHOP_SORT_OPTIONS.find((option) => option.value === activeSort) ?? SHOP_SORT_OPTIONS[0],
    [activeSort],
  )

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(event.target as Node)) return
      setIsOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [searchParams])

  return (
    <div ref={rootRef} className={cn('flex w-full items-center gap-3 md:w-auto', className)}>
      <span className="shrink-0 text-sm font-semibold text-foreground">Sortiraj:</span>
      <div className="relative w-full md:w-56">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Sortiranje proizvoda"
          className="border-input bg-background hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm shadow-xs outline-none transition-colors focus-visible:ring-[3px]"
          onClick={() => {
            setIsOpen((prev) => !prev)
          }}
        >
          <span className="truncate">{activeOption.label}</span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform', {
              'rotate-180': isOpen,
            })}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0.85, y: -6 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.9, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              className="bg-popover absolute top-full right-0 z-50 mt-2 w-full origin-top rounded-md border p-1 shadow-md"
            >
              <ul role="listbox" aria-label="Opcije sortiranja" className="space-y-0.5">
                {SHOP_SORT_OPTIONS.map((option) => {
                  const isActive = option.value === activeSort

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          'hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                          isActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-popover-foreground',
                        )}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString())

                          if (option.value === DEFAULT_SHOP_SORT) {
                            params.delete('sort')
                          } else {
                            params.set('sort', option.value)
                          }

                          setIsOpen(false)
                          router.push(createUrl(pathname, params), { scroll: false })
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
