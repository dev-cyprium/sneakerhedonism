import React from 'react'

export default function Loading() {
  return (
    <div className="border p-8 rounded-lg bg-primary-foreground w-full">
      <div className="h-8 w-28 animate-pulse rounded bg-muted mb-8" />
      <div className="flex flex-col gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
