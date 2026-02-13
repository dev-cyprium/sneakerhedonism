import { Search } from '@/components/Search'
import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-8 my-16 pb-4">
        <Search />
        {children}
      </div>
    </Suspense>
  )
}
