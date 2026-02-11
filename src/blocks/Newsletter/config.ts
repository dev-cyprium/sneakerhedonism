import type { Block } from 'payload'

export const Newsletter: Block = {
  slug: 'newsletter',
  interfaceName: 'NewsletterBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Sneaker Hedonism Newsletter',
    },
    {
      name: 'description',
      type: 'text',
      defaultValue:
        'Zanimaju te najnovije informacije, dropovi i ekskluzivni popusti? Prijavi se!',
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
  ],
  labels: {
    plural: 'Newsletter Blocks',
    singular: 'Newsletter Block',
  },
}
