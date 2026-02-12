import React from 'react'

export default function Loading() {
  return (
    <>
      {/* Account settings card */}
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Recent orders card */}
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <div className="h-8 w-40 animate-pulse rounded bg-muted mb-8" />
        <div className="space-y-2 mb-8">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </>
  )
}
