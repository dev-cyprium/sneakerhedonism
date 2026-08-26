'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { cn } from '@/utilities/cn'

export type BannerTextColor = 'black' | 'brand' | 'brandLight' | 'cream' | 'white'

export type BannerSlide = {
  ctaLabel?: string | null
  eyebrow?: string | null
  heading: string
  href: string | null
  image: MediaType | null
  key: string
  mobileImage: MediaType | null
  newTab: boolean
  overlayOpacity: number
  subheading?: string | null
  textColor: BannerTextColor
  textPosition: 'left' | 'center' | 'right'
  textScrim: boolean
}

const AUTOPLAY_DELAY = 6000

const positionClasses: Record<BannerSlide['textPosition'], string> = {
  center: 'items-center text-center',
  left: 'items-start text-left',
  right: 'items-end text-right',
}

const textColorClasses: Record<BannerTextColor, string> = {
  black: 'text-banner-black',
  brand: 'text-banner-brand',
  brandLight: 'text-banner-brand-light',
  cream: 'text-banner-cream',
  white: 'text-banner-white',
}

// Which way the scrim and text shadow have to lean: light copy needs a dark
// backdrop behind it, dark copy a light one. Getting this backwards is worse
// than having no scrim at all.
const textColorPolarity: Record<BannerTextColor, 'onDark' | 'onLight'> = {
  black: 'onLight',
  brand: 'onLight',
  brandLight: 'onDark',
  cream: 'onDark',
  white: 'onDark',
}

export const BannerSlider: React.FC<{ slides: BannerSlide[] }> = ({ slides }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [api, setApi] = useState<CarouselApi>()
  const [selected, setSelected] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setHeaderTheme('dark')
  })

  useEffect(() => {
    if (!api) return

    const onSelect = () => setSelected(api.selectedScrollSnap())

    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  // Auto-advance. Only ever one advance is pending: the next one is scheduled
  // when the carousel settles, so ticks can't pile up while the tab is in the
  // background (embla animates on rAF, which the browser throttles there) and
  // manual navigation restarts the countdown for free.
  useEffect(() => {
    if (!api || paused || slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let timeout: ReturnType<typeof setTimeout>

    const schedule = () => {
      clearTimeout(timeout)
      timeout = setTimeout(advance, AUTOPLAY_DELAY)
    }

    function advance() {
      if (document.hidden) {
        schedule()
        return
      }
      api!.scrollNext()
    }

    api.on('settle', schedule)
    schedule()

    return () => {
      clearTimeout(timeout)
      api.off('settle', schedule)
    }
  }, [api, paused, slides.length])

  if (slides.length === 0) return null

  return (
    <div
      className="relative -mt-16 h-[60dvh] overflow-hidden md:h-[80dvh]"
      data-theme="dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Carousel className="h-full" opts={{ loop: slides.length > 1 }} setApi={setApi}>
        <CarouselContent className="ml-0 h-full">
          {slides.map((slide, index) => {
            const Heading = index === 0 ? 'h1' : 'h2'
            const polarity = textColorPolarity[slide.textColor]
            const hasButton = Boolean(slide.href && slide.ctaLabel)
            const isBannerLink = Boolean(slide.href) && !hasButton
            const newTabProps = slide.newTab
              ? { rel: 'noopener noreferrer', target: '_blank' }
              : {}

            return (
              <CarouselItem className="relative h-full pl-0" key={slide.key}>
                {slide.image && (
                  <Media
                    className={cn('absolute inset-0 h-full w-full', slide.mobileImage && 'hidden md:block')}
                    fill
                    imgClassName="object-cover"
                    priority={index < 2}
                    resource={slide.image}
                  />
                )}
                {slide.mobileImage && (
                  <Media
                    className="absolute inset-0 h-full w-full md:hidden"
                    fill
                    imgClassName="object-cover"
                    priority={index < 2}
                    resource={slide.mobileImage}
                  />
                )}

                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: `rgb(0 0 0 / ${slide.overlayOpacity}%)` }}
                />

                {slide.textScrim && (
                  <div
                    className="banner-scrim pointer-events-none absolute inset-0"
                    data-polarity={polarity}
                    data-position={slide.textPosition}
                  />
                )}

                <div className="container relative z-10 flex h-full flex-col justify-center pt-16 pb-16 md:pb-24">
                  <div
                    className={cn(
                      'flex max-w-xl flex-col gap-4',
                      positionClasses[slide.textPosition],
                      textColorClasses[slide.textColor],
                      slide.textScrim && 'banner-text-shadow',
                      slide.textPosition === 'center' && 'mx-auto',
                      slide.textPosition === 'right' && 'ml-auto',
                    )}
                    data-polarity={polarity}
                  >
                    {slide.eyebrow && (
                      <span className="font-nav text-xs font-bold uppercase tracking-[0.2em] md:text-sm">
                        {slide.eyebrow}
                      </span>
                    )}

                    <Heading className="text-3xl font-black uppercase leading-tight md:text-6xl">
                      {slide.heading}
                    </Heading>

                    {slide.subheading && (
                      <p className="max-w-prose text-sm opacity-90 md:text-lg">
                        {slide.subheading}
                      </p>
                    )}

                    {/* text-shadow-none: the wrapper's shadow inherits into the button
                        label, where it only muddies text on a solid fill. */}
                    {hasButton && (
                      <Button asChild className="mt-2 w-fit uppercase text-shadow-none" size="lg">
                        <Link href={slide.href!} {...newTabProps}>
                          {slide.ctaLabel}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {isBannerLink && (
                  <Link
                    className="absolute inset-0 z-20"
                    href={slide.href!}
                    {...newTabProps}
                  >
                    <span className="sr-only">{slide.heading}</span>
                  </Link>
                )}
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {slides.length > 1 && (
          <>
            <CarouselPrevious className="left-4 z-30 hidden size-10 border-none bg-black/40 text-white hover:bg-black/60 md:inline-flex" />
            <CarouselNext className="right-4 z-30 hidden size-10 border-none bg-black/40 text-white hover:bg-black/60 md:inline-flex" />
          </>
        )}
      </Carousel>

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              aria-current={index === selected}
              aria-label={`Baner ${index + 1}: ${slide.heading}`}
              className={cn(
                'h-2 rounded-full transition-all',
                index === selected ? 'w-6 bg-accent-brand' : 'w-2 bg-white/60 hover:bg-white',
              )}
              key={slide.key}
              onClick={() => api?.scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}
