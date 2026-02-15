import type { Media as MediaType, PogledajPonuduBlock as PogledajPonuduBlockProps } from '@/payload-types'
import type { DefaultDocumentIDType } from 'payload'

import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

type PogledajItem = NonNullable<PogledajPonuduBlockProps['items']>[number]

const CardLink: React.FC<{
  item: PogledajItem
  className?: string
}> = ({ item, className }) => (
  <Link
    href={item.link}
    className={`group relative block h-full w-full min-w-0 overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md ${className ?? ''}`}
  >
    <Media
      className="h-full w-full"
      fill
      imgClassName="h-full w-full object-cover object-center transition duration-300 ease-in-out group-hover:scale-105"
      resource={item.image as MediaType}
    />
    <div className="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/20" />
    <span className="absolute bottom-3 left-3 rounded-full bg-muted/95 px-3 py-1 text-sm font-bold uppercase tracking-wider text-foreground">
      {item.label}
    </span>
  </Link>
)

export const PogledajPonuduBlock: React.FC<
  PogledajPonuduBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = ({ heading, items }) => {
  if (!items || items.length < 3) return null

  const [first, second, third] = items

  return (
    <section className="container py-10 md:py-12">
      {heading && (
        <h2 className="mb-6 text-center text-2xl font-bold uppercase tracking-wide text-foreground md:mb-8 md:text-3xl">
          {heading}
        </h2>
      )}

      {/* Desktop: 1 large left + 2 small right — compact, scales with viewport */}
      <div className="hidden md:grid md:aspect-8/3 md:grid-cols-5 md:grid-rows-2 md:gap-3">
        <CardLink
          item={first}
          className="col-span-3 row-span-2 min-h-0"
        />
        <CardLink
          item={second}
          className="col-span-2 row-span-1 min-h-0"
        />
        <CardLink
          item={third}
          className="col-span-2 row-span-1 min-h-0"
        />
      </div>

      {/* Mobile: 3 stacked, compact */}
      <div className="flex flex-col gap-3 md:hidden">
        {items.map((item, index) => (
          <CardLink key={index} item={item} className="aspect-4/3" />
        ))}
      </div>
    </section>
  )
}
