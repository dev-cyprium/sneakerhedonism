import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  labels: {
    plural: 'FAQ',
    singular: 'FAQ',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        description: 'Add FAQ items with a question title and expanded answer content.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Question',
          admin: {
            description: 'The question shown in the pill.',
          },
        },
        {
          name: 'expanded',
          type: 'richText',
          required: true,
          label: 'Answer',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
          admin: {
            description: 'The answer content shown when expanded.',
          },
        },
      ],
    },
  ],
}
