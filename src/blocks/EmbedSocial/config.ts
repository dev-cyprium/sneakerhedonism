import type { Block } from 'payload'

export const EmbedSocial: Block = {
  slug: 'embedSocial',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
      defaultValue: 'Instagram',
    },
    {
      name: 'instagramUrl',
      type: 'text',
      required: true,
      label: 'Instagram URL',
      defaultValue: 'https://www.instagram.com/_sneakerhedonism_/',
    },
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
