import type { Block } from 'payload'

export const BlogFeed: Block = {
  slug: 'blogFeed',
  interfaceName: 'BlogFeedBlock',
  labels: {
    singular: 'Blog Feed',
    plural: 'Blog Feed',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Blog',
    },
    {
      name: 'postsPerPage',
      type: 'number',
      defaultValue: 50,
      admin: {
        description: 'Number of posts to show (default: 50)',
      },
    },
  ],
}
