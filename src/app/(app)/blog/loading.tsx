import React from 'react'

export default function Loading() {
  return (
    <div className="pt-16 pb-24">
      <div className="container mb-12">
        <div className="h-10 w-24 animate-pulse rounded bg-muted" />
      </div>

      <div className="container grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-border">
            <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded bg-muted mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
