import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateFooter],
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Footer Columns',
      maxRows: 3,
      admin: {
        description:
          'Build the 3-column footer layout. Add up to three columns; each column can have multiple titled sections.',
      },
      fields: [
        {
          name: 'sections',
          type: 'array',
          minRows: 1,
          admin: {
            description: 'Each section can contain links and/or text rows.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'items',
              type: 'blocks',
              blocks: [
                {
                  slug: 'linkItem',
                  labels: {
                    singular: 'Link',
                    plural: 'Links',
                  },
                  fields: [
                    link({
                      appearances: false,
                    }),
                  ],
                },
                {
                  slug: 'textItem',
                  labels: {
                    singular: 'Text Row',
                    plural: 'Text Rows',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'url',
                      type: 'text',
                      label: 'Optional URL',
                    },
                    {
                      name: 'newTab',
                      type: 'checkbox',
                      label: 'Open URL in new tab',
                      admin: {
                        condition: (_, siblingData) => Boolean(siblingData?.url),
                      },
                    },
                  ],
                },
                {
                  slug: 'socialIconsRow',
                  labels: {
                    singular: 'Social Icons Row',
                    plural: 'Social Icons Rows',
                  },
                  fields: [
                    {
                      name: 'links',
                      type: 'array',
                      minRows: 1,
                      fields: [
                        {
                          name: 'platform',
                          type: 'select',
                          required: true,
                          defaultValue: 'instagram',
                          options: [
                            {
                              label: 'Instagram',
                              value: 'instagram',
                            },
                            {
                              label: 'TikTok',
                              value: 'tiktok',
                            },
                          ],
                        },
                        {
                          name: 'url',
                          type: 'text',
                          required: true,
                        },
                        {
                          name: 'newTab',
                          type: 'checkbox',
                          label: 'Open in new tab',
                          defaultValue: true,
                        },
                        {
                          name: 'ariaLabel',
                          type: 'text',
                          label: 'Accessibility label',
                          admin: {
                            description: 'Optional. Falls back to platform name.',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: 'richContentItem',
                  labels: {
                    singular: 'Rich Content',
                    plural: 'Rich Content',
                  },
                  fields: [
                    {
                      name: 'content',
                      type: 'richText',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'paymentCards',
      type: 'array',
      label: 'Payment Card Images',
      admin: {
        description:
          'Displayed in one row at the footer bottom on desktop and wrapped into multiple rows on smaller screens.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'Optional URL',
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open URL in new tab',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.url),
          },
        },
      ],
    },
    {
      name: 'scrollToTop',
      type: 'group',
      label: 'Scroll To Top Button',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show floating arrow button',
          defaultValue: true,
        },
        {
          name: 'showAfterPx',
          type: 'number',
          label: 'Show after scrolling (px)',
          defaultValue: 260,
          min: 0,
        },
        {
          name: 'ariaLabel',
          type: 'text',
          label: 'Accessibility label',
          defaultValue: 'Back to top',
          required: true,
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      admin: {
        hidden: true,
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
