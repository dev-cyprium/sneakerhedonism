'use client'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AddToWishlist } from '@/components/Wishlist/AddToWishlist'
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { resolveProductDisplayPriceInfo } from '@/lib/resolvePrice'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, title } = product
  const priceInfo = resolveProductDisplayPriceInfo(product)
  const productHref = `/products/${product.slug}`

  const images =
    gallery
      ?.map((item) => (item.image && typeof item.image !== 'string' ? item.image : null))
      .filter(Boolean) ?? []

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)
  const pointerStart = useRef(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  const scrollTo = useCallback(
    (index: number) => {
      setHasDragged(true)
      api?.scrollTo(index)
    },
    [api],
  )

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = e.clientX
    setHasDragged(false)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (Math.abs(e.clientX - pointerStart.current) > 8) setHasDragged(true)
  }, [])

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      if (hasDragged) e.preventDefault()
    },
    [hasDragged],
  )

  const hasMultiple = images.length > 1

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background transition-shadow duration-300 hover:shadow-lg h-full">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Image area — always contain the full image, with tight padding */}
        <div className="relative aspect-square overflow-hidden p-1">
          {priceInfo?.saleInfo ? (
            <span
              className="absolute left-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-brand text-[10px] font-bold leading-none text-primary-foreground"
              aria-label={`${priceInfo.saleInfo.discountPercent}% discount`}
            >
              -{priceInfo.saleInfo.discountPercent}%
            </span>
          ) : null}
          {hasMultiple ? (
            <div className="relative h-full w-full">
              <Link
                href={productHref}
                className="block h-full w-full"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onClick={handleImageClick}
              >
                <Carousel
                  setApi={setApi}
                  className="h-full w-full"
                  opts={{
                    align: 'center',
                    loop: true,
                    containScroll: 'trimSnaps',
                    dragFree: false,
                  }}
                >
                  <CarouselContent className="ml-0 h-full">
                    {images.map((img, i) => (
                      <CarouselItem
                        key={typeof img === 'object' && img && 'id' in img ? img.id : i}
                        className="pl-0"
                      >
                        <div className="relative h-full w-full flex items-center justify-center">
                          <Media
                            className="h-full w-full"
                            fill
                            imgClassName="object-contain object-center transition duration-300"
                            resource={img!}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </Link>

              {/* Arrows — visible on hover, desktop */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  api?.scrollPrev()
                }}
                className="absolute left-1 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  api?.scrollNext()
                }}
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
                aria-label="Next image"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollTo(i)
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === current ? 'w-4 bg-foreground' : 'w-1.5 bg-foreground/40',
                    )}
                    aria-label={`Go to image ${i + 1}`}
                    aria-current={i === current ? 'true' : undefined}
                  />
                ))}
              </div>
            </div>
          ) : images[0] ? (
            <Link href={productHref} className="relative flex h-full w-full items-center justify-center">
              <Media
                className="h-full w-full"
                fill
                imgClassName="object-contain object-center transition duration-300"
                resource={images[0]}
              />
            </Link>
          ) : null}
        </div>

        {/* Info — fixed 2-line title, price pinned to bottom */}
        <Link className="flex flex-col flex-1 min-h-0 gap-1.5 px-4 py-4" href={productHref}>
          <h3 className="text-[15px] font-medium leading-snug text-foreground line-clamp-2 min-h-[2.75em]">
            {title}
          </h3>
          {priceInfo != null && (
            <div className="mt-auto flex items-end gap-2 pt-0.5">
              {priceInfo.saleInfo ? (
                <>
                  <div className="flex flex-col items-start leading-tight">
                    <Price
                      className="text-[12px] text-muted-foreground line-through"
                      amount={priceInfo.saleInfo.originalPrice}
                      as="span"
                    />
                    <Price
                      className="text-[15px] font-bold text-accent-brand"
                      amount={priceInfo.saleInfo.salePrice}
                      as="span"
                    />
                  </div>
                </>
              ) : (
                <Price
                  className="text-[15px] font-bold text-accent-brand"
                  amount={priceInfo.amount}
                  as="span"
                />
              )}
            </div>
          )}
        </Link>
      </div>
      <div className="absolute right-2 top-2 z-10">
        <AddToWishlist
          productId={product.id as number}
          stopPropagation
          size="sm"
          className="bg-background/90 backdrop-blur-sm"
        />
      </div>
    </div>
  )
}
