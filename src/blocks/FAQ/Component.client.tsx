'use client'

import { cn } from '@/utilities/cn'
import { RichText } from '@/components/RichText'
import type { DefaultDocumentIDType } from 'payload'
import type { FAQBlock as FAQBlockProps } from '@/payload-types'
import React, { useState } from 'react'

export const FAQBlock: React.FC<
  FAQBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = (props) => {
  const { items, className } = props
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!items?.length) return null

  return (
    <div className={cn('container py-16', className)}>
      <div className="flex flex-col gap-3 max-w-3xl mx-auto">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const hasContent = Boolean(item.expanded)

          return (
            <div key={index} className="flex flex-col gap-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={cn(
                  'flex items-center gap-3 w-full text-left px-5 py-4 rounded-full transition-all duration-300 ease-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isOpen
                    ? 'bg-accent-brand text-white'
                    : 'bg-primary text-primary-foreground hover:bg-nav-text'
                )}
              >
                <span
                  className={cn(
                    'shrink-0 w-5 h-5 flex items-center justify-center text-lg font-light transition-transform duration-300',
                    isOpen && 'rotate-180'
                  )}
                >
                  {isOpen ? '−' : '+'}
                </span>
                <span className="font-medium">{item.title}</span>
              </button>

              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  isOpen && hasContent ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                {hasContent && (
                  <div className="pt-4 pb-2 pl-8 pr-4">
                    <div className="prose prose-sm max-w-none text-foreground [&_h2]:text-accent-brand [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2">
                      <RichText data={item.expanded!} enableGutter={false} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
