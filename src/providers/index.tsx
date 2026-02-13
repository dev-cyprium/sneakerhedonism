import { AuthProvider } from '@/providers/Auth'
import { WishlistProvider } from '@/providers/Wishlist'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            currenciesConfig={{
              defaultCurrency: 'RSD',
              supportedCurrencies: [
                {
                  code: 'RSD',
                  decimals: 0,
                  label: 'Serbian Dinar',
                  symbol: ' RSD',
                },
              ],
            }}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                    meta: true,
                    enableVariants: true,
                    priceInRSD: true,
                    salePriceInRSD: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                    options: true,
                    priceInRSD: true,
                    salePriceInRSD: true,
                  },
                },
              },
            }}
            paymentMethods={[
              {
                name: 'cod',
                label: 'Plaćanje pouzećem',
                initiatePayment: true,
                confirmOrder: true,
              },
              {
                name: 'ecc',
                label: 'Plaćanje karticom',
                initiatePayment: true,
                confirmOrder: true,
              },
            ]}
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
