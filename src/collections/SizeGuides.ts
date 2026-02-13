import type { CollectionConfig } from 'payload'

export const SizeGuides: CollectionConfig = {
  slug: 'size-guides',
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.rowType === 'clothes' && (!data.clothesRows || data.clothesRows.length === 0)) {
          throw new Error('Add at least one size row for clothes.')
        }
        if (
          data?.rowType === 'footwear' &&
          (!data.footwearRows || data.footwearRows.length === 0)
        ) {
          throw new Error('Add at least one size row for footwear.')
        }
        return data
      },
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description:
      'Brand-specific size guides. Link to categories (parent or child). Leave categories empty for the default site guide.',
    defaultColumns: ['title', 'rowType', 'categories'],
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
      name: 'rowType',
      type: 'select',
      required: true,
      defaultValue: 'clothes',
      options: [
        { label: 'Clothes (Size, Length, Width)', value: 'clothes' },
        { label: 'Footwear (EU, US, CM)', value: 'footwear' },
      ],
      admin: {
        description:
          'Choose the size table format. Clothes use length/width in cm; footwear use EU, US, and CM.',
      },
    },
    {
      name: 'clothesRows',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Size row',
        plural: 'Size rows',
      },
      admin: {
        description: 'Size rows for apparel (length/width in cm).',
        condition: (data) => data?.rowType === 'clothes',
      },
      fields: [
        {
          name: 'size',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "S", "M", "L"' },
        },
        {
          name: 'length',
          type: 'number',
          required: true,
          admin: { description: 'Dužina (cm)' },
        },
        {
          name: 'width',
          type: 'number',
          required: true,
          admin: { description: 'Širina (cm)' },
        },
      ],
    },
    {
      name: 'footwearRows',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Size row',
        plural: 'Size rows',
      },
      admin: {
        description: 'Size rows for footwear (EU, US, CM).',
        condition: (data) => data?.rowType === 'footwear',
      },
      fields: [
        {
          name: 'eu',
          type: 'number',
          required: true,
          admin: { description: 'EU size (e.g. 38, 39, 40)' },
        },
        {
          name: 'us',
          type: 'number',
          required: true,
          admin: { description: 'US size (e.g. 7, 7.5, 8)' },
        },
        {
          name: 'cm',
          type: 'number',
          required: true,
          admin: { description: 'Foot length (cm)' },
        },
      ],
    },
  ],
}
