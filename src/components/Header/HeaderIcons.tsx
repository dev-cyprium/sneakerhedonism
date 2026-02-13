'use client'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { useAuth } from '@/providers/Auth'
import { Heart, Search, User } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'

export function HeaderIcons() {
  const { user } = useAuth()

  return (
    <div className="flex items-center gap-5">
      <div className="hidden md:flex items-center gap-5">
        <Link
          href={user ? '/account' : '/login'}
          className="text-nav-text hover:text-nav-text-hover transition-colors"
          aria-label="Account"
        >
          <User className="h-[26px] w-[26px] stroke-[1.5]" />
        </Link>
        <Link
          href="/wishlist"
          className="text-nav-text hover:text-nav-text-hover transition-colors"
          aria-label="Wishlist"
        >
          <Heart className="h-[26px] w-[26px] stroke-[1.5]" />
        </Link>
        <Link
          href="/shop#search"
          className="text-nav-text hover:text-nav-text-hover transition-colors"
          aria-label="Search"
        >
          <Search className="h-[26px] w-[26px] stroke-[1.5]" />
        </Link>
      </div>
      <Suspense fallback={<OpenCartButton />}>
        <Cart />
      </Suspense>
    </div>
  )
}
