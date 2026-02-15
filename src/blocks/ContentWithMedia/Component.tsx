import { cn } from '@/utilities/cn'
import React from 'react'
import { RichText } from '@/components/RichText'
import type { ContentWithMediaBlock as ContentWithMediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { CMSLink } from '../../components/Link'

export const ContentWithMediaBlock: React.FC<
  ContentWithMediaBlockProps & {
    id?: string | number
    className?: string
  }
> = (props) => {
  const { richText, media, mediaPosition = 'right', enableLink, link, className } = props

  return (
    <div className={cn('container', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        <div
          className={cn('lg:col-span-3', {
            'lg:order-last': mediaPosition === 'left',
          })}
        >
          {richText && (
            <RichText data={richText} enableGutter={false} className="[&_h2]:text-accent-brand" />
          )}
          {enableLink && <CMSLink className="mt-6" {...link} />}
        </div>
        <div
          className={cn('lg:col-span-2', {
            'lg:order-first': mediaPosition === 'left',
          })}
        >
          <Media imgClassName="rounded-[0.8rem]" resource={media} />
        </div>
      </div>
    </div>
  )
}
