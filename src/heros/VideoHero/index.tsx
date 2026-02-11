'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const VideoHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-16 flex items-end justify-center overflow-hidden h-[60dvh] md:h-[80dvh]"
      data-theme="dark"
    >
      {/* Video background */}
      {media && typeof media === 'object' && (
        <Media
          resource={media}
          videoClassName="absolute inset-0 h-full w-full object-cover"
          imgClassName="absolute inset-0 h-full w-full object-cover"
          htmlElement={null}
        />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="container relative z-10 pb-12 md:pb-16 text-center">
        <div className="mx-auto">
          {richText && (
            <RichText
              className="mb-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-[#49aafc] md:[&_h1]:text-6xl md:[&_h1]:whitespace-nowrap [&_p]:text-sm [&_p]:text-[#49aafc] md:[&_p]:text-lg md:[&_p]:whitespace-nowrap"
              data={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex justify-center gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
