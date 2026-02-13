import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { NovoBlock } from '@/blocks/Novo/Component'
import { WishlistContent } from './WishlistContent'

export const metadata: Metadata = {
  title: 'Lista želja',
  description: 'Proizvodi koje želite da kupite',
}

export default function WishlistPage() {
  return (
    <>
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-8 uppercase tracking-wide">Lista želja</h1>
        <Suspense fallback={<WishlistSkeleton />}>
          <WishlistContent />
        </Suspense>
      </div>
      <NovoBlock limit={8} />
    </>
  )
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-muted/30 aspect-square animate-pulse" />
      ))}
    </div>
  )
}
