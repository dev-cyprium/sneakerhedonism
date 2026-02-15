import type { Footer as FooterType, Media as MediaType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { SocialPlatformIcon } from '@/components/Footer/SocialPlatformIcon'
import { ScrollToTopButton } from '@/components/Footer/ScrollToTopButton'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Footer() {
  const footer: FooterType = await getCachedGlobal('footer', 2)()
  const columns = footer.columns || []
  const hasColumns = columns.length > 0
  const paymentCards = footer.paymentCards || []
  const fallbackNavItems = footer.navItems || []

  return (
    <>
      <footer className="footer-root mt-16 border-t border-border bg-background text-sm text-muted-foreground">
        <div className="container">
          <div className="footer-layout py-10 md:mx-auto md:max-w-6xl md:py-14">
            {hasColumns ? (
              <div className="footer-columns grid gap-10 md:grid-cols-3 md:gap-12">
                {columns.map((column, columnIndex) => (
                  <div className="footer-column space-y-8" key={column.id || `column-${columnIndex}`}>
                    {(column.sections || []).map((section, sectionIndex) => (
                      <section
                        className="footer-section space-y-4"
                        key={section.id || `${column.id || columnIndex}-section-${sectionIndex}`}
                      >
                        <h2 className="footer-section-title text-sm font-semibold text-foreground">
                          {section.title}
                        </h2>
                        <ul className="footer-section-items space-y-2.5">
                          {(section.items || []).map((item, itemIndex) => {
                            const itemKey =
                              item.id ||
                              `${section.id || `${column.id || columnIndex}-${sectionIndex}`}-item-${itemIndex}`

                            if (item.blockType === 'linkItem' && item.link) {
                              return (
                                <li className="footer-item leading-6" key={itemKey}>
                                  <CMSLink
                                    appearance="inline"
                                    className="footer-link transition-colors hover:text-foreground"
                                    {...item.link}
                                  />
                                </li>
                              )
                            }

                            if (item.blockType === 'textItem') {
                              const content = (
                                <span className="footer-text-row leading-6">{item.text}</span>
                              )

                              return (
                                <li className="footer-item leading-6" key={itemKey}>
                                  {item.url ? (
                                    <a
                                      className="footer-text-link transition-colors hover:text-foreground"
                                      href={item.url}
                                      rel={item.newTab ? 'noopener noreferrer' : undefined}
                                      target={item.newTab ? '_blank' : undefined}
                                    >
                                      {content}
                                    </a>
                                  ) : (
                                    content
                                  )}
                                </li>
                              )
                            }

                            if (item.blockType === 'richContentItem' && item.content) {
                              return (
                                <li className="footer-item footer-rich-item leading-6" key={itemKey}>
                                  <RichText
                                    className="footer-rich-content mx-0 max-w-none"
                                    data={item.content}
                                    enableGutter={false}
                                    enableProse={false}
                                  />
                                </li>
                              )
                            }

                            if (item.blockType === 'socialIconsRow' && item.links?.length) {
                              return (
                                <li className="footer-item footer-social-item leading-6" key={itemKey}>
                                  <ul className="footer-social-row flex items-center gap-3">
                                    {item.links.map((socialLink, socialIndex) => {
                                      const platformLabel =
                                        socialLink.platform === 'tiktok' ? 'TikTok' : 'Instagram'
                                      const linkKey =
                                        socialLink.id ||
                                        `${itemKey}-${socialLink.platform}-${socialIndex}`

                                      return (
                                        <li key={linkKey}>
                                          <a
                                            aria-label={socialLink.ariaLabel || platformLabel}
                                            className="footer-social-link inline-flex items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
                                            href={socialLink.url}
                                            rel={socialLink.newTab ? 'noopener noreferrer' : undefined}
                                            target={socialLink.newTab ? '_blank' : undefined}
                                          >
                                            <SocialPlatformIcon
                                              className="size-5"
                                              platform={socialLink.platform}
                                            />
                                          </a>
                                        </li>
                                      )
                                    })}
                                  </ul>
                                </li>
                              )
                            }

                            return null
                          })}
                        </ul>
                      </section>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="footer-columns grid gap-10 md:grid-cols-3 md:gap-12">
                <div className="footer-column space-y-4">
                  <h2 className="footer-section-title text-sm font-semibold text-foreground">
                    Footer Links
                  </h2>
                  <ul className="footer-section-items space-y-2.5">
                    {fallbackNavItems.map((item, index) => (
                      <li className="footer-item leading-6" key={item.id || `legacy-link-${index}`}>
                        <CMSLink
                          appearance="inline"
                          className="footer-link transition-colors hover:text-foreground"
                          {...item.link}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {paymentCards.length > 0 && (
          <div className="footer-payment-strip border-t border-border/70 py-6">
            <div className="container">
              <ul className="footer-payment-list grid grid-cols-3 gap-3 sm:grid-cols-4 md:flex md:flex-nowrap md:items-center md:justify-center md:gap-4">
                {paymentCards.map((card, index) => {
                  const image = typeof card.image === 'object' ? (card.image as MediaType) : null

                  if (!image) return null

                  const cardImage = (
                    <Media
                      className="footer-payment-image h-8 w-24"
                      fill
                      imgClassName="object-contain"
                      resource={image}
                    />
                  )

                  return (
                    <li
                      className="footer-payment-item flex h-10 w-full items-center justify-center md:w-28"
                      key={card.id || index}
                    >
                      {card.url ? (
                        <a
                          className="footer-payment-link inline-flex h-full w-full items-center justify-center opacity-90 transition-opacity hover:opacity-100"
                          href={card.url}
                          rel={card.newTab ? 'noopener noreferrer' : undefined}
                          target={card.newTab ? '_blank' : undefined}
                        >
                          {cardImage}
                        </a>
                      ) : (
                        cardImage
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </footer>

      {footer.scrollToTop?.enabled !== false && (
        <ScrollToTopButton
          ariaLabel={footer.scrollToTop?.ariaLabel}
          showAfterPx={footer.scrollToTop?.showAfterPx}
        />
      )}
    </>
  )
}
