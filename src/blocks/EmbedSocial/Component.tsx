'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { EmbedSocialBlock as EmbedSocialBlockProps } from '@/payload-types'

export const EmbedSocialBlock: React.FC<EmbedSocialBlockProps> = ({
  title,
  embedCode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showRetry, setShowRetry] = useState(false)

  const injectEmbed = useCallback(() => {
    const container = containerRef.current
    if (!container || !embedCode) return

    container.innerHTML = ''
    setShowRetry(false)

    // Remove any existing EmbedSocial script so it re-initializes
    const existingScript = document.getElementById('EmbedSocialHashtagScript')
    if (existingScript) existingScript.remove()

    const range = document.createRange()
    range.selectNode(container)
    const fragment = range.createContextualFragment(embedCode)
    container.appendChild(fragment)

    // Show retry button if nothing rendered after 5s
    const timeout = setTimeout(() => {
      if (container && container.clientHeight < 50) {
        setShowRetry(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [embedCode])

  useEffect(() => {
    const cleanup = injectEmbed()
    return () => {
      cleanup?.()
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [injectEmbed])

  if (!embedCode) return null

  return (
    <section className="container py-16">
      <div className="text-center mb-10">
        {title && <h2 className="text-3xl font-bold">{title}</h2>}
        {showRetry && (
          <button
            type="button"
            onClick={injectEmbed}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-accent-brand px-6 py-3 text-sm font-medium text-white hover:bg-accent-brand/90 transition-colors"
          >
            Učitaj feed
          </button>
        )}
      </div>
      <div ref={containerRef} />
    </section>
  )
}
