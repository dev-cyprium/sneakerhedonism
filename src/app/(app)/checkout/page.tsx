import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React, { Suspense } from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Checkout() {
  return (
    <div className="container min-h-[90vh] flex">
      <h1 className="sr-only">Checkout</h1>

      <Suspense fallback={
        <div className="py-12 w-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }>
        <CheckoutPage />
      </Suspense>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
