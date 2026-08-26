import type { DefaultDocumentIDType } from 'payload'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import React from 'react'

import type { LokacijaBlock as LokacijaBlockProps, Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/cn'

import { resolveMapSrc } from './resolveMapSrc'

const InfoRow: React.FC<{ children: React.ReactNode; icon: React.ReactNode }> = ({
  children,
  icon,
}) => (
  <div className="flex items-start gap-3">
    <span aria-hidden className="mt-0.5 shrink-0 text-accent-brand">
      {icon}
    </span>
    <div className="min-w-0 text-sm md:text-base">{children}</div>
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
          'grid items-start gap-6 md:gap-8',
          media ? 'md:grid-cols-2' : 'md:grid-cols-1',
        )}
      >
        {media && (
          <div
            className={cn(
              'relative aspect-4/3 overflow-hidden rounded-xl md:aspect-square',
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

        <div className={cn('flex flex-col gap-5', imagePosition === 'right' ? 'md:order-1' : 'md:order-2')}>
          {mapSrc && (
            <iframe
              allowFullScreen
              className="aspect-4/3 w-full rounded-xl border border-border md:aspect-video"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title={`Mapa — ${fullAddress || 'lokacija'}`}
            />
          )}

          <div className="flex flex-col gap-3 text-foreground">
            {fullAddress && (
              <InfoRow icon={<MapPin className="size-5" />}>
                <span className="font-semibold">{address}</span>
                {city && <span className="text-muted-foreground">, {city}</span>}
              </InfoRow>
            )}

            {hours && <InfoRow icon={<Clock className="size-5" />}>{hours}</InfoRow>}

            {phone && (
              <InfoRow icon={<Phone className="size-5" />}>
                <a className="transition-colors hover:text-accent-brand" href={`tel:${phone.replace(/\s+/g, '')}`}>
                  {phone}
                </a>
              </InfoRow>
            )}

            {email && (
              <InfoRow icon={<Mail className="size-5" />}>
                <a className="break-all transition-colors hover:text-accent-brand" href={`mailto:${email}`}>
                  {email}
                </a>
              </InfoRow>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
