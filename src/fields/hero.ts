import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from './linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Video Hero',
          value: 'videoHero',
        },
        {
          label: 'Banner Slider',
          value: 'bannerHero',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      admin: {
        condition: (_, { type } = {}) => type !== 'bannerHero',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        admin: {
          condition: (_: unknown, { type }: { type?: string } = {}) => type !== 'bannerHero',
        },
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) =>
          ['videoHero', 'highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'banners',
      type: 'array',
      admin: {
        condition: (_, { type } = {}) => type === 'bannerHero',
        description:
          'Baneri koji se smenjuju u heru. Svaki baner ima svoju sliku, tekst i dugme (npr. jedan za radnju, jedan za kategoriju).',
        initCollapsed: true,
      },
      labels: {
        plural: 'Baneri',
        singular: 'Baner',
      },
      maxRows: 6,
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          admin: {
            description: 'Pozadinska slika banera (preporuka: široka slika, npr. 2000x1000).',
          },
          relationTo: 'media',
          required: true,
        },
        {
          name: 'mobileImage',
          type: 'upload',
          admin: {
            description: 'Opciono. Uspravna slika za telefone. Ako je prazno, koristi se glavna slika.',
          },
          relationTo: 'media',
        },
        {
          name: 'eyebrow',
          type: 'text',
          admin: {
            description: 'Opciono. Mali tekst iznad naslova, npr. "NOVO".',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'subheading',
          type: 'textarea',
          label: 'Podnaslov',
          admin: {
            description:
              'Pritisni Enter za novi red — tekst se prikazuje u onoliko redova koliko ovde upišeš.',
          },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          admin: {
            description:
              'Tekst na dugmetu, npr. "Pogledaj kolekciju". Ako je prazno, ceo baner je klikabilan bez dugmeta.',
          },
          label: 'CTA dugme — tekst',
        },
        {
          name: 'ctaType',
          type: 'select',
          defaultValue: 'category',
          label: 'CTA vodi na',
          options: [
            {
              label: 'Kategoriju',
              value: 'category',
            },
            {
              label: 'Stranicu',
              value: 'page',
            },
            {
              label: 'Custom URL',
              value: 'url',
            },
          ],
        },
        {
          name: 'ctaCategory',
          type: 'relationship',
          admin: {
            condition: (_, siblingData) => siblingData?.ctaType === 'category',
          },
          label: 'Kategorija',
          relationTo: 'categories',
        },
        {
          name: 'ctaPage',
          type: 'relationship',
          admin: {
            condition: (_, siblingData) => siblingData?.ctaType === 'page',
          },
          label: 'Stranica',
          relationTo: 'pages',
        },
        {
          name: 'ctaUrl',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.ctaType === 'url',
            description: 'Npr. Google Maps lokacija radnje, tel: broj ili spoljni link.',
          },
          label: 'Custom URL',
        },
        {
          name: 'newTab',
          type: 'checkbox',
          admin: {
            condition: (_, siblingData) => siblingData?.ctaType === 'url',
          },
          label: 'Otvori u novom tabu',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'textPosition',
              type: 'select',
              admin: {
                width: '33%',
              },
              defaultValue: 'left',
              label: 'Pozicija teksta',
              options: [
                {
                  label: 'Levo',
                  value: 'left',
                },
                {
                  label: 'Centar',
                  value: 'center',
                },
                {
                  label: 'Desno',
                  value: 'right',
                },
              ],
            },
            {
              name: 'textColor',
              type: 'select',
              admin: {
                description: 'Izaberi boju koja se najbolje vidi na ovoj slici.',
                width: '33%',
              },
              defaultValue: 'white',
              label: 'Boja teksta',
              options: [
                {
                  label: 'Bela',
                  value: 'white',
                },
                {
                  label: 'Krem',
                  value: 'cream',
                },
                {
                  label: 'Svetlo braon (brend)',
                  value: 'brandLight',
                },
                {
                  label: 'Tamno braon (brend)',
                  value: 'brand',
                },
                {
                  label: 'Crna',
                  value: 'black',
                },
              ],
            },
            {
              name: 'overlayOpacity',
              type: 'number',
              admin: {
                description: 'Zatamnjenje cele slike (0–80).',
                step: 5,
                width: '33%',
              },
              defaultValue: 40,
              label: 'Zatamnjenje (%)',
              max: 80,
              min: 0,
            },
          ],
        },
        {
          name: 'textScrim',
          type: 'checkbox',
          admin: {
            description:
              'Blaga senka samo ispod teksta (ne preko cele slike), da tekst ostane čitljiv. Isključi ako je slika mirna i tekst se i bez toga dobro vidi.',
          },
          defaultValue: true,
          label: 'Senka ispod teksta',
        },
      ],
    },
  ],
  label: false,
}
