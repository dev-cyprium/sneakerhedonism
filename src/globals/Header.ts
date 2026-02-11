import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateHeader],
  },
  fields: [
    {
      name: 'announcementEnabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Announcement Bar',
    },
    {
      name: 'announcementText',
      type: 'text',
      label: 'Announcement Text',
      admin: {
        condition: (_, siblingData) => siblingData?.announcementEnabled,
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'navType',
          type: 'select',
          label: 'Link Type',
          defaultValue: 'link',
          options: [
            { label: 'Manual Link', value: 'link' },
            { label: 'Category', value: 'category' },
            { label: 'Category + Subcategories', value: 'categoryWithChildren' },
          ],
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_: Record<string, unknown>, siblingData: Record<string, unknown>) =>
                !siblingData?.navType || siblingData?.navType === 'link',
            },
          },
        }),
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          label: 'Category',
          admin: {
            condition: (_, siblingData) => siblingData?.navType === 'category',
          },
        },
        {
          name: 'parentCategory',
          type: 'relationship',
          relationTo: 'categories',
          label: 'Parent Category',
          admin: {
            condition: (_, siblingData) => siblingData?.navType === 'categoryWithChildren',
            description: 'Select a top-level category. Its subcategories will auto-populate as dropdown children.',
          },
          filterOptions: () => ({
            parent: { exists: false },
          }),
        },
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown Children',
          admin: {
            condition: (_, siblingData) =>
              !siblingData?.navType || siblingData?.navType === 'link',
          },
          fields: [
            link({
              appearances: false,
            }),
            {
              name: 'badge',
              type: 'text',
              label: 'Badge (e.g. NEW)',
            },
          ],
        },
      ],
      maxRows: 8,
    },
  ],
}
