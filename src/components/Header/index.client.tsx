'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { Suspense } from 'react'

import type { Header, Media } from '@/payload-types'
import type { NormalizedNavItem } from './index'

import { LogoIcon } from '@/components/icons/logo'
import { AnnouncementBar } from './AnnouncementBar'
import { DesktopNav } from './DesktopNav'
import { HeaderIcons } from './HeaderIcons'
import { MobileMenu } from './MobileMenu'

type Props = {
  header: Header
  navItems: NormalizedNavItem[]
}

export function HeaderClient({ header, navItems }: Props) {
  const logo = header.logo as Media | undefined

  return (
    <>
      <AnnouncementBar enabled={header.announcementEnabled} text={header.announcementText} />
      <header className="sticky top-0 z-20 border-b border-header-border bg-background">
        <nav className="relative z-20 flex items-center justify-between container">
          {/* Mobile hamburger — left side */}
          <div className="order-first block flex-none md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={navItems} />
            </Suspense>
          </div>

          {/* Logo — smaller on mobile */}
          <Link className="flex flex-1 justify-center items-center shrink-0 py-4 md:flex-initial md:flex-none" href="/">
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || 'Logo'}
                width={logo.width || 160}
                height={logo.height || 32}
                className="h-5 w-auto md:h-7"
              />
            ) : (
              <LogoIcon className="h-5 w-auto md:h-7" />
            )}
          </Link>

          {/* Desktop nav — centered */}
          <DesktopNav items={navItems} />

          {/* Icons */}
          <HeaderIcons />
        </nav>
      </header>
    </>
  )
}
