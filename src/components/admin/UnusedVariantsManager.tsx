'use client'

import React, { useCallback, useEffect, useState } from 'react'

type VariantDoc = {
  id: number
  title?: string | null
  product?: number | Record<string, unknown> | null
}

export function UnusedVariantsManager() {
  const [variants, setVariants] = useState<VariantDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchUnused = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/variants/unused', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setVariants(data.docs ?? [])
      } else {
        setVariants([])
      }
    } catch {
      setVariants([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnused()
  }, [fetchUnused])

  const handleDelete = useCallback(
    async (id: number) => {
      setDeleting(id)
      try {
        const res = await fetch(`/api/variants/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (res.ok) {
          setVariants((prev) => prev.filter((v) => v.id !== id))
        }
      } finally {
        setDeleting(null)
      }
    },
    [],
  )

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 mt-6">
        <h3 className="text-sm font-semibold mb-2">Unused variants</h3>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 mt-6">
        <h3 className="text-sm font-semibold mb-2">Unused variants</h3>
        <p className="text-sm text-muted-foreground">
          No orphaned variants found. Variants become unused when their product is deleted.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-6 mt-6">
      <h3 className="text-sm font-semibold mb-2">
        Unused variants ({variants.length})
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        These variants are orphaned (product was deleted). You can safely remove them.
      </p>
      <ul className="space-y-2">
        {variants.map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-4 py-3"
          >
            <span className="text-sm truncate">
              {v.title || `Variant #${v.id}`}
            </span>
            <button
              type="button"
              className="shrink-0 rounded px-3 py-1.5 text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
              disabled={deleting === v.id}
              onClick={() => handleDelete(v.id)}
            >
              {deleting === v.id ? 'Removing…' : 'Remove'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
