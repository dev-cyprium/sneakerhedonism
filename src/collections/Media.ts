import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

function getR2PublicURL(filename: string, prefix = 'media'): string {
  const base = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const path = [prefix, encodeURIComponent(filename)].filter(Boolean).join('/')
  return `${base.replace(/\/$/, '')}/${path}`
}

export const Media: CollectionConfig = {
  admin: {
    group: 'Content',
  },
  slug: 'media',
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (!doc?.filename) return doc
        const prefix = (doc as { prefix?: string }).prefix ?? 'media'
        const url = getR2PublicURL(doc.filename, prefix)
        return { ...doc, url }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: true,
}
