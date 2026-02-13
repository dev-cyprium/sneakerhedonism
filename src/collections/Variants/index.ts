import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'
import type { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    group: 'Ecommerce',
    description: 'Product variants (size, color, etc.). Orphaned variants can be removed from the list below.',
    components: {
      ...defaultCollection?.admin?.components,
      afterList: ['@/components/admin/UnusedVariantsManager#UnusedVariantsManager'],
    },
  },
  endpoints: [
    ...(Array.isArray(defaultCollection.endpoints) ? defaultCollection.endpoints : []),
    {
      path: '/unused',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          throw new APIError('Unauthorized', 401)
        }

        const { docs } = await req.payload.find({
          collection: 'variants',
          where: {
            product: { exists: false },
          },
          depth: 0,
          limit: 500,
        })

        return Response.json({ docs })
      },
    },
  ],
})
