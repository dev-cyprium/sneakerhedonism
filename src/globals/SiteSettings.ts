import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
    description: 'Default size guide shown when no brand-specific guide exists.',
  },
  fields: [
    {
      name: 'defaultSizeGuide',
      type: 'relationship',
      relationTo: 'size-guides',
      admin: {
        description:
          'Size guide to show when the product has no matching brand-specific guide. Leave empty to use the built-in default.',
      },
    },
  ],
}
