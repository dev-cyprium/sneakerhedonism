'use client'

import { useWishlist } from '@/providers/Wishlist'
import { Heart } from 'lucide-react'
import React, { useCallback } from 'react'
import { cn } from '@/utilities/cn'

type Props = {
  productId: number
  variantId?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Use for overlay on product cards — prevents link navigation when clicking heart */
  stopPropagation?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function AddToWishlist({
  productId,
  variantId,
  className,
  size = 'md',
  stopPropagation = false,
}: Props) {
  const { addItem, removeItem, isInWishlist, isLoading } = useWishlist()
  const inList = isInWishlist(productId, variantId)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) e.preventDefault()
      e.stopPropagation()
      if (inList) {
        void removeItem(productId, variantId)
      } else {
        void addItem(productId, variantId)
      }
    },
    [inList, productId, variantId, addItem, removeItem, stopPropagation],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={inList ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
      className={cn(
        'rounded-full p-1.5 text-nav-text transition-colors hover:text-accent-brand hover:bg-accent-brand/10',
        inList && 'text-accent-brand',
        className,
      )}
    >
      <Heart
        className={cn(sizeClasses[size], inList && 'fill-current')}
        strokeWidth={1.5}
      />
    </button>
  )
}
