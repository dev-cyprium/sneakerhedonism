'use client'

import React from 'react'

import type { ImageCarouselBlock as ImageCarouselBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { cn } from '@/utilities/cn'

export const ImageCarouselBlock: React.FC<
  ImageCarouselBlockProps & {
    id?: string | number
    className?: string
  }
> = ({ images, className }) => {
  if (!images || images.length === 0) return null

  return (
    <div className={cn('mx-auto w-full max-w-4xl px-12', className)}>
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {images.map((item, index) => (
            <CarouselItem key={index}>
              <Media
                resource={item.image}
                imgClassName="w-full rounded-lg object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
