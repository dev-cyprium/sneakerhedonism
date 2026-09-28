'use client'
import { useEffect, useState } from 'react'
import type { Product } from '@/payload-types'

type Stock = { inventory: number; variants: { id: number; inventory: number }[] }
export function useLiveStock(product: Product): Product {
  const [snapshot, setSnapshot] = useState<{ id: number; stock: Stock } | null>(null)
  useEffect(() => {
    let active = true
    let pending = false
    const controller = new AbortController()
    const refresh = async () => {
      if (document.hidden || pending) return
      pending = true
      try {
        const response = await fetch(`/api/products/${product.id}/stock`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok && response.status !== 404) throw new Error('Stock unavailable')
        const stock: Stock = await response.json()
        if (active) setSnapshot({ id: product.id, stock })
      } catch {
        // Fail closed until a subsequent refresh can verify availability.
        if (active) setSnapshot({ id: product.id, stock: { inventory: 0, variants: [] } })
      } finally {
        pending = false
      }
    }
    void refresh()
    const timer = setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      active = false
      controller.abort()
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [product.id])
  const stock = snapshot?.id === product.id ? snapshot.stock : null
  if (!stock) return product
  return {
    ...product,
    inventory: stock.inventory,
    variants: {
      ...product.variants,
      docs: product.variants?.docs?.map((v) =>
        typeof v === 'object'
          ? { ...v, inventory: stock.variants.find((fresh) => fresh.id === v.id)?.inventory ?? 0 }
          : v,
      ),
    },
  }
}
