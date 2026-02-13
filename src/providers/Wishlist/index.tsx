'use client'

import type { WishlistItem, WishlistItemWithProduct } from '@/lib/wishlist'
import { useAuth } from '@/providers/Auth'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

const STORAGE_KEY = 'sneaker-hedonism-wishlist'

function getStoredItems(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is WishlistItem =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as WishlistItem).productId === 'number',
    )
  } catch {
    return []
  }
}

function setStoredItems(items: WishlistItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

type WishlistContextValue = {
  items: Array<WishlistItemWithProduct | WishlistItem>
  addItem: (productId: number, variantId?: number) => Promise<void>
  removeItem: (productId: number, variantId?: number) => Promise<void>
  isInWishlist: (productId: number, variantId?: number) => boolean
  isLoading: boolean
  count: number
}

const defaultContextValue: WishlistContextValue = {
  items: [],
  addItem: async () => {},
  removeItem: async () => {},
  isInWishlist: () => false,
  isLoading: false,
  count: 0,
}

const Context = createContext<WishlistContextValue>(defaultContextValue)

function key(productId: number, variantId?: number) {
  return `${productId}:${variantId ?? ''}`
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, status } = useAuth()
  const [items, setItems] = useState<Array<WishlistItemWithProduct | WishlistItem>>([])
  const [isLoading, setIsLoading] = useState(false)
  const isSyncingRef = useRef(false)
  const syncRanRef = useRef(false)

  const isLoggedIn = status === 'loggedIn'
  const isGuest = !user && status !== 'loggedIn'

  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn || isSyncingRef.current) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/wishlist', { credentials: 'include' })
      if (res.ok) {
        const { items: data } = await res.json()
        setItems(data ?? [])
      }
    } catch {
      // keep current state
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isGuest) {
      setItems(getStoredItems())
      return
    }
    if (!isLoggedIn) return
    void fetchWishlist()
  }, [isGuest, isLoggedIn, fetchWishlist])

  useEffect(() => {
    if (status !== 'loggedIn' || syncRanRef.current) return
    syncRanRef.current = true
    isSyncingRef.current = true

    const stored = getStoredItems()
    if (stored.length === 0) {
      isSyncingRef.current = false
      return
    }

    fetch('/api/wishlist/sync', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: stored }),
    })
      .then(async (res) => {
        if (res.ok) {
          const { items: merged } = await res.json()
          setStoredItems([])
          setItems(merged ?? [])
        }
      })
      .finally(() => {
        isSyncingRef.current = false
      })
  }, [status])

  useEffect(() => {
    if (status === 'loggedOut') {
      syncRanRef.current = false
    }
  }, [status])

  const addItem = useCallback(
    async (productId: number, variantId?: number) => {
      const k = key(productId, variantId)
      const alreadyIn = items.some((i) => key(i.productId, i.variantId) === k)
      if (alreadyIn) return

      if (isGuest) {
        const next: WishlistItem[] = [...getStoredItems(), { productId, variantId }]
        setStoredItems(next)
        setItems(next)
        return
      }

      if (isSyncingRef.current) return

      const prev = [...items]
      setItems((curr) => [...curr, { productId, variantId }])

      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, variantId }),
        })
        if (res.ok) {
          const { items: data } = await res.json()
          setItems(data ?? [])
        } else {
          setItems(prev)
        }
      } catch {
        setItems(prev)
      }
    },
    [items, isGuest],
  )

  const removeItem = useCallback(
    async (productId: number, variantId?: number) => {
      const k = key(productId, variantId)

      if (isGuest) {
        const next = getStoredItems().filter((i) => key(i.productId, i.variantId) !== k)
        setStoredItems(next)
        setItems(next)
        return
      }

      if (isSyncingRef.current) return

      const prev = [...items]
      setItems((curr) => curr.filter((i) => key(i.productId, i.variantId) !== k))

      try {
        const params = new URLSearchParams({ productId: String(productId) })
        if (variantId != null) params.set('variantId', String(variantId))
        const res = await fetch(`/api/wishlist?${params}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (res.ok) {
          const { items: data } = await res.json()
          setItems(data ?? [])
        } else {
          setItems(prev)
        }
      } catch {
        setItems(prev)
      }
    },
    [items, isGuest],
  )

  const isInWishlist = useCallback(
    (productId: number, variantId?: number) => {
      const k = key(productId, variantId)
      return items.some((i) => key(i.productId, i.variantId) === k)
    },
    [items],
  )

  const value: WishlistContextValue = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    isLoading,
    count: items.length,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useWishlist(): WishlistContextValue {
  return useContext(Context)
}
