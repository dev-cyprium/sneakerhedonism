'use client'
import { formatRSD } from '@/lib/formatRSD'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
}

type PriceFixed = {
  amount: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  currencyCode: currencyCodeFromProps,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const { formatCurrency, supportedCurrencies } = useCurrency()

  const Element = as

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps) {
      return supportedCurrencies.find((currency) => currency.code === currencyCodeFromProps)
    }
    return undefined
  }, [currencyCodeFromProps, supportedCurrencies])

  const isRSD = (currencyToUse?.code ?? supportedCurrencies[0]?.code) === 'RSD'

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {isRSD ? formatRSD(amount) : formatCurrency(amount, { currency: currencyToUse })}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {isRSD
          ? `${formatRSD(lowestAmount)} - ${formatRSD(highestAmount)}`
          : `${formatCurrency(lowestAmount, { currency: currencyToUse })} - ${formatCurrency(highestAmount, { currency: currencyToUse })}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {isRSD ? formatRSD(lowestAmount) : formatCurrency(lowestAmount, { currency: currencyToUse })}
      </Element>
    )
  }

  return null
}
