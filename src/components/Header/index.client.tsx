'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { Suspense } from 'react'

import type { Header, Media } from '@/payload-types'

import { LogoIcon } from '@/components/icons/logo'
import { AnnouncementBar } from './AnnouncementBar'
import { DesktopNav } from './DesktopNav'
import { HeaderIcons } from './HeaderIcons'
import { MobileMenu } from './MobileMenu'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || []
  const logo = header.logo as Media | undefined

  return (
    <>
      <AnnouncementBar enabled={header.announcementEnabled} text={header.announcementText} />
      <header className="sticky top-0 z-20 border-b border-header-border bg-background">
        <nav className="relative z-20 flex items-center justify-between container">
          {/* Mobile hamburger */}
          <div className="block flex-none md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu} />
            </Suspense>
          </div>

          {/* Logo */}
          <Link className="flex items-center shrink-0 py-3" href="/">
            {logo?.url ? (
              <Image
                src={logo.url}
                alt={logo.alt || 'Logo'}
                width={logo.width || 160}
                height={logo.height || 32}
                className="h-6 w-auto"
              />
            ) : (
              <LogoIcon className="w-6 h-auto" />
            )}
          </Link>

          {/* Desktop nav — centered */}
          <DesktopNav items={menu} />

          {/* Icons */}
          <HeaderIcons />
        </nav>
      </header>
    </>
  )
}
