import type { Block } from 'payload'

export const EmbedSocial: Block = {
  slug: 'embedSocial',
  fields: [
    {
      name: 'embedCode',
      type: 'code',
      required: true,
      label: 'EmbedSocial Embed Code',
      admin: {
        language: 'html',
        description: 'Paste your EmbedSocial embed code here (the full script + div snippet)',
      },
    },
  ],
  interfaceName: 'EmbedSocialBlock',
  labels: {
    plural: 'EmbedSocial',
    singular: 'EmbedSocial',
  },
}
