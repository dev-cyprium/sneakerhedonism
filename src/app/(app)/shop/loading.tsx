import React from 'react'

function Pulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ''}`} />
}

function SidebarSkeleton() {
  return (
    <div className="w-full flex-none flex flex-col gap-6 md:basis-1/5">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Pulse key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      <hr className="border-border" />

      {/* Brand checkboxes */}
      <div className="flex flex-col gap-3">
        <Pulse className="h-4 w-16" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Pulse className="h-4 w-4 rounded-sm" />
            <Pulse className="h-3 w-24" />
          </div>
        ))}
      </div>

      <hr className="border-border" />

      {/* Variant dropdowns */}
      <div className="flex flex-col gap-3">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-10 w-full rounded-md" />
        <Pulse className="h-4 w-16 mt-2" />
        <Pulse className="h-10 w-full rounded-md" />
      </div>

      <hr className="border-border" />

      {/* Price slider */}
      <div className="flex flex-col gap-3">
        <Pulse className="h-4 w-12" />
        <Pulse className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Pulse className="h-3 w-14" />
          <Pulse className="h-3 w-14" />
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background">
      <Pulse className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-1.5 px-4 py-4">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-4 w-16" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10">
      <SidebarSkeleton />
      <div className="min-h-screen w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
