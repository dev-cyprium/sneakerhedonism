'use client'

import React, { useEffect, useRef } from 'react'

import type { EmbedSocialBlock as EmbedSocialBlockProps } from '@/payload-types'

export const EmbedSocialBlock: React.FC<EmbedSocialBlockProps> = ({ embedCode }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !embedCode) return

    // Parse the embed code and insert HTML + execute scripts
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
      <div ref={containerRef} />
    </section>
  )
}
