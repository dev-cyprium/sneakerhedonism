'use client'

import { ChevronUp } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/cn'

type ScrollToTopButtonProps = {
  ariaLabel?: string | null
  showAfterPx?: number | null
}

export function ScrollToTopButton({ ariaLabel, showAfterPx }: ScrollToTopButtonProps) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const threshold = typeof showAfterPx === 'number' && showAfterPx >= 0 ? showAfterPx : 260

    const handleScroll = () => {
      setVisible(window.scrollY > threshold)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [showAfterPx])

  return (
    <button
      aria-label={ariaLabel || 'Back to top'}
      className={cn(
        'footer-scroll-top fixed right-4 bottom-4 z-40 inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:right-6 md:bottom-6',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      type="button"
    >
      <ChevronUp className="size-5" />
    </button>
  )
}
