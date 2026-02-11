'use client'

import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

import type { EmbedSocialBlock as EmbedSocialBlockProps } from '@/payload-types'

export const EmbedSocialBlock: React.FC<EmbedSocialBlockProps> = ({ title, instagramUrl, embedCode }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !embedCode) return

    const range = document.createRange()
    range.selectNode(container)
    const fragment = range.createContextualFragment(embedCode)
    container.appendChild(fragment)

    return () => {
      container.innerHTML = ''
    }
  }, [embedCode])

  if (!embedCode) return null

  return (
    <section className="container py-16">
      <div className="text-center mb-10">
        {title && <h2 className="text-3xl font-bold">{title}</h2>}
        {instagramUrl && (
          <Link
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors mt-4"
          >
            Pratite nas na Instagramu
          </Link>
        )}
      </div>
      <div ref={containerRef} />
    </section>
  )
}
