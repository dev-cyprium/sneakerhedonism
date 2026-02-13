import React, { Fragment } from 'react'

import type { Props } from './types'

import { Image } from './Image'
import { Video } from './Video'
import { cn } from '@/utilities/cn'

export const Media: React.FC<Props> = (props) => {
  const { className, fill, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = (htmlElement as any) || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className: cn(className, fill && 'h-full w-full'),
          }
        : {})}
    >
      {isVideo ? <Video {...props} /> : <Image {...props} />}
    </Tag>
  )
}
