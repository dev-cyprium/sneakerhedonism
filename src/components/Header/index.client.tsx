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
        <nav className="flex items-center justify-between container py-3">
          <div className="block flex-none md:hidden">
            <Suspense fallback={null}>
              <MobileMenu menu={menu} />
            </Suspense>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-6">
              <Link className="flex items-center" href="/">
                {logo?.url ? (
                  <Image
                    src={logo.url}
                    alt={logo.alt || 'Logo'}
                    width={logo.width || 32}
                    height={logo.height || 32}
                    className="h-8 w-auto"
                  />
                ) : (
                  <LogoIcon className="w-6 h-auto" />
                )}
              </Link>
              <DesktopNav items={menu} />
            </div>

            <HeaderIcons />
          </div>
        </nav>
      </header>
    </>
  )
}
