'use client'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { GridTileImage } from '@/components/Grid/tile'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { DefaultDocumentIDType } from 'payload'
import { cn } from '@/utilities/cn'

type Props = {
  gallery: NonNullable<Product['gallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams()
  const [current, setCurrent] = useState(0)
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()

  // Sync main carousel selection to state
  useEffect(() => {
    if (!mainApi) return

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap()
      setCurrent(index)
      thumbApi?.scrollTo(index)
    }

    mainApi.on('select', onSelect)
    return () => {
      mainApi.off('select', onSelect)
    }
  }, [mainApi, thumbApi])

  // Respond to variant option changes in URL
  useEffect(() => {
    const values = Array.from(searchParams.values())

    if (values && mainApi) {
      const index = gallery.findIndex((item) => {
        if (!item.variantOption) return false

        let variantID: DefaultDocumentIDType

        if (typeof item.variantOption === 'object') {
          variantID = item.variantOption.id
        } else variantID = item.variantOption

        return Boolean(values.find((value) => value === String(variantID)))
      })
      if (index !== -1) {
        setCurrent(index)
        mainApi.scrollTo(index, true)
      }
    }
  }, [searchParams, mainApi, gallery])

  const scrollTo = useCallback(
    (index: number) => {
      setCurrent(index)
      mainApi?.scrollTo(index)
    },
    [mainApi],
  )

  const hasMultiple = gallery.length > 1

  return (
    <div>
      {/* Main image carousel */}
      <div className="relative group/gallery">
        <Carousel
          setApi={setMainApi}
          className="w-full"
          opts={{ align: 'start', loop: hasMultiple }}
        >
          <CarouselContent className="ml-0">
            {gallery.map((item, i) => {
              if (typeof item.image !== 'object') return null
              return (
                <CarouselItem key={`main-${item.image.id}-${i}`} className="pl-0">
                  <Media
                    resource={item.image}
                    className="w-full"
                    imgClassName="w-full rounded-lg"
                  />
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>

        {/* Prev/Next arrows — only show when multiple images */}
        {hasMultiple && (
          <>
            <button
              onClick={() => mainApi?.scrollPrev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover/gallery:opacity-100 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => mainApi?.scrollNext()}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover/gallery:opacity-100 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Dot indicators for mobile (always visible) */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 lg:hidden">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === current ? 'w-4 bg-foreground' : 'w-1.5 bg-foreground/40',
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <Carousel
          setApi={setThumbApi}
          className="w-full mt-3"
          opts={{ align: 'start', loop: false, containScroll: 'keepSnaps' }}
        >
          <CarouselContent className="-ml-2">
            {gallery.map((item, i) => {
              if (typeof item.image !== 'object') return null

              return (
                <CarouselItem
                  className="basis-1/5 pl-2 cursor-pointer"
                  key={`thumb-${item.image.id}-${i}`}
                  onClick={() => scrollTo(i)}
                >
                  <GridTileImage active={i === current} media={item.image} />
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  )
}
