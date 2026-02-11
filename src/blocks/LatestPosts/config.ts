import type { Block } from 'payload'

export const LatestPosts: Block = {
  slug: 'latestPosts',
  interfaceName: 'LatestPostsBlock',
  labels: {
    singular: 'Latest Posts',
    plural: 'Latest Posts',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Najnovije sa bloga',
    },
  ],
}
