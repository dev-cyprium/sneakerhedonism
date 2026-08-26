import React from 'react'

import type { Media as MediaType, Page } from '@/payload-types'

import { BannerSlider, type BannerSlide, type BannerTextColor } from './BannerSlider.client'
import { resolveBannerHref } from './resolveBannerHref'

const asMedia = (value: unknown): MediaType | null =>
  value && typeof value === 'object' ? (value as MediaType) : null

const TEXT_COLORS: BannerTextColor[] = ['black', 'brand', 'brandLight', 'cream', 'white']

// Slides saved before the color field existed have no value; white over the
// existing overlay is the safest fallback.
const asTextColor = (value: unknown): BannerTextColor =>
  TEXT_COLORS.includes(value as BannerTextColor) ? (value as BannerTextColor) : 'white'

export const BannerHero: React.FC<Page['hero']> = ({ banners }) => {
  if (!Array.isArray(banners) || banners.length === 0) return null

  const slides: BannerSlide[] = banners.map((banner, index) => ({
    key: banner.id || `banner-${index}`,
    ctaLabel: banner.ctaLabel,
    eyebrow: banner.eyebrow,
    heading: banner.heading,
    href: resolveBannerHref(banner),
    image: asMedia(banner.image),
    mobileImage: asMedia(banner.mobileImage),
    newTab: banner.ctaType === 'url' && Boolean(banner.newTab),
    overlayOpacity: typeof banner.overlayOpacity === 'number' ? banner.overlayOpacity : 40,
    subheading: banner.subheading,
    textColor: asTextColor(banner.textColor),
    textPosition: banner.textPosition || 'left',
    textScrim: banner.textScrim !== false,
  }))

  return <BannerSlider slides={slides} />
}
