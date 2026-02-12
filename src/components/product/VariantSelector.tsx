'use client'

import type { Product } from '@/payload-types'

import { createUrl } from '@/utilities/createUrl'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariantTypes = Boolean(product.enableVariants && variantTypes?.some((t) => typeof t === 'object' && t.options?.docs?.length))

  // Optimistic local state — reflects selection instantly before URL updates
  const [optimisticParams, setOptimisticParams] = React.useState<URLSearchParams>(
    new URLSearchParams(searchParams.toString()),
  )

  // Sync optimistic state when the real URL params catch up
  React.useEffect(() => {
    setOptimisticParams(new URLSearchParams(searchParams.toString()))
  }, [searchParams])

  if (!hasVariantTypes) {
    return null
  }

  return variantTypes?.map((type) => {
    if (!type || typeof type !== 'object') {
      return <React.Fragment key={String(type)} />
    }

    const options = type.options?.docs

    if (!options || !Array.isArray(options) || !options.length) {
      return <React.Fragment key={type.id} />
    }

    return (
      <dl className="" key={type.id}>
        <dt className="mb-3 text-sm font-medium">{type.label}</dt>
        <dd className="flex flex-wrap gap-2">
          {options?.map((option) => {
            if (!option || typeof option !== 'object') {
              return <React.Fragment key={String(option)} />
            }

            const optionID = option.id
            const optionKeyLowerCase = type.name

            // Base option params on optimistic params so we can preserve any other param state.
            const optionSearchParams = new URLSearchParams(optimisticParams.toString())

            // Remove image and variant ID from this search params so we can loop over it safely.
            optionSearchParams.delete('variant')
            optionSearchParams.delete('image')

            // Update the option params using the current option to reflect how the url *would* change,
            // if the option was clicked.
            optionSearchParams.set(optionKeyLowerCase, String(optionID))

            const currentOptions = Array.from(optionSearchParams.values())

            let isAvailableForSale = true

            // Find a matching variant (if variant records exist)
            if (variants && variants.length > 0) {
              const matchingVariant = variants
                .filter((variant) => typeof variant === 'object')
                .find((variant) => {
                  if (!variant.options || !Array.isArray(variant.options)) return false

                  return variant.options.every((variantOption) => {
                    if (typeof variantOption !== 'object')
                      return currentOptions.includes(String(variantOption))

                    return currentOptions.includes(String(variantOption.id))
                  })
                })

              if (matchingVariant) {
                optionSearchParams.set('variant', String(matchingVariant.id))

                if (matchingVariant.inventory && matchingVariant.inventory > 0) {
                  isAvailableForSale = true
                } else {
                  isAvailableForSale = false
                }
              } else {
                // No variant record for this option — not available
                isAvailableForSale = false
              }
            }

            const optionUrl = createUrl(pathname, optionSearchParams)

            // The option is active if it matches optimistic params (instant feedback).
            const isActive =
              Boolean(isAvailableForSale) &&
              optimisticParams.get(optionKeyLowerCase) === String(optionID)

            return (
              <button
                type="button"
                aria-disabled={!isAvailableForSale}
                className={clsx(
                  'relative inline-flex items-center justify-center min-w-[3rem] px-3 h-9 text-sm rounded-md border font-medium transition-colors',
                  isAvailableForSale
                    ? isActive
                      ? 'border-accent-brand bg-accent-brand/5 text-accent-brand'
                      : 'border-input bg-card hover:bg-accent hover:bg-primary-foreground text-foreground cursor-pointer'
                    : 'border-input/50 bg-muted/50 text-muted-foreground/50 line-through cursor-not-allowed',
                )}
                key={option.id}
                onClick={() => {
                  if (!isAvailableForSale) return
                  // Update optimistic state immediately for instant visual feedback
                  setOptimisticParams(optionSearchParams)
                  router.replace(`${optionUrl}`, {
                    scroll: false,
                  })
                }}
                title={`${option.label}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
              >
                {option.label}
              </button>
            )
          })}
        </dd>
      </dl>
    )
  })
}
