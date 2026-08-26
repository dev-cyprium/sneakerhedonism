import type { Page } from '@/payload-types'

export type Banner = NonNullable<Page['hero']['banners']>[number]

/**
 * Resolves the destination of a banner CTA.
 * Category CTAs use the same shop URL shape as the header and product pages
 * (`/shop?category=<slug>`). Returns null when nothing resolves so the banner
 * can render without a link instead of pointing at a broken URL.
 */
export const resolveBannerHref = (banner: Banner): string | null => {
  const { ctaCategory, ctaPage, ctaType, ctaUrl } = banner

  if (ctaType === 'url') {
    return ctaUrl || null
  }

  if (ctaType === 'page') {
    if (typeof ctaPage === 'object' && ctaPage?.slug) {
      return ctaPage.slug === 'home' ? '/' : `/${ctaPage.slug}`
    }
    return null
  }

  if (typeof ctaCategory === 'object' && ctaCategory?.slug) {
    return `/shop?category=${ctaCategory.slug}`
  }

  return null
}
