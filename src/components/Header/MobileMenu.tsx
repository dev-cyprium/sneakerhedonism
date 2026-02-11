'use client'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { Heart, MenuIcon, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface Props {
  menu: Header['navItems']
}

export function MobileMenu({ menu }: Props) {
  const { user } = useAuth()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:bg-black dark:text-white">
        <MenuIcon className="h-4" />
      </SheetTrigger>

      <SheetContent side="left" className="px-4 overflow-y-auto">
        <SheetHeader className="px-0 pt-4 pb-0">
          <SheetTitle>Sneaker Hedonism</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="py-4">
          {menu?.length ? (
            <Accordion type="multiple" className="w-full">
              {menu.map((item) => {
                const hasChildren = item.children && item.children.length > 0

                if (hasChildren) {
                  return (
                    <AccordionItem key={item.id} value={item.id || ''}>
                      <AccordionTrigger className="text-sm uppercase font-mono tracking-widest">
                        {item.link.label}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="flex flex-col gap-2 pl-4">
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
                      </AccordionContent>
                    </AccordionItem>
                  )
                }

                return (
                  <div key={item.id} className="py-4 border-b last:border-b-0">
                    <CMSLink {...item.link} appearance="inline" className="text-sm uppercase font-mono tracking-widest" />
                  </div>
                )
              })}
            </Accordion>
          ) : null}
        </div>

        <div className="border-t pt-4 flex flex-col gap-3 md:hidden">
          <Link
            href="/shop"
            className="flex items-center gap-3 text-sm uppercase font-mono tracking-widest text-nav-text hover:text-nav-text-hover"
          >
            <Search className="h-4 w-4" />
            Pretraga
          </Link>
          <Link
            href="/wishlist"
            className="flex items-center gap-3 text-sm uppercase font-mono tracking-widest text-nav-text hover:text-nav-text-hover"
          >
            <Heart className="h-4 w-4" />
            Lista zelja
          </Link>
        </div>

        {user ? (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-sm uppercase font-mono tracking-widest mb-4">Moj nalog</h2>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders" className="text-sm text-nav-text hover:text-nav-text-hover">
                  Porudzbine
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="text-sm text-nav-text hover:text-nav-text-hover">
                  Adrese
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-sm text-nav-text hover:text-nav-text-hover">
                  Podesi nalog
                </Link>
              </li>
              <li className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/logout">Odjavi se</Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-sm uppercase font-mono tracking-widest mb-4">Nalog</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button asChild className="w-full sm:flex-1" variant="outline">
                <Link href="/login">Prijavi se</Link>
              </Button>
              <span className="text-center text-sm text-muted-foreground sm:text-base">ili</span>
              <Button asChild className="w-full sm:flex-1">
                <Link href="/create-account">Napravi nalog</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
