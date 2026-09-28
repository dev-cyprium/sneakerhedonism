import type { DefaultDocumentIDType } from 'payload'
import { Clock, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import React from 'react'

import type { LokacijaBlock as LokacijaBlockProps, Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'

import { resolveMapSrc } from './resolveMapSrc'

const InfoTile: React.FC<{
  children: React.ReactNode
  icon: React.ReactNode
  label: string
  className?: string
}> = ({ children, className, icon, label }) => (
  <div
    className={cn(
      'flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-3 md:p-4',
      className,
    )}
  >
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-brand/10 text-accent-brand"
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-0.5 text-sm font-medium text-card-foreground">{children}</div>
    </div>
  </div>
)

export const LokacijaBlock: React.FC<
  LokacijaBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = ({ address, city, email, heading, hours, image, imagePosition, mapEmbed, phone }) => {
  const mapSrc = resolveMapSrc(mapEmbed)

  // A bad paste in the CMS shouldn't blank the whole section — the address and
  // contact details still stand on their own without the map.
  const media = image && typeof image === 'object' ? (image as MediaType) : null
  const fullAddress = [address, city].filter(Boolean).join(', ')
  const directionsHref = fullAddress
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
    : null

  if (!mapSrc && !fullAddress) return null

  return (
    <section className="container">
      {heading && (
        <h2 className="mb-6 text-center text-2xl font-bold uppercase tracking-wide text-foreground md:mb-10 md:text-3xl">
          {heading}
        </h2>
      )}

      <div
        className={cn(
          'grid gap-6 md:items-stretch md:gap-8',
          media ? 'md:grid-cols-2' : 'md:grid-cols-1',
        )}
      >
        {media && (
          <div
            className={cn(
              // On desktop the photo takes its height from the card next to it
              // so the two columns always line up regardless of how much info
              // the CMS provides.
              'relative aspect-4/3 overflow-hidden rounded-2xl md:aspect-auto md:min-h-[28rem]',
              imagePosition === 'right' ? 'md:order-2' : 'md:order-1',
            )}
          >
            <Media
              className="h-full w-full"
              fill
              imgClassName="h-full w-full object-cover object-center"
              resource={media}
            />
          </div>
        )}

        <div
          className={cn(
            'flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm',
            imagePosition === 'right' ? 'md:order-1' : 'md:order-2',
          )}
        >
          {mapSrc && (
            <iframe
              allowFullScreen
              className="aspect-4/3 w-full border-0 md:aspect-video"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title={`Mapa — ${fullAddress || 'lokacija'}`}
            />
          )}

          <div className="flex flex-1 flex-col gap-5 p-5 md:p-6">
            {fullAddress && (
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-brand text-white"
                >
                  <MapPin className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Adresa
                  </p>
                  <p className="text-lg font-bold leading-tight text-card-foreground md:text-xl">
                    {address}
                  </p>
                  {city && <p className="text-sm text-muted-foreground md:text-base">{city}</p>}
                </div>
              </div>
            )}

            {(hours || phone || email) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {hours && (
                  <InfoTile
                    className="sm:col-span-2"
                    icon={<Clock className="size-4" />}
                    label="Radno vreme"
                  >
                    {hours}
                  </InfoTile>
                )}

                {phone && (
                  <InfoTile icon={<Phone className="size-4" />} label="Telefon">
                    <a
                      className="transition-colors hover:text-accent-brand"
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                    >
                      {phone}
                    </a>
                  </InfoTile>
                )}

                {email && (
                  <InfoTile icon={<Mail className="size-4" />} label="Email">
                    <a
                      className="break-words transition-colors hover:text-accent-brand"
                      href={`mailto:${email}`}
                    >
                      {email}
                    </a>
                  </InfoTile>
                )}
              </div>
            )}

            {directionsHref && (
              <a
                className="mt-auto inline-flex items-center justify-center gap-2 self-start rounded-md bg-accent-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                href={directionsHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Navigation className="size-4" />
                Kako do nas
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
