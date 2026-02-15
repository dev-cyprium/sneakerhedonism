import type { Footer as FooterType, Media as MediaType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
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
          <div className="footer-layout py-10 md:py-14">
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
              <ul className="footer-payment-list grid grid-cols-3 gap-3 sm:grid-cols-4 md:flex md:flex-nowrap md:items-center md:justify-start md:gap-4">
                {paymentCards.map((card, index) => {
                  const image = typeof card.image === 'object' ? (card.image as MediaType) : null

                  if (!image) return null

                  const cardImage = (
                    <Media
                      className="footer-payment-image"
                      imgClassName="h-8 w-auto object-contain"
                      resource={image}
                    />
                  )

                  return (
                    <li className="footer-payment-item flex items-center justify-center" key={card.id || index}>
                      {card.url ? (
                        <a
                          className="footer-payment-link opacity-90 transition-opacity hover:opacity-100"
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
