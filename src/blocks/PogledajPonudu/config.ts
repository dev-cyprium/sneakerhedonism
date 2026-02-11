import type { Block } from 'payload'

export const PogledajPonudu: Block = {
  slug: 'pogledajPonudu',
  interfaceName: 'PogledajPonuduBlock',
  labels: {
    plural: 'Pogledaj Ponudu',
    singular: 'Pogledaj Ponudu',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'POGLEDAJ PONUDU',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
          admin: {
            description: 'URL to link to (e.g. /products?category=patike)',
          },
        },
      ],
    },
  ],
}
