import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Category, Header as HeaderType, Page } from '@/payload-types'

import './index.css'
import { HeaderClient } from './index.client'

export type NormalizedNavItem = {
  id: string
  label: string
  href: string
  newTab?: boolean
  badge?: string | null
  children?: {
    id: string
    label: string
    href: string
    newTab?: boolean
    badge?: string | null
  }[]
}

function resolveHref(link: NonNullable<NonNullable<HeaderType['navItems']>[number]['link']>): string | null {
  if (link.type === 'reference') {
    const ref = link.reference
    if (ref && typeof ref.value === 'object' && 'slug' in ref.value) {
      const doc = ref.value as Page
      return ref.relationTo !== 'pages' ? `/${ref.relationTo}/${doc.slug}` : `/${doc.slug}`
    }
    return null
  }
  return link.url || null
}

async function normalizeNavItems(navItems: HeaderType['navItems']): Promise<NormalizedNavItem[]> {
  if (!navItems?.length) return []

  const payload = await getPayload({ config: configPromise })
  const result: NormalizedNavItem[] = []

  for (const item of navItems) {
    const linkType = item.navType || 'link'

    if (linkType === 'category') {
      const cat = item.category as Category | number | null | undefined
      if (!cat) continue
      const category = typeof cat === 'object' ? cat : null
      if (!category) continue

      result.push({
        id: item.id || String(category.id),
        label: category.title,
        href: `/shop?category=${category.slug}`,
        badge: category.isNew ? 'NEW' : null,
      })
    } else if (linkType === 'categoryWithChildren') {
      const cat = item.parentCategory as Category | number | null | undefined
      if (!cat) continue
      const parentCat = typeof cat === 'object' ? cat : null
      if (!parentCat) continue

      const subcategories = await payload.find({
        collection: 'categories',
        where: { parent: { equals: parentCat.id } },
        sort: 'title',
        limit: 50,
      })

      result.push({
        id: item.id || String(parentCat.id),
        label: parentCat.title,
        href: `/shop?category=${parentCat.slug}`,
        children: subcategories.docs.map((sub) => ({
          id: String(sub.id),
          label: sub.title,
          href: `/shop?category=${sub.slug}`,
          badge: sub.isNew ? 'NEW' : null,
        })),
      })
    } else {
      // Manual link
      const href = item.link ? resolveHref(item.link) : null
      if (!href) continue

      result.push({
        id: item.id || href,
        label: item.link?.label || '',
        href,
        newTab: item.link?.newTab || false,
        children: item.children?.map((child) => {
          const childHref = child.link ? resolveHref(child.link) : null
          if (!childHref) return null
          return {
            id: child.id || childHref,
            label: child.link?.label || '',
            href: childHref,
            newTab: child.link?.newTab || false,
            badge: child.badge,
          }
        }).filter((c): c is NonNullable<typeof c> => c !== null),
      })
    }
  }

  return result
}

export async function Header() {
  const header = await getCachedGlobal('header', 2)()
  const navItems = await normalizeNavItems(header.navItems)

  return <HeaderClient header={header} navItems={navItems} />
}
