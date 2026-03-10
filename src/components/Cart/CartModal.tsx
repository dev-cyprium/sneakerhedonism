'use client'

import { Price } from '@/components/Price'
import { resolveItemPrice } from '@/lib/resolvePrice'
import { FREE_SHIPPING_THRESHOLD_RSD, getShippingSummary } from '@/lib/shipping'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Button } from '@/components/ui/button'
import { Product, VariantOption } from '@/payload-types'

export function CartModal() {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleOpenCart = () => {
      setIsOpen(true)
    }

    window.addEventListener('open-cart-sheet', handleOpenCart)

    return () => {
      window.removeEventListener('open-cart-sheet', handleOpenCart)
    }
  }, [])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  const cartSubtotal = useMemo(() => {
    if (!cart?.items?.length) return 0
    return cart.items.reduce((total, item) => {
      if (typeof item.product !== 'object' || !item.product || !item.quantity) return total
      const price = resolveItemPrice(item.product, item.variant)
      return total + (price ?? 0) * item.quantity
    }, 0)
  }, [cart?.items])

  const shippingSummary = useMemo(() => getShippingSummary(cartSubtotal), [cartSubtotal])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent animation="fade" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Korpa</SheetTitle>

          <SheetDescription>
            Pregledajte proizvode, izmenite količinu i nastavite ka plaćanju.
          </SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">Vaša korpa je prazna.</p>
            <Button asChild variant="outline">
              <Link href="/shop">Idi u prodavnicu</Link>
            </Button>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4">
                {cart?.items?.map((item, i) => {
                  const product = item.product
                  const variant = item.variant

                  if (typeof product !== 'object' || !item || !product || !product.slug)
                    return <React.Fragment key={i} />

                  const metaImage =
                    product.meta?.image && typeof product.meta?.image === 'object'
                      ? product.meta.image
                      : undefined

                  const firstGalleryImage =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined

                  let image = firstGalleryImage || metaImage
                  const price = resolveItemPrice(product, variant)
                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  if (isVariant) {
                    const imageVariant = product.gallery?.find((item: NonNullable<Product['gallery']>[number]) => {
                      if (!item.variantOption) return false
                      const variantOptionID =
                        typeof item.variantOption === 'object'
                          ? item.variantOption.id
                          : item.variantOption

                      const hasMatch = variant?.options?.some((option: number | VariantOption) => {
                        if (typeof option === 'object') return option.id === variantOptionID
                        else return option === variantOptionID
                      })

                      return hasMatch
                    })

                    if (imageVariant && typeof imageVariant.image === 'object') {
                      image = imageVariant.image
                    }
                  }

                  return (
                    <li className="flex w-full flex-col gap-3 border-b border-border py-4 last:border-b-0" key={i}>
                      <div className="flex w-full flex-row gap-4">
                        <Link
                          className="flex min-w-0 flex-1 flex-row gap-4"
                          href={`/products/${(item.product as Product)?.slug}`}
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            {image?.url && (
                              <Image
                                alt={image?.alt || product?.title || ''}
                                className="h-full w-full object-contain"
                                height={80}
                                src={image.url}
                                width={80}
                              />
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                            <span className="truncate text-base font-medium leading-tight">
                              {product?.title}
                            </span>
                            {isVariant && variant ? (
                              <p className="text-sm text-muted-foreground capitalize">
                                {variant.options
                                  ?.map((option: number | VariantOption) => {
                                    if (typeof option === 'object') return option.label
                                    return null
                                  })
                                  .join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                          <DeleteItemButton item={item} />
                          {price != null && (
                            <Price className="text-right text-sm font-medium" amount={price} />
                          )}
                          <div className="flex flex-row items-center rounded-lg border border-border">
                            <EditItemQuantityButton item={item} type="minus" />
                            <span className="min-w-6 px-2 text-center text-sm">
                              {item.quantity}
                            </span>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="px-4">
                <div className="py-4 text-sm text-muted-foreground">
                  <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {shippingSummary.hasFreeShipping ? (
                          <p className="text-sm font-medium text-foreground">
                            Ostvarili ste besplatnu dostavu.
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            Dodajte još{' '}
                            <Price
                              as="span"
                              amount={shippingSummary.remainingForFreeShipping}
                              className="inline text-sm font-semibold text-foreground"
                            />{' '}
                            do besplatne dostave.
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Prag za besplatnu dostavu je{' '}
                          <Price
                            as="span"
                            amount={FREE_SHIPPING_THRESHOLD_RSD}
                            className="inline text-xs text-muted-foreground"
                          />
                          .
                        </p>
                      </div>

                      {!shippingSummary.hasFreeShipping && (
                        <Button asChild variant="link" size="clear" className="h-auto p-0 text-xs sm:text-sm">
                          <Link href="/shop">Dodaj proizvode</Link>
                        </Button>
                      )}
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${shippingSummary.progressToFreeShipping}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-3 space-y-2 border-b border-border pb-3 pt-1">
                    <div className="flex items-center justify-between">
                      <p>Iznos</p>
                      <Price amount={cartSubtotal} className="text-right text-sm text-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p>Dostava</p>
                      {shippingSummary.hasFreeShipping ? (
                        <span className="text-sm font-medium text-primary">Besplatno</span>
                      ) : (
                        <Price
                          amount={shippingSummary.shippingAmount}
                          className="text-right text-sm text-foreground"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="font-medium text-foreground">Ukupno</p>
                      <Price
                        amount={shippingSummary.totalAmount}
                        className="text-right text-base font-semibold text-foreground"
                      />
                    </div>
                  </div>

                  <Button asChild>
                    <Link className="w-full" href="/checkout">
                      Nastavi na plaćanje
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
