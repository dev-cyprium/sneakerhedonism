'use client'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'
import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

import type { Header } from '@/payload-types'

interface Props {
  items: Header['navItems']
}

export function DesktopNav({ items }: Props) {
  const pathname = usePathname()

  if (!items?.length) return null

  return (
    <ul className="hidden gap-4 text-sm md:flex md:items-center">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0
        const isActive =
          item.link.url && item.link.url !== '/' ? pathname.includes(item.link.url) : false

        if (hasChildren) {
          return (
            <li key={item.id} className="group/nav relative">
              <button
                className={cn(
                  'relative navLink flex items-center gap-1 text-nav-text hover:text-nav-text-hover p-0 pt-2 pb-6 uppercase font-mono tracking-widest text-xs cursor-pointer',
                  { active: isActive },
                )}
              >
                {item.link.label}
                <ChevronDown className="h-3 w-3 transition-transform group-hover/nav:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 min-w-[200px] border border-header-border bg-background p-4 shadow-md opacity-0 transition-all group-hover/nav:visible group-hover/nav:opacity-100">
                <ul className="flex flex-col gap-2">
                  {item.children!.map((child) => (
                    <li key={child.id}>
                      <CMSLink
                        {...child.link}
                        label={null}
                        appearance="inline"
                        className="text-sm text-nav-text hover:text-nav-text-hover font-mono uppercase tracking-wider"
                      >
                        {child.link.label}
                        {child.badge && (
                          <span className="ml-2 inline-block rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                            {child.badge}
                          </span>
                        )}
                      </CMSLink>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        }

        return (
          <li key={item.id}>
            <CMSLink
              {...item.link}
              size="clear"
              className={cn('relative navLink', { active: isActive })}
              appearance="nav"
            />
          </li>
        )
      })}
    </ul>
  )
}
