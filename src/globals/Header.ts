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
        link({
          appearances: false,
        }),
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown Children',
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
