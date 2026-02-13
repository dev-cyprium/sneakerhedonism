'use client'

import type { Product } from '@/payload-types'
import type { WishlistItem, WishlistItemWithProduct } from '@/lib/wishlist'
import { useWishlist } from '@/providers/Wishlist'
import { WishlistItemCard } from '@/components/Wishlist/WishlistItemCard'
import { Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function isItemWithProduct(
  item: WishlistItemWithProduct | WishlistItem,
): item is WishlistItemWithProduct {
  return 'product' in item && item.product != null
}

export function WishlistContent() {
  const { items, isLoading } = useWishlist()
  const [guestProducts, setGuestProducts] = useState<Record<number, Product>>({})

  useEffect(() => {
    const withoutProduct = items.filter((i) => !isItemWithProduct(i))
    if (withoutProduct.length === 0) return

    const ids = [...new Set(withoutProduct.map((i) => i.productId))]
    fetch('/api/wishlist/guest-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        const map: Record<number, Product> = {}
        for (const p of data.products ?? []) {
          if (p?.id) map[p.id] = p
        }
        setGuestProducts(map)
      })
      .catch(() => {})
  }, [items])

  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-muted/30 aspect-square animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 py-20 px-8 text-center">
        <div className="absolute inset-0 bg-linear-to-b from-accent-brand/5 via-transparent to-transparent" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/80 ring-4 ring-accent-brand/10">
            <Heart
              className="h-12 w-12 text-accent-brand/70"
              strokeWidth={1.25}
              aria-hidden
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Lista želja je prazna
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Dodaj proizvode koje želiš da kupiš klikom na srce — pronaći ćeš ih ovde kada budeš spreman.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-brand px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-brand/90 hover:shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              Pogledaj ponudu
            </Link>
            <Link
              href="/shop?category=patike"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Patike
            </Link>
            <Link
              href="/shop?category=odeca"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Odeća
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const itemsToRender: WishlistItemWithProduct[] = items
    .map((item) => {
      if (isItemWithProduct(item)) return item
      const product = guestProducts[item.productId]
      if (!product) return null
      return {
        productId: item.productId,
        variantId: item.variantId,
        product,
        variant: null,
      } as WishlistItemWithProduct
    })
    .filter((x): x is WishlistItemWithProduct => x != null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {itemsToRender.map((item) => (
        <WishlistItemCard key={`${item.productId}:${item.variantId ?? ''}`} item={item} />
      ))}
    </div>
  )
}
