'use client'

import type { Media, Product } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { GridTileImage } from '@/components/Grid/tile'
import { resolveProductDisplayPrice } from '@/lib/resolvePrice'
import AutoScroll from 'embla-carousel-auto-scroll'
import Link from 'next/link'
import React from 'react'

type CarouselClientProps =
  | { products: Product[]; media?: never }
  | { products?: never; media: (Media | number)[] }

export const CarouselClient: React.FC<CarouselClientProps> = ({ products, media }) => {
  if (media?.length) {
    const carouselMedia = [...media, ...media, ...media]

    return (
      <Carousel
        className="w-full"
        opts={{ align: 'start', loop: true }}
        plugins={[
          AutoScroll({
            playOnInit: true,
            speed: 1,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {carouselMedia.map((resource, i) => (
            <CarouselItem
              className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
              key={typeof resource === 'object' && resource?.id ? `media-${resource.id}-${i}` : `media-${i}`}
            >
              <div className="relative h-full w-full overflow-hidden rounded-md">
                <MediaComponent
                  fill
                  imgClassName="object-cover"
                  resource={resource}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    )
  }

  if (!products?.length) return null

  const carouselProducts = [...products, ...products, ...products]

  return (
    <Carousel
      className="w-full"
      opts={{ align: 'start', loop: true }}
      plugins={[
        AutoScroll({
          playOnInit: true,
          speed: 1,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent>
        {carouselProducts.map((product, i) => {
          const price = resolveProductDisplayPrice(product)
          return (
            <CarouselItem
              className="relative aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none md:w-1/3"
              key={`${product.slug}${i}`}
            >
              <Link className="relative h-full w-full" href={`/products/${product.slug}`}>
                <GridTileImage
                  label={{
                    amount: price ?? 0,
                    title: product.title,
                  }}
                  media={product.meta?.image as Media}
                />
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}
