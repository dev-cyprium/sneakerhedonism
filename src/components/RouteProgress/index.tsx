'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export const RouteProgress: React.FC = () => {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = React.useState(false)
  const prevPathname = React.useRef(pathname)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(null)

  React.useEffect(() => {
    if (pathname !== prevPathname.current) {
      setIsNavigating(false)
      prevPathname.current = pathname
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        anchor.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey
      ) {
        return
      }

      if (href !== prevPathname.current) {
        setIsNavigating(true)
        timeoutRef.current = setTimeout(() => setIsNavigating(false), 5000)
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div className="h-full w-full bg-accent-brand animate-progress origin-left" />
    </div>
  )
}
