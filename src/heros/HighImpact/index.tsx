'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div className="relative z-0 w-full -mt-[10.4rem] h-[350px] md:h-[400px] overflow-hidden" data-theme="dark">
      {/* Background image */}
      {media && typeof media === 'object' && (
        <Media className="absolute inset-0 h-full w-full" fill imgClassName="object-cover" priority resource={media} />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Content */}
      <div
        className="absolute inset-0 z-[2] flex flex-col items-center justify-center px-4 pt-[10.4rem]"
        style={{ textAlign: 'center' }}
      >
        {richText && (
          <div className="hero-heading" style={{ fontSize: '40px', fontWeight: 900, color: 'var(--accent-brand)', lineHeight: 1, textAlign: 'center' }}>
            <RichText
              data={richText}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        )}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex justify-center gap-4 mt-4">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
