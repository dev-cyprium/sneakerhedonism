import type { Block } from 'payload'

export const Novo: Block = {
  slug: 'novo',
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
  interfaceName: 'NovoBlock',
  labels: {
    plural: 'Novo',
    singular: 'Novo',
  },
}
