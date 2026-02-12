import React from 'react'

export default function Loading() {
  return (
    <div className="pb-24">
      {/* Title + meta */}
      <div className="container max-w-4xl mx-auto pt-10 space-y-4">
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      {/* Featured image */}
      <div className="container max-w-xl mx-auto mt-8">
        <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-muted" />
      </div>

      {/* Two-column layout */}
      <div className="container mx-auto mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Content column */}
          <div className="flex-1 min-w-0 max-w-3xl space-y-4">
            <hr className="border-border mb-8" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: `${70 + Math.round((i * 17) % 30)}%` }}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="space-y-4">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-16 shrink-0 animate-pulse rounded-md bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
