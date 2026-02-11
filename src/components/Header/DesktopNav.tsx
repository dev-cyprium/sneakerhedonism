'use client'

import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { NormalizedNavItem } from './index'

interface Props {
  items: NormalizedNavItem[]
}

export function DesktopNav({ items }: Props) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = useCallback((id: string | null) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
      closeTimeout.current = null
    }
    setOpenDropdown(id)
  }, [])

  const close = useCallback(() => {
    closeTimeout.current = setTimeout(() => setOpenDropdown(null), 100)
  }, [])

  if (!items?.length) return null

  return (
    <>
      <ul className="relative z-20 hidden md:flex items-stretch gap-0 font-nav">
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const isActive =
            item.href && item.href !== '/' ? pathname.includes(item.href) : false
          const isOpen = openDropdown === item.id

          if (hasChildren) {
            return (
              <li
                key={item.id}
                className="relative"
                onMouseEnter={() => open(item.id)}
                onMouseLeave={close}
              >
                <button
                  className={cn(
                    'navLink flex items-center gap-1.5 px-5 py-5 text-[15px] font-extrabold uppercase tracking-wide text-nav-text hover:text-nav-text-hover transition-colors',
                    { active: isActive || isOpen },
                  )}
                >
                  <span className="navLink-bar">{item.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-0 top-full z-50 min-w-[220px] rounded-lg bg-dropdown-bg py-4 px-6 shadow-xl"
                    >
                      <ul className="flex flex-col gap-1">
                        {item.children!.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              {...(child.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                              className="block py-2 text-sm text-dropdown-text hover:text-white transition-colors"
                            >
                              {child.label}
                              {child.badge && (
                                <span className="ml-2 inline-block rounded bg-accent-brand px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          }

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                {...(item.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={cn(
                  'navLink flex items-center px-5 py-5 text-[15px] font-extrabold uppercase tracking-wide text-nav-text hover:text-nav-text-hover transition-colors',
                  { active: isActive },
                )}
              >
                <span className="navLink-bar">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Dim overlay — portaled outside header stacking context so it doesn't dim the nav */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {openDropdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-10 bg-black/40"
                onMouseEnter={() => setOpenDropdown(null)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
