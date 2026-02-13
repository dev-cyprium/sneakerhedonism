import type { CollectionConfig } from 'payload'

export const SizeGuides: CollectionConfig = {
  slug: 'size-guides',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Brand-specific size guides. Link to categories (parent or child). Leave categories empty for the default site guide.',
    defaultColumns: ['title', 'categories'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "New Balance" or "Default"',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description:
          'Categories (brands) this guide applies to. Leave empty to use as the default site guide.',
        position: 'sidebar',
      },
    },
    {
      name: 'rows',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Size row',
        plural: 'Size rows',
      },
      fields: [
        {
          name: 'size',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. "38.5", "S", "M"',
          },
        },
        {
          name: 'length',
          type: 'number',
          required: true,
          admin: {
            description: 'Dužina (cm)',
          },
        },
        {
          name: 'width',
          type: 'number',
          required: true,
          admin: {
            description: 'Širina (cm)',
          },
        },
      ],
    },
  ],
}
