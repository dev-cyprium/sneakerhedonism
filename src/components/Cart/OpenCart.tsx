import { ShoppingBag } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <button
      className="relative text-nav-text hover:text-nav-text-hover transition-colors hover:cursor-pointer"
      aria-label="Cart"
      {...rest}
    >
      <ShoppingBag className="h-5 w-5" />
      {quantity ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-brand text-[10px] font-bold leading-none text-white">
          {quantity}
        </span>
      ) : null}
    </button>
  )
}
