import type { Block } from 'payload'

export const Popularno: Block = {
  slug: 'popularno',
  fields: [
    {
      name: 'limit',
      type: 'number',
      defaultValue: 8,
      label: 'Limit',
      admin: {
        step: 1,
      },
    },
  ],
  interfaceName: 'PopularnoBlock',
  labels: {
    plural: 'Popularno',
    singular: 'Popularno',
  },
}
