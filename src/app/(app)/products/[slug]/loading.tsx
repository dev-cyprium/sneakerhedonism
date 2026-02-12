import React from 'react'

export default function Loading() {
  return (
    <div className="container pt-6 pb-8">
      {/* Breadcrumb placeholder */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Two-column product layout */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12 mt-6">
        {/* Image placeholder */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Product info placeholders */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  )
}
