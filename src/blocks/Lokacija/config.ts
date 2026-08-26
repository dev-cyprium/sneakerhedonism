import type { Block } from 'payload'

import { resolveMapSrc } from './resolveMapSrc'

export const Lokacija: Block = {
  slug: 'lokacija',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'LOKACIJA',
      label: 'Naslov',
    },
    {
      name: 'image',
      type: 'upload',
      admin: {
        description: 'Fotografija lokala. Ako se ne postavi, mapa zauzima celu širinu.',
      },
      label: 'Slika',
      relationTo: 'media',
    },
    {
      name: 'imagePosition',
      type: 'select',
      admin: {
        description: 'Sa koje strane stoji slika (na mobilnom je uvek iznad mape).',
      },
      defaultValue: 'left',
      label: 'Pozicija slike',
      options: [
        { label: 'Levo', value: 'left' },
        { label: 'Desno', value: 'right' },
      ],
    },
    {
      name: 'mapEmbed',
      type: 'textarea',
      admin: {
        description:
          'Google Maps: Share → Embed a map. Nalepi ceo <iframe ...> kod, link, ili prosto upiši adresu — sve tri varijante rade.',
      },
      defaultValue:
        'https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sInternacionalnih+Brigada+11,+Beograd',
      label: 'Google mapa',
      required: true,
      validate: (value: unknown) =>
        resolveMapSrc(typeof value === 'string' ? value : null)
          ? true
          : 'Unesi važeći Google Maps embed link ili <iframe> kod.',
    },
    {
      name: 'address',
      type: 'text',
      defaultValue: 'Internacionalnih Brigada 11',
      label: 'Adresa',
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      defaultValue: 'Beograd',
      label: 'Grad',
      required: true,
    },
    {
      name: 'hours',
      type: 'text',
      admin: {
        description: 'Npr. „Ponedeljak–Subota 10–20h, Nedelja zatvoreno“.',
      },
      label: 'Radno vreme',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
    },
  ],
  interfaceName: 'LokacijaBlock',
  labels: {
    plural: 'Lokacija',
    singular: 'Lokacija',
  },
}
