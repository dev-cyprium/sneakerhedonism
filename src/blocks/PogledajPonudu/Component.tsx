import type { Media as MediaType, PogledajPonuduBlock as PogledajPonuduBlockProps } from '@/payload-types'
import type { DefaultDocumentIDType } from 'payload'

import { Media } from '@/components/Media'
import Link from 'next/link'
import React from 'react'

export const PogledajPonuduBlock: React.FC<
  PogledajPonuduBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = ({ heading, items }) => {
  if (!items || items.length < 3) return null

  const [first, second, third] = items

  return (
    <section className="container">
      {heading && (
        <h2 className="text-center text-2xl font-bold uppercase tracking-wide mb-6 md:mb-8">
          {heading}
        </h2>
      )}

      {/* Desktop: 1 large left + 2 small right */}
      <div className="hidden md:grid md:grid-cols-5 md:grid-rows-2 gap-4 md:aspect-[2.4/1]">
        <Link
          href={first.link}
          className="relative col-span-3 row-span-2 overflow-hidden rounded-lg group"
        >
          <Media
            className="h-full w-full"
            imgClassName="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
            resource={first.image as MediaType}
          />
          <div className="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/20" />
          <span className="absolute bottom-4 left-4 text-sm font-bold uppercase tracking-wider text-white drop-shadow-lg">
            {first.label}
          </span>
        </Link>

        <Link
          href={second.link}
          className="relative col-span-2 row-span-1 overflow-hidden rounded-lg group"
        >
          <Media
            className="h-full w-full"
            imgClassName="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
            resource={second.image as MediaType}
          />
          <div className="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/20" />
          <span className="absolute bottom-4 left-4 text-sm font-bold uppercase tracking-wider text-white drop-shadow-lg">
            {second.label}
          </span>
        </Link>

        <Link
          href={third.link}
          className="relative col-span-2 row-span-1 overflow-hidden rounded-lg group"
        >
          <Media
            className="h-full w-full"
            imgClassName="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
            resource={third.image as MediaType}
          />
          <div className="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/20" />
          <span className="absolute bottom-4 left-4 text-sm font-bold uppercase tracking-wider text-white drop-shadow-lg">
            {third.label}
          </span>
        </Link>
      </div>

      {/* Mobile: 3 stacked */}
      <div className="flex flex-col gap-4 md:hidden">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.link}
            className="relative aspect-[4/3] overflow-hidden rounded-lg group"
          >
            <Media
              className="h-full w-full"
              imgClassName="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
              resource={item.image as MediaType}
            />
            <div className="absolute inset-0 bg-black/0 transition duration-300 ease-in-out group-hover:bg-black/20" />
            <span className="absolute bottom-4 left-4 text-sm font-bold uppercase tracking-wider text-white drop-shadow-lg">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
