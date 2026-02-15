'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Media } from '@/components/Media'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
type Props = {
  product: Product
  /** Override variant from URL — used when rendering AddToCart outside product page (e.g. wishlist) */
  variant?: Variant
}

export function AddToCart({ product, variant: variantOverride }: Props) {
  const { addItem, cart, isLoading } = useCart()
  const searchParams = useSearchParams()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const variants = product.variants?.docs || []
  const hasVariantDocs = variants.length > 0

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (variantOverride) return variantOverride
    if (product.enableVariants && hasVariantDocs) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [variantOverride, product.enableVariants, hasVariantDocs, searchParams, variants])

  const previewImage = useMemo(() => {
    const firstGalleryImage =
      typeof product.gallery?.[0]?.image === 'object' ? product.gallery?.[0]?.image : undefined
    const metaImage = typeof product.meta?.image === 'object' ? product.meta.image : undefined

    return firstGalleryImage || metaImage
  }, [product.gallery, product.meta?.image])

  const handleContinueShopping = useCallback(() => {
    setIsConfirmModalOpen(false)
  }, [])

  const handleOpenCart = useCallback(() => {
    setIsConfirmModalOpen(false)

    window.setTimeout(() => {
      window.dispatchEvent(new Event('open-cart-sheet'))
    }, 0)
  }, [])

  const addToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      try {
        await addItem({
          product: product.id,
          variant: selectedVariant?.id ?? undefined,
        })

        setIsConfirmModalOpen(true)
      } catch {
        toast.error('Došlo je do greške pri dodavanju u korpu.')
      }
    },
    [addItem, product.id, selectedVariant?.id],
  )

  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants && hasVariantDocs) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants && hasVariantDocs) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants && hasVariantDocs) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, hasVariantDocs, cart?.items, product])

  return (
    <>
      <Button
        aria-label="Dodaj u korpu"
        className="w-full bg-accent-brand text-white hover:bg-accent-brand/90 font-semibold uppercase tracking-wide"
        size="lg"
        disabled={disabled || isLoading}
        onClick={addToCart}
        type="submit"
      >
        Dodaj u korpu
      </Button>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0">
          <DialogHeader className="gap-1 border-b px-6 py-5">
            <DialogTitle className="text-3xl leading-tight">Proizvod je dodat u korpu</DialogTitle>
            <DialogDescription className="sr-only">
              Izaberite da li želite da nastavite kupovinu ili otvorite korpu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            {previewImage ? (
              <div className="relative mx-auto h-24 w-24">
                <Media
                  className="h-full w-full"
                  fill
                  imgClassName="object-contain"
                  resource={previewImage}
                />
              </div>
            ) : null}

            <p className="text-center text-lg font-semibold leading-snug">{product.title}</p>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full text-base font-semibold"
                onClick={handleContinueShopping}
              >
                Nastavi kupovinu
              </Button>
              <Button
                type="button"
                className="h-12 w-full bg-accent-brand text-base font-semibold text-white hover:bg-accent-brand/90"
                onClick={handleOpenCart}
              >
                Idi u korpu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
